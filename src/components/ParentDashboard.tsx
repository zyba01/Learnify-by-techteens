import React, { useState, useEffect } from 'react';
import { UserProfile, Grade } from '../types';
import { dataService } from '../services/dataService';
import { 
  TrendingUp, 
  Book, 
  HeartHandshake, 
  LogOut, 
  Sun, 
  Moon,
  GraduationCap,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '../lib/utils';

interface ParentDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function ParentDashboard({ profile, onLogout, theme, toggleTheme }: ParentDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [grades, setGrades] = useState<Grade[]>([]);

  useEffect(() => {
    if (!profile.childId) return;
    
    const unsubGrades = dataService.subscribeToGrades(profile.childId, (data) => {
      setGrades(data);
    });

    return () => {
      unsubGrades();
    };
  }, [profile.childId]);

  const chartData = grades.slice().reverse().map(g => ({
    date: new Date(g.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
    grade: g.grade,
    subject: g.subject
  }));

  const avgGrade = grades.length > 0 
    ? (grades.reduce((acc, curr) => acc + curr.grade, 0) / grades.length).toFixed(1)
    : '0.0';

  const menuItems = [
    { id: 'overview', label: 'Успеваемость', icon: TrendingUp },
    { id: 'diary', label: 'Дневник', icon: Book },
    { id: 'advice', label: 'Советы психолога', icon: HeartHandshake },
  ];

  return (
    <div className={cn(
      "min-h-screen flex overflow-hidden transition-colors duration-500",
      theme === 'dark' ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
    )}>
      <aside className={cn(
        "w-72 border-r flex flex-col transition-colors duration-500",
        theme === 'dark' ? "bg-gray-900 border-white/10" : "bg-white border-gray-200"
      )}>
        <div className="p-8 flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-emerald-500" />
          <span className="font-black text-xl tracking-tighter italic uppercase">AQBOBEK</span>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 group font-bold",
                activeTab === item.id 
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : theme === 'dark' 
                    ? "text-gray-400 hover:bg-white/5 hover:text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                activeTab === item.id ? "text-white" : "text-gray-500 group-hover:text-emerald-500"
              )} />
              <span className="font-bold">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className={cn(
          "p-6 mt-auto border-t space-y-4",
          theme === 'dark' ? "border-white/10" : "border-gray-200"
        )}>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-black text-lg text-white shadow-lg">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black truncate uppercase italic text-sm">{profile.name}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">Родитель</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className={cn(
              "w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-colors",
              theme === 'dark' 
                ? "bg-white/5 hover:bg-red-500/20 text-red-400" 
                : "bg-red-50 hover:bg-red-100 text-red-600"
            )}
          >
            <LogOut className="w-4 h-4" />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <div className="absolute top-8 right-8 z-50">
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-3 rounded-2xl transition-all hover:scale-110 shadow-lg",
              theme === 'dark' ? "bg-white/5 hover:bg-white/10 text-yellow-500" : "bg-white hover:bg-gray-50 text-emerald-500"
            )}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Успеваемость ребенка</h1>
                    <p className="text-gray-500 mt-2 font-medium">Динамика оценок и общая статистика</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={cn(
                      "p-8 rounded-[32px] border",
                      theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-100 shadow-sm"
                    )}>
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                      </div>
                      <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Средний балл</p>
                      <p className="text-4xl font-black">{avgGrade}</p>
                    </div>
                    <div className={cn(
                      "p-8 rounded-[32px] border",
                      theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-100 shadow-sm"
                    )}>
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-emerald-500" />
                      </div>
                      <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Посещаемость</p>
                      <p className="text-4xl font-black">98%</p>
                    </div>
                    <div className={cn(
                      "p-8 rounded-[32px] border",
                      theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-100 shadow-sm"
                    )}>
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                        <AlertCircle className="w-6 h-6 text-purple-500" />
                      </div>
                      <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Пропуски</p>
                      <p className="text-4xl font-black">2</p>
                    </div>
                  </div>

                  <div className={cn(
                    "p-8 rounded-[32px] border",
                    theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-100 shadow-sm"
                  )}>
                    <h3 className="text-xl font-black uppercase italic mb-6">Динамика оценок</h3>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#eee'} vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            stroke={theme === 'dark' ? '#666' : '#999'} 
                            tick={{ fill: theme === 'dark' ? '#666' : '#999', fontSize: 12, fontWeight: 'bold' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis 
                            domain={[0, 5]} 
                            stroke={theme === 'dark' ? '#666' : '#999'}
                            tick={{ fill: theme === 'dark' ? '#666' : '#999', fontSize: 12, fontWeight: 'bold' }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: theme === 'dark' ? '#111' : '#fff',
                              border: 'none',
                              borderRadius: '16px',
                              boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
                              color: theme === 'dark' ? '#fff' : '#000',
                              fontWeight: 'bold'
                            }}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="grade" 
                            stroke="#10b981" 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#colorGrade)" 
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'diary' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Дневник</h1>
                    <p className="text-gray-500 mt-2 font-medium">Последние оценки и комментарии учителей</p>
                  </div>

                  <div className="space-y-4">
                    {grades.map((grade) => (
                      <div 
                        key={grade.id}
                        className={cn(
                          "p-6 rounded-[24px] border flex items-center justify-between",
                          theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-100 shadow-sm"
                        )}
                      >
                        <div>
                          <p className="font-black text-lg">{grade.subject}</p>
                          <p className="text-gray-500 text-sm font-medium">{new Date(grade.date).toLocaleDateString('ru-RU', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className={cn(
                            "px-4 py-2 rounded-xl text-sm font-black uppercase tracking-wider",
                            grade.type === 'exam' ? "bg-red-500/10 text-red-500" :
                            grade.type === 'quiz' ? "bg-yellow-500/10 text-yellow-500" :
                            "bg-blue-500/10 text-blue-500"
                          )}>
                            {grade.type === 'exam' ? 'Экзамен' : grade.type === 'quiz' ? 'Тест' : 'Домашняя работа'}
                          </div>
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black",
                            grade.grade >= 4 ? "bg-emerald-500/10 text-emerald-500" :
                            grade.grade === 3 ? "bg-yellow-500/10 text-yellow-500" :
                            "bg-red-500/10 text-red-500"
                          )}>
                            {grade.grade}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'advice' && (
                <div className="space-y-8">
                  <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Советы психолога</h1>
                    <p className="text-gray-500 mt-2 font-medium">Персональные рекомендации для поддержки вашего ребенка</p>
                  </div>

                  <div className="grid grid-cols-1 gap-6">
                    {[
                      {
                        title: "Как помочь с математикой",
                        content: "Замечено небольшое снижение оценок по математике. Постарайтесь не ругать ребенка, а предложить помощь. Возможно, стоит разобрать сложные темы вместе или нанять репетитора на короткий срок. Главное — сохранить интерес к предмету.",
                        color: "bg-blue-500"
                      },
                      {
                        title: "Режим сна и отдыха",
                        content: "Ученик часто выглядит уставшим на первых уроках. Рекомендуем пересмотреть режим дня: отход ко сну не позднее 22:00, ограничение гаджетов за час до сна. Здоровый сон напрямую влияет на концентрацию и успеваемость.",
                        color: "bg-purple-500"
                      },
                      {
                        title: "Поощрение успехов",
                        content: "Отличные результаты по литературе и истории! Обязательно хвалите ребенка за его старания. Позитивное подкрепление мотивирует гораздо лучше, чем критика за неудачи.",
                        color: "bg-emerald-500"
                      }
                    ].map((advice, i) => (
                      <div 
                        key={i}
                        className={cn(
                          "p-8 rounded-[32px] border relative overflow-hidden",
                          theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-100 shadow-sm"
                        )}
                      >
                        <div className={cn("absolute top-0 left-0 w-2 h-full", advice.color)} />
                        <h3 className="text-2xl font-black mb-4">{advice.title}</h3>
                        <p className={cn(
                          "text-lg leading-relaxed",
                          theme === 'dark' ? "text-gray-400" : "text-gray-600"
                        )}>
                          {advice.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
