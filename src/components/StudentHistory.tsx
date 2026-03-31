import React, { useState, useEffect } from 'react';
import { UserProfile, Grade } from '../types';
import { dataService } from '../services/dataService';
import { 
  BookOpen, 
  ChevronRight, 
  Star, 
  Calendar,
  Filter,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface StudentHistoryProps {
  profile: UserProfile;
  theme?: 'light' | 'dark';
}

export function StudentHistory({ profile, theme = 'dark' }: StudentHistoryProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataService.subscribeToGrades(profile.uid, (data) => {
      setGrades(data);
    });

    return () => unsub();
  }, [profile.uid]);

  const subjects = Array.from(new Set(grades.map(g => g.subject)));
  const filteredGrades = selectedSubject 
    ? grades.filter(g => g.subject === selectedSubject)
    : grades;

  return (
    <div className="space-y-10 pb-20">
      <div className={cn(
        "relative h-[400px] rounded-[40px] overflow-hidden group shadow-2xl transition-colors duration-500",
        theme === 'dark' ? "bg-gray-900" : "bg-white"
      )}>
        <img 
          src="https://picsum.photos/seed/education/1200/600" 
          alt="Education" 
          className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t via-transparent to-transparent",
          theme === 'dark' ? "from-gray-950" : "from-white"
        )} />
        <div className="absolute bottom-12 left-12 max-w-2xl">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-purple-500 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/20">Отличник</span>
            <span className="text-gray-500 text-xs font-black uppercase tracking-widest">Обновлено 2ч назад</span>
          </div>
          <h2 className="text-7xl font-black tracking-tighter mb-4 uppercase italic leading-none">История оценок</h2>
          <p className="text-xl text-gray-500 font-medium leading-relaxed max-w-lg">
            Ваша полная академическая история, достижения и прогресс в лицее Акбобек.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
        <button
          onClick={() => setSelectedSubject(null)}
          className={cn(
            "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all whitespace-nowrap shadow-sm",
            selectedSubject === null 
              ? "bg-purple-500 text-white shadow-purple-500/20" 
              : theme === 'dark' ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
          )}
        >
          Все предметы
        </button>
        {subjects.map(subject => (
          <button
            key={subject}
            onClick={() => setSelectedSubject(subject)}
            className={cn(
              "px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all whitespace-nowrap shadow-sm",
              selectedSubject === subject 
                ? "bg-purple-500 text-white shadow-purple-500/20" 
                : theme === 'dark' ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
            )}
          >
            {subject}
          </button>
        ))}
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-3xl font-black uppercase italic tracking-tight">Последние оценки</h3>
            <button className="text-purple-500 hover:underline transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest">
              СМОТРЕТЬ ВСЕ <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredGrades.map((grade, i) => (
              <motion.div
                key={grade.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "relative aspect-[4/5] rounded-[32px] overflow-hidden group cursor-pointer border transition-all duration-500",
                  theme === 'dark' ? "bg-gray-900 border-white/5 hover:border-purple-500/30" : "bg-white border-gray-100 hover:border-purple-500/30 shadow-sm shadow-gray-200/50"
                )}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="p-10 h-full flex flex-col relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn(
                      "p-4 rounded-2xl transition-colors",
                      theme === 'dark' ? "bg-white/5 group-hover:bg-purple-500/20" : "bg-gray-100 group-hover:bg-purple-50"
                    )}>
                      <BookOpen className="w-7 h-7 text-purple-500" />
                    </div>
                    <div className="text-right">
                      <span className={cn(
                        "text-5xl font-black transition-colors",
                        theme === 'dark' ? "text-white" : "text-gray-900",
                        "group-hover:text-purple-500"
                      )}>{grade.grade}</span>
                      <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.2em] mt-2">Балл</p>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <h4 className="text-2xl font-black mb-2 uppercase tracking-tight italic">{grade.subject}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-gray-500 font-black uppercase tracking-[0.15em]">
                      <span>{grade.type}</span>
                      <span className="w-1 h-1 rounded-full bg-purple-500/50" />
                      <span>{new Date(grade.date).toLocaleDateString('ru-RU')}</span>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center backdrop-blur-md">
                  <div className="text-center p-6 transform translate-y-8 group-hover:translate-y-0 transition-transform duration-500">
                    <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4 drop-shadow-lg" />
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-white">Подробнее</p>
                  </div>
                </div>
              </motion.div>
            ))}
            {filteredGrades.length === 0 && (
              <div className={cn(
                "col-span-full py-32 text-center rounded-[40px] border-2 border-dashed transition-colors",
                theme === 'dark' ? "bg-white/5 border-white/10" : "bg-gray-50 border-gray-200"
              )}>
                <Search className="w-16 h-16 mx-auto mb-6 opacity-20 text-purple-500" />
                <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Оценки не найдены.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
