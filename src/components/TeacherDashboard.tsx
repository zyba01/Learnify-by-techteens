import React, { useState, useMemo, useEffect } from 'react';
import { 
  BookOpen, 
  Users, 
  LayoutDashboard, 
  Settings, 
  LogOut,
  GraduationCap,
  Search,
  Download,
  ChevronRight,
  TrendingUp,
  Megaphone,
  Send,
  Tv,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '../lib/utils';
import { UserProfile, Grade, StudentTrend } from '../types';
import { dataService } from '../services/dataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { KioskMode } from './KioskMode';
import { motion } from 'framer-motion';

interface TeacherDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

interface StudentGrade {
  id: number;
  name: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
}

const SUBJECTS = [
  'Physics', 
  'Chemistry', 
  'Mathematics', 
  'Computer Science', 
  'World History', 
  'History of Kazakhstan'
];

const STUDENT_NAMES = [
  'Alikhanov A.',
  'Berikova D.',
  'Smagulov T.',
  'Ibraev M.',
  'Kassymova Z.',
  'Nurlanov E.',
  'Suleimenov B.'
];

export function TeacherDashboard({ profile, onLogout, theme, toggleTheme }: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('Diary / Gradebook');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [dynamics, setDynamics] = useState<StudentTrend[]>([]);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchDynamics = async () => {
      try {
        const data = await dataService.getStudentDynamics();
        setDynamics(data);
      } catch (error) {
        console.error('Error fetching student dynamics:', error);
      }
    };
    fetchDynamics();
  }, []);

  // Generate mock data for students
  const studentsData = useMemo(() => {
    return STUDENT_NAMES.map((name, index) => ({
      id: index + 1,
      name,
      q1: Math.floor(Math.random() * 41) + 60, // 60-100
      q2: Math.floor(Math.random() * 41) + 60,
      q3: Math.floor(Math.random() * 41) + 60,
      q4: Math.floor(Math.random() * 41) + 60,
    }));
  }, [selectedSubject]); // Re-generate when subject changes for variety

  const calculateFinal = (s: StudentGrade) => {
    return ((s.q1 + s.q2 + s.q3 + s.q4) / 4).toFixed(1);
  };

  const handlePublishNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return;
    setPublishing(true);
    try {
      await dataService.addNews({
        title: newsTitle,
        content: newsContent,
        summary: newsContent.slice(0, 100) + '...',
        date: new Date().toISOString(),
        authorId: profile.uid,
        category: 'announcement'
      });
      setNewsTitle('');
      setNewsContent('');
      alert('News published successfully!');
    } catch (error) {
      console.error('Error publishing news:', error);
    } finally {
      setPublishing(false);
    }
  };

  const menuItems = [
    { id: 'Diary / Gradebook', icon: BookOpen },
    { id: 'Student Dynamics', icon: TrendingUp },
    { id: 'Publish News', icon: Megaphone },
    { id: 'Wall Newspaper', icon: Tv },
  ];

  return (
    <div className={cn(
      "min-h-screen flex font-sans",
      theme === 'dark' ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
    )}>
      {/* Sidebar */}
      <aside className={cn(
        "w-72 border-r flex flex-col",
        theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200"
      )}>
        <div className="p-8 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-purple-500" />
          <span className="font-bold text-xl tracking-tight">AQBOBEK TEACHER</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group",
                activeTab === item.id 
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
                  : theme === 'dark' ? "text-gray-400 hover:bg-white/5 hover:text-white" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                activeTab === item.id ? "text-white" : "text-gray-500 group-hover:text-purple-500"
              )} />
              <span className="font-semibold">{item.id}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/10">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className={cn(
          "h-20 border-b flex items-center justify-between px-10",
          theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200"
        )}>
          <div className="flex items-center gap-2 text-gray-400">
            <span className="text-sm font-medium">Teacher Portal</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-sm font-bold text-white">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className={cn(
                "p-2 rounded-xl transition-colors",
                theme === 'dark' ? "bg-white/5 hover:bg-white/10" : "bg-gray-100 hover:bg-gray-200"
              )}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-purple-500" />}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center font-bold text-white">
                T
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold">{profile.name}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Senior Educator</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-10">
          {activeTab === 'Diary / Gradebook' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold">Class Gradebook</h2>
                <button className={cn(
                  "flex items-center gap-2 border px-4 py-2 rounded-lg text-sm font-bold transition-all",
                  theme === 'dark' ? "bg-gray-900 hover:bg-gray-800 border-white/10" : "bg-white hover:bg-gray-50 border-gray-200"
                )}>
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
              </div>

              {/* Subject Tabs */}
              <div className={cn(
                "flex gap-2 p-1 rounded-xl w-fit",
                theme === 'dark' ? "bg-gray-900" : "bg-gray-200"
              )}>
                {SUBJECTS.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={cn(
                      "px-6 py-2.5 rounded-lg text-sm font-bold transition-all",
                      selectedSubject === subject 
                        ? "bg-purple-500 text-white shadow-md" 
                        : "text-gray-400 hover:text-white hover:bg-gray-700"
                    )}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              {/* Gradebook Table */}
              <div className={cn(
                "border rounded-2xl overflow-hidden shadow-xl",
                theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200"
              )}>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className={cn(
                      "border-b",
                      theme === 'dark' ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                    )}>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">No.</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400">Student Name</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">1st Qtr (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">2nd Qtr (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">3rd Qtr (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-400 text-center">4th Qtr (%)</th>
                      <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-purple-500 text-center">Final Grade (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {studentsData.map((student) => (
                      <tr key={student.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="px-6 py-4 text-sm text-gray-500 font-medium">{student.id}</td>
                        <td className="px-6 py-4 text-sm font-bold group-hover:text-purple-500 transition-colors">
                          {student.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-center font-medium">{student.q1}%</td>
                        <td className="px-6 py-4 text-sm text-center font-medium">{student.q2}%</td>
                        <td className="px-6 py-4 text-sm text-center font-medium">{student.q3}%</td>
                        <td className="px-6 py-4 text-sm text-center font-medium">{student.q4}%</td>
                        <td className="px-6 py-4 text-sm text-center font-black text-purple-500 bg-purple-500/5">
                          {calculateFinal(student)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'Student Dynamics' && (
            <div className="space-y-10">
              <h2 className="text-3xl font-bold">Student Growth Dynamics</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {dynamics.map((student, i) => (
                  <div key={student.name} className={cn(
                    "p-8 rounded-[32px] border",
                    theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200 shadow-sm"
                  )}>
                    <div className="flex justify-between items-center mb-8">
                      <h3 className="text-xl font-bold">{student.name}</h3>
                      <div className={cn(
                        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest",
                        i === 0 ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {i === 0 ? "Upward Trend" : "Downward Trend"}
                      </div>
                    </div>
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={student.data}>
                          <defs>
                            <linearGradient id={`colorScore-${i}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={i === 0 ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                              <stop offset="95%" stopColor={i === 0 ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                          <XAxis dataKey="month" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                          <Tooltip 
                            contentStyle={{ backgroundColor: theme === 'dark' ? '#0a0a0a' : '#fff', border: '1px solid #ffffff10', borderRadius: '12px' }}
                            itemStyle={{ color: i === 0 ? '#10b981' : '#ef4444' }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="score" 
                            stroke={i === 0 ? "#10b981" : "#ef4444"} 
                            strokeWidth={3}
                            fillOpacity={1} 
                            fill={`url(#colorScore-${i})`} 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Publish News' && (
            <div className="max-w-2xl mx-auto space-y-10">
              <div className="text-center space-y-4">
                <Megaphone className="w-16 h-16 text-purple-500 mx-auto" />
                <h2 className="text-3xl font-bold">Publish Announcement</h2>
                <p className="text-gray-500">Post news and updates to the school wall newspaper.</p>
              </div>

              <form onSubmit={handlePublishNews} className={cn(
                "p-8 rounded-[32px] border space-y-6",
                theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200 shadow-sm"
              )}>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">Title</label>
                  <input 
                    type="text" 
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Enter announcement title..."
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl border outline-none focus:border-purple-500 transition-all font-bold",
                      theme === 'dark' ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-200"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">Content</label>
                  <textarea 
                    rows={6}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Write your announcement here..."
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl border outline-none focus:border-purple-500 transition-all font-medium resize-none",
                      theme === 'dark' ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-200"
                    )}
                  />
                </div>
                <button 
                  type="submit"
                  disabled={publishing}
                  className="w-full bg-purple-500 text-white py-5 rounded-2xl font-black text-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-purple-500/20 disabled:opacity-50"
                >
                  <Send className="w-5 h-5" />
                  {publishing ? "PUBLISHING..." : "PUBLISH NOW"}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'Wall Newspaper' && (
            <div className="h-full -m-10">
              <KioskMode />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
