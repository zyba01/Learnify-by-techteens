import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { UserProfile, Grade, Attendance, News } from '../types';
import { Database, Loader2, CheckCircle2 } from 'lucide-react';

export function MockDataGenerator({ profile }: { profile: UserProfile }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  if (profile.role !== 'admin') return null;

  const generateData = async () => {
    setLoading(true);
    try {
      const subjects = ['Mathematics', 'Physics', 'Biology', 'English', 'History', 'Computer Science', 'Geography', 'Chemistry'];
      const types: ('exam' | 'homework' | 'quiz')[] = ['exam', 'homework', 'quiz'];
      
      for (let i = 0; i < 50; i++) {
        const grade: Omit<Grade, 'id'> = {
          studentId: profile.uid,
          subject: subjects[Math.floor(Math.random() * subjects.length)],
          grade: Math.floor(Math.random() * 3) + 3, // 3-5
          date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
          type: types[Math.floor(Math.random() * types.length)]
        };
        await dataService.addGrade(grade);
      }

      for (let i = 0; i < 15; i++) {
        const att: Omit<Attendance, 'id'> = {
          studentId: profile.uid,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          status: Math.random() > 0.1 ? 'present' : (Math.random() > 0.5 ? 'absent' : 'late')
        };
        await dataService.addAttendance(att);
      }

      const newsItems = [
        { title: 'Ежегодная научная ярмарка 2026', content: 'Присоединяйтесь к самому захватывающему событию года! Ученики представят свои инновационные проекты в главном зале.', summary: 'Научная ярмарка 2026: Инновации на выставке!' },
        { title: 'Открытие новой лаборатории робототехники', content: 'Мы с гордостью объявляем об открытии нашей современной лаборатории робототехники, оснащенной по последнему слову техники.', summary: 'Лаборатория робототехники открыта для учеников!' },
        { title: 'Результаты спортивного дня', content: 'Поздравляем команду Синих с победой в общем зачете в этом году! Отличные усилия всех участников.', summary: 'Команда Синих побеждает в Спортивном дне 2026!' }
      ];

      for (const item of newsItems) {
        const news: Omit<News, 'id'> = {
          ...item,
          date: new Date().toISOString(),
          authorId: profile.uid
        };
        await dataService.addNews(news);
      }

      setDone(true);
    } catch (error) {
      console.error('Error generating mock data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onClick={generateData}
        disabled={loading || done}
        className="bg-white text-black px-6 py-3 rounded-2xl font-bold flex items-center gap-3 shadow-2xl hover:bg-orange-500 hover:text-white transition-all disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (done ? <CheckCircle2 className="w-5 h-5" /> : <Database className="w-5 h-5" />)}
        {done ? 'MOCK DATA GENERATED' : 'GENERATE MOCK DATA'}
      </button>
    </div>
  );
}
