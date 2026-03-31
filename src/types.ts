export type UserRole = 'student' | 'teacher' | 'parent' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  name: string;
  xp: number;
  level: number;
  streak: number;
  lastActive: string;
  avatar?: string;
  childId?: string; // For parents
  class?: string; // For students
}

export interface Grade {
  id: string;
  studentId: string;
  subject: string;
  grade: number;
  date: string;
  type: 'exam' | 'homework' | 'quiz';
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
}

export interface Achievement {
  id: string;
  studentId: string;
  title: string;
  description: string;
  xpReward: number;
  date: string;
}

export interface News {
  id: string;
  title: string;
  content: string;
  summary: string;
  date: string;
  authorId: string;
  category?: 'academic' | 'event' | 'announcement';
}

export interface ClassPerformance {
  id: string;
  name: string;
  avgScore: number;
  studentCount: number;
  trend: 'up' | 'down' | 'stable';
}

export interface StudentTrend {
  name: string;
  data: { month: string; score: number }[];
}

export interface AcademicRisk {
  probability: number;
  reason: string;
  subjectsAtRisk: string[];
}

export interface MentorRecommendation {
  subject: string;
  topics: string[];
  plan: string;
  motivation: string;
}
