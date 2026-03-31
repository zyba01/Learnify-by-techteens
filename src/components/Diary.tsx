import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Printer, 
  MessageSquare, 
  Info, 
  RefreshCw,
  Save,
  CheckCircle2,
  Loader2,
  Trophy
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { cn } from '../lib/utils';

import { UserProfile, Grade, Attendance } from '../types';
import { dataService } from '../services/dataService';

interface DiaryEntry {
  subject: string;
  grades: {
    mon: number | null;
    tue: number | null;
    wed: number | null;
    thu: number | null;
    fri: number | null;
  };
  avg: number;
  comment: string;
}

const SUBJECTS = ['Физика', 'Алгебра', 'Английский', 'Информатика', 'История', 'Биология', 'География', 'Химия'];

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт'] as const;

interface DiaryProps {
  theme?: 'light' | 'dark';
  profile: UserProfile;
}

const QUARTERS = [
  { id: 1, name: '1-я Четверть' },
  { id: 2, name: '2-я Четверть' },
  { id: 3, name: '3-я Четверть' },
  { id: 4, name: '4-я Четверть' },
  { id: 5, name: 'Итоги года' },
];

export function Diary({ theme = 'dark', profile }: DiaryProps) {
  const [selectedQuarter, setSelectedQuarter] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [diaryData, setDiaryData] = useState<DiaryEntry[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [activeView, setActiveView] = useState<'grades' | 'attendance' | 'calendar'>('grades');

  useEffect(() => {
    const unsubGrades = dataService.subscribeToGrades(profile.uid, (grades) => {
      // Map Firestore grades to DiaryEntry format
      const mappedData = SUBJECTS.map(subject => {
        const subjectGrades = grades.filter(g => g.subject === subject);
        
        // Simple mapping for demo: assign grades to days based on their index or date
        const dayGrades = {
          mon: null as number | null,
          tue: null as number | null,
          wed: null as number | null,
          thu: null as number | null,
          fri: null as number | null,
        };

        subjectGrades.forEach((g, idx) => {
          const day = new Date(g.date).getDay();
          if (day >= 1 && day <= 5) {
            const dayKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][day];
            if (dayKey !== 'sun' && dayKey !== 'sat') {
              (dayGrades as any)[dayKey] = g.grade;
            }
          }
        });

        const vals = Object.values(dayGrades).filter(v => v !== null) as number[];
        const avg = vals.length > 0 ? Number((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)) : 0;

        return {
          subject,
          grades: dayGrades,
          avg,
          comment: 'Хорошая работа.'
        };
      });

      setDiaryData(mappedData);
      setIsLoading(false);
    });

    const fetchAttendance = async () => {
      try {
        const data = await dataService.getAttendance(profile.uid);
        setAttendance(data);
      } catch (error) {
        console.error('Error fetching attendance:', error);
      }
    };
    fetchAttendance();

    return () => unsubGrades();
  }, [profile.uid]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`AQBOBEK Lyceum - Электронный дневник`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Четверть: ${QUARTERS.find(q => q.id === selectedQuarter)?.name} | Дата: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["Предмет", "Пн", "Вт", "Ср", "Чт", "Пт", "Средний", "Комментарий"];
    const tableRows = diaryData.map(entry => [
      entry.subject,
      entry.grades.mon || '-',
      entry.grades.tue || '-',
      entry.grades.wed || '-',
      entry.grades.thu || '-',
      entry.grades.fri || '-',
      entry.avg,
      entry.comment
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [75, 0, 130] },
    });

    doc.save(`Diary_Q${selectedQuarter}.pdf`);
  };

  const handleQuarterChange = (id: number) => {
    setIsLoading(true);
    setSelectedQuarter(id);
    setTimeout(() => {
      setIsLoading(false);
    }, 400);
  };

  const currentDayIndex = new Date().getDay(); // 1-5 for Mon-Fri
  const currentDayName = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][currentDayIndex];

  // Mock yearly data
  const YEARLY_DATA = [
    { subject: 'Физика', q1: 4.5, q2: 4.6, q3: 4.7, q4: 0, final: 4.6 },
    { subject: 'Алгебра', q1: 4.7, q2: 4.5, q3: 4.3, q4: 0, final: 4.5 },
    { subject: 'Английский', q1: 4.3, q2: 5.0, q3: 4.7, q4: 0, final: 4.7 },
    { subject: 'Информатика', q1: 5.0, q2: 5.0, q3: 5.0, q4: 0, final: 5.0 },
    { subject: 'История', q1: 3.5, q2: 3.8, q3: 3.7, q4: 0, final: 3.7 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">Электронный дневник</h1>
          <p className="text-gray-500 mt-2 font-medium">Обзор успеваемости и расписания на неделю.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 mr-4">
            {[
              { id: 'grades', name: 'Оценки' },
              { id: 'attendance', name: 'Посещаемость' },
              { id: 'calendar', name: 'Календарь' },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  activeView === view.id
                    ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                    : "text-gray-400 hover:text-white"
                )}
              >
                {view.name}
              </button>
            ))}
          </div>

          {activeView === 'grades' && (
            <>
              {QUARTERS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => handleQuarterChange(q.id)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                    selectedQuarter === q.id
                      ? "bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20"
                      : theme === 'dark' 
                        ? "bg-white/5 text-gray-400 border-white/10 hover:border-purple-500/50 hover:text-purple-400"
                        : "bg-white text-gray-500 border-gray-200 hover:border-purple-500/50 hover:text-purple-500 shadow-sm"
                  )}
                >
                  {q.name}
                </button>
              ))}
              <div className="w-px h-8 bg-gray-200/20 mx-2 hidden md:block" />
              <button 
                onClick={exportToPDF}
                className={cn(
                  "flex items-center gap-2 border px-6 py-2 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20 hover:bg-indigo-700"
                )}
              >
                <Printer className="w-4 h-4" />
                СКАЧАТЬ PDF
              </button>
            </>
          )}
        </div>
      </div>

      <div className={cn(
        "border rounded-[32px] overflow-hidden shadow-2xl transition-colors duration-500 relative min-h-[400px]",
        theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-100 shadow-gray-200/50"
      )}>
        <AnimatePresence mode="wait">
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm"
            >
              <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest mt-4 text-purple-500 animate-pulse">Загрузка {selectedQuarter === 5 ? 'Итогов года' : `${selectedQuarter}-й четверти`}...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="overflow-x-auto">
          {activeView === 'grades' ? (
            selectedQuarter === 5 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={cn(
                    "border-b",
                    theme === 'dark' ? "border-white/5 bg-white/[0.02]" : "border-gray-100 bg-gray-50/50"
                  )}>
                    <th className="p-6 font-black uppercase tracking-[0.2em] text-[10px] text-gray-500">Предмет</th>
                    <th className="p-6 font-black uppercase tracking-[0.2em] text-[10px] text-center text-gray-500">Ч1</th>
                    <th className="p-6 font-black uppercase tracking-[0.2em] text-[10px] text-center text-gray-500">Ч2</th>
                    <th className="p-6 font-black uppercase tracking-[0.2em] text-[10px] text-center text-gray-500">Ч3</th>
                    <th className="p-6 font-black uppercase tracking-[0.2em] text-[10px] text-center text-gray-500">Ч4</th>
                    <th className="p-6 font-black uppercase tracking-[0.2em] text-[10px] text-center text-purple-500">Итог</th>
                  </tr>
                </thead>
                <tbody className={cn(
                  "divide-y",
                  theme === 'dark' ? "divide-white/5" : "divide-gray-100"
                )}>
                  {YEARLY_DATA.map((row, i) => (
                    <motion.tr 
                      key={row.subject}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "transition-colors group",
                        theme === 'dark' ? "hover:bg-white/[0.02]" : "hover:bg-gray-50/50"
                      )}
                    >
                      <td className="p-6">
                        <span className="font-black text-lg group-hover:text-purple-500 transition-colors uppercase tracking-tight italic">{row.subject}</span>
                      </td>
                      {[row.q1, row.q2, row.q3, row.q4].map((grade, idx) => (
                        <td key={idx} className="p-6 text-center">
                          <span className={cn(
                            "inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-lg",
                            grade === 0 ? "text-gray-300" : "bg-white/5 text-white/80"
                          )}>
                            {grade > 0 ? grade.toFixed(1) : '—'}
                          </span>
                        </td>
                      ))}
                      <td className="p-6 text-center">
                        <span className="font-black text-2xl text-purple-500">{row.final.toFixed(1)}</span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={cn(
                    "border-b",
                    theme === 'dark' ? "border-white/5 bg-white/[0.02]" : "border-gray-100 bg-gray-50/50"
                  )}>
                    <th className="p-6 font-black uppercase tracking-[0.2em] text-[10px] text-gray-500">Предмет</th>
                    {DAYS.map((day) => (
                      <th 
                        key={day} 
                        className={cn(
                          "p-6 font-black uppercase tracking-[0.2em] text-[10px] text-center",
                          currentDayName === day ? "text-purple-500" : "text-gray-500"
                        )}
                      >
                        {day}
                      </th>
                    ))}
                    <th className="p-6 font-black uppercase tracking-[0.2em] text-[10px] text-center text-gray-500">Ср. балл</th>
                    <th className="p-6 font-black uppercase tracking-[0.2em] text-[10px] text-center text-gray-500">Коммент</th>
                  </tr>
                </thead>
                <tbody className={cn(
                  "divide-y",
                  theme === 'dark' ? "divide-white/5" : "divide-gray-100"
                )}>
                  {diaryData.map((row, i) => (
                    <motion.tr 
                      key={row.subject}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={cn(
                        "transition-colors group",
                        theme === 'dark' ? "hover:bg-white/[0.02]" : "hover:bg-gray-50/50"
                      )}
                    >
                      <td className="p-6">
                        <span className="font-black text-lg group-hover:text-purple-500 transition-colors uppercase tracking-tight italic">{row.subject}</span>
                      </td>
                      
                      {DAYS.map((day) => {
                        const grade = row.grades[day.toLowerCase() as keyof typeof row.grades];
                        return (
                          <td key={day} className="p-6 text-center">
                            {grade ? (
                              <div className="relative inline-block group/grade">
                                <span className={cn(
                                  "inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-xl transition-all cursor-default",
                                  grade === 5 ? "bg-purple-500/20 text-purple-500 shadow-lg shadow-purple-500/10" : 
                                  grade === 4 ? "bg-blue-500/20 text-blue-400" : 
                                  "bg-gray-500/20 text-gray-400",
                                  "hover:scale-110 hover:shadow-xl"
                                )}>
                                  {grade}
                                </span>
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-black border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover/grade:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 text-white">
                                  {grade === 5 ? 'Отлично' : grade === 4 ? 'Хорошо' : 'Удовл.'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-300 font-black">—</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="p-6 text-center">
                        <span className={cn(
                          "font-black text-xl",
                          theme === 'dark' ? "text-white/80" : "text-gray-900"
                        )}>{row.avg.toFixed(1)}</span>
                      </td>

                      <td className="p-6 text-center">
                        <div className="relative inline-block group/comment">
                          <button className={cn(
                            "p-3 rounded-xl transition-all",
                            theme === 'dark' ? "bg-white/5 hover:bg-purple-500/20 hover:text-purple-500" : "bg-gray-100 hover:bg-purple-50 hover:text-purple-500 text-gray-500"
                          )}>
                            <MessageSquare className="w-5 h-5" />
                          </button>
                          <div className={cn(
                            "absolute bottom-full right-0 mb-3 w-64 p-4 border rounded-2xl shadow-2xl opacity-0 group-hover/comment:opacity-100 transition-all pointer-events-none z-20 translate-y-2 group-hover/comment:translate-y-0",
                            theme === 'dark' ? "bg-gray-950 border-white/10" : "bg-white border-gray-200"
                          )}>
                            <div className="flex items-start gap-3">
                              <Info className="w-4 h-4 text-purple-500 shrink-0 mt-1" />
                              <p className={cn(
                                "text-xs leading-relaxed text-left font-medium",
                                theme === 'dark' ? "text-gray-300" : "text-gray-600"
                              )}>
                                {row.comment}
                              </p>
                            </div>
                            <div className={cn(
                              "absolute top-full right-5 -translate-y-1/2 rotate-45 w-3 h-3 border-r border-b",
                              theme === 'dark' ? "bg-gray-950 border-white/10" : "bg-white border-gray-200"
                            )} />
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )
          ) : activeView === 'attendance' ? (
            <div className="p-8">
              <h3 className="text-2xl font-black uppercase italic mb-8">Журнал посещаемости</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {attendance.map((record, i) => (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "p-6 rounded-3xl border flex items-center justify-between",
                      theme === 'dark' ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                    )}
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">Дата</p>
                      <p className="text-lg font-black">{new Date(record.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</p>
                    </div>
                    <div className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest",
                      record.status === 'present' ? "bg-green-500/20 text-green-500" :
                      record.status === 'late' ? "bg-yellow-500/20 text-yellow-500" :
                      "bg-red-500/20 text-red-500"
                    )}>
                      {record.status === 'present' ? 'Присутствовал' :
                       record.status === 'late' ? 'Опоздал' : 'Отсутствовал'}
                    </div>
                  </motion.div>
                ))}
                {attendance.length === 0 && (
                  <div className="col-span-full py-12 text-center text-gray-500">
                    <p className="font-black uppercase tracking-widest text-xs">Записей о посещаемости не найдено.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase italic">Календарь активности</h3>
                <div className="flex items-center gap-4 bg-purple-500/10 px-6 py-3 rounded-2xl border border-purple-500/20">
                  <Trophy className="w-6 h-6 text-purple-500" />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-purple-500/60">Ударный режим</p>
                    <p className="text-xl font-black text-purple-500">{profile?.streak || 12} ДНЕЙ</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-7 gap-4">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black uppercase tracking-widest text-gray-500">{d}</div>
                ))}
                {Array.from({ length: 31 }).map((_, i) => {
                  const isStreak = i > 15 && i < 28;
                  return (
                    <div 
                      key={i}
                      className={cn(
                        "aspect-square rounded-2xl border flex items-center justify-center text-sm font-black transition-all",
                        isStreak 
                          ? "bg-purple-500 border-purple-500 text-white shadow-lg shadow-purple-500/20 scale-105" 
                          : theme === 'dark' ? "bg-white/5 border-white/5 text-gray-500" : "bg-gray-50 border-gray-100 text-gray-400"
                      )}
                    >
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center px-4">
        <div className="flex items-center gap-2 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
          <RefreshCw className="w-3 h-3 animate-spin-slow" />
          Последняя синхронизация: 5 минут назад
        </div>
        <div className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
          Учебный год 2025-2026 • 3-я Четверть
        </div>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
        @media print {
          .no-print { display: none; }
          body { background: white; color: black; }
          .bg-gray-900 { background: #f9f9f9 !important; border: 1px solid #ddd !important; }
          .text-white { color: black !important; }
          .text-gray-500 { color: #666 !important; }
          .bg-white\/5 { background: #eee !important; }
          th { background: #f0f0f0 !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
