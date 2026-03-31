import { UserProfile, Grade, Attendance, News, UserRole, ClassPerformance, StudentTrend } from '../types';
import { supabase } from '../supabase';

let currentUser: UserProfile | null = null;

export const dataService = {
  getCurrentUser: (): UserProfile | null => {
    return currentUser;
  },

  onAuthChange: (callback: (user: UserProfile | null) => void) => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const { data: userProfile, error } = await supabase
            .from('users')
            .select('*')
            .eq('uid', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            console.error('Error fetching user profile:', error);
            currentUser = null;
          } else if (userProfile) {
            currentUser = userProfile as UserProfile;
          } else {
            // User exists in Auth but not in 'users' table yet
            // We might need to create the profile if we have a pending role
            const pendingRole = localStorage.getItem('pending_role') as UserRole;
            if (pendingRole) {
              const profile: UserProfile = {
                uid: session.user.id,
                email: session.user.email || '',
                role: pendingRole,
                name: session.user.user_metadata.full_name || 'Пользователь',
                xp: 0,
                level: 1,
                streak: 0,
                lastActive: new Date().toISOString(),
              };

              if (pendingRole === 'parent') profile.childId = 'student_123';
              if (pendingRole === 'student') profile.class = '11A';

              const { data: newProfile, error: insertError } = await supabase
                .from('users')
                .insert([profile])
                .select()
                .single();

              if (!insertError) {
                currentUser = newProfile as UserProfile;
                localStorage.removeItem('pending_role');
              }
            } else {
              currentUser = null;
            }
          }
        } catch (error) {
          console.error('Error in auth change:', error);
          currentUser = null;
        }
      } else {
        currentUser = null;
      }
      callback(currentUser);
    });

    return () => subscription.unsubscribe();
  },

  login: async (role: UserRole = 'student'): Promise<UserProfile> => {
    localStorage.setItem('pending_role', role);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      }
    });

    if (error) throw error;
    
    return {} as UserProfile; 
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
    currentUser = null;
  },

  getGrades: async (studentId: string): Promise<Grade[]> => {
    const { data, error } = await supabase
      .from('grades')
      .select('*')
      .eq('studentId', studentId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Grade[];
  },

  addGrade: async (grade: Omit<Grade, 'id'>) => {
    const { data, error } = await supabase
      .from('grades')
      .insert([grade])
      .select()
      .single();

    if (error) throw error;
    return data as Grade;
  },

  getAttendance: async (studentId: string): Promise<Attendance[]> => {
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .eq('studentId', studentId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data as Attendance[];
  },

  addAttendance: async (record: Omit<Attendance, 'id'>) => {
    const { data, error } = await supabase
      .from('attendance')
      .insert([record])
      .select()
      .single();

    if (error) throw error;
    return data as Attendance;
  },

  getNews: async (): Promise<News[]> => {
    const { data, error } = await supabase
      .from('news')
      .select('*')
      .order('date', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data as News[];
  },

  addNews: async (item: Omit<News, 'id'>) => {
    const { data, error } = await supabase
      .from('news')
      .insert([item])
      .select()
      .single();

    if (error) throw error;
    return data as News;
  },

  subscribeToNews: (callback: (news: News[]) => void) => {
    const channel = supabase
      .channel('news_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'news' }, async () => {
        const news = await dataService.getNews();
        callback(news);
      })
      .subscribe();

    dataService.getNews().then(callback);

    return () => {
      supabase.removeChannel(channel);
    };
  },

  subscribeToGrades: (studentId: string, callback: (grades: Grade[]) => void) => {
    const channel = supabase
      .channel(`grades_${studentId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'grades',
        filter: `studentId=eq.${studentId}`
      }, async () => {
        const grades = await dataService.getGrades(studentId);
        callback(grades);
      })
      .subscribe();

    dataService.getGrades(studentId).then(callback);

    return () => {
      supabase.removeChannel(channel);
    };
  },

  getClassesPerformance: async (): Promise<ClassPerformance[]> => {
    const { data: students, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student');

    if (error) throw error;
    
    const classes = ['11A', '11B', '10A', '10B', '9A', '9B', '9C'];
    return classes.map(id => {
      const classStudents = (students || []).filter(s => s.class === id);
      const avgScore = classStudents.length > 0 
        ? Math.floor(classStudents.reduce((acc, s) => acc + (s.xp || 0), 0) / (classStudents.length * 100)) + 70 
        : 75;
      
      return {
        id,
        name: `Класс ${id}`,
        avgScore: Math.min(avgScore, 100),
        studentCount: classStudents.length || Math.floor(Math.random() * 10) + 20,
        trend: Math.random() > 0.6 ? 'up' : (Math.random() > 0.3 ? 'down' : 'stable')
      };
    });
  },

  getTopStudents: async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .order('xp', { ascending: false })
      .limit(3);

    if (error) throw error;
    return data as UserProfile[];
  },

  getStudentDynamics: async (): Promise<StudentTrend[]> => {
    const { data: students, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'student')
      .limit(5);

    if (error) throw error;
    
    const months = ['Сен', 'Окт', 'Ноя', 'Дек', 'Янв', 'Фев'];
    
    return (students || []).map(student => ({
      name: student.name,
      data: months.map((month, idx) => ({
        month,
        score: Math.min(70 + (student.xp || 0) / 100 + (idx * 2), 100)
      }))
    }));
  }
};
