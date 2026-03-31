import React, { useState, useEffect } from 'react';
import { UserProfile, ClassPerformance } from '../types';
import { dataService } from '../services/dataService';
import { 
  BarChart3, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Trophy,
  School,
  ArrowRight,
  LayoutDashboard,
  Tv,
  LogOut,
  Moon,
  Sun,
  Megaphone,
  Send,
  Edit2,
  Trash2,
  Check,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { KioskMode } from './KioskMode';
import { cn } from '../lib/utils';

interface AdminDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export function AdminDashboard({ profile, onLogout, theme, toggleTheme }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [classes, setClasses] = useState<ClassPerformance[]>([]);
  const [topStudents, setTopStudents] = useState<UserProfile[]>([]);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [publishing, setPublishing] = useState(false);

  const [selectedClass, setSelectedClass] = useState('11 "А"');
  const [classStudents, setClassStudents] = useState<{id: string, name: string}[]>([]);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editNameValue, setEditNameValue] = useState('');

  const availableClasses = ['11 "А"', '11 "Б"', '10 "А"', '10 "Б"', '9 "А"', '9 "Б"', '9 "В"'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [perf, top] = await Promise.all([
          dataService.getClassesPerformance(),
          dataService.getTopStudents()
        ]);
        setClasses(perf);
        setTopStudents(top);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (activeTab === 'classes') {
      const names = [
        'Алихан Смаилов', 'Айгерим Нурланова', 'Данияр Есенов', 'Мадина Омарова',
        'Тимур Касымов', 'Амина Сабитова', 'Руслан Ибрагимов', 'Динара Мусаева',
        'Арман Жумабаев', 'Зарина Толенова', 'Ерлан Абдуллин', 'Асель Кусаинова',
        'Дамир Сейфуллин', 'Гульназ Ахметова', 'Ильяс Махмутов'
      ];
      const seed = selectedClass.charCodeAt(0) + selectedClass.charCodeAt(selectedClass.length - 2);
      const count = 12 + (seed % 8);
      const generated = Array.from({ length: count }, (_, i) => ({
        id: `${selectedClass}-${i}`,
        name: names[(seed + i) % names.length] + (i >= names.length ? ` ${i}` : '')
      }));
      setClassStudents(generated);
    }
  }, [selectedClass, activeTab]);

  const handleDeleteStudent = (id: string) => {
    setClassStudents(prev => prev.filter(s => s.id !== id));
  };

  const startEditing = (student: {id: string, name: string}) => {
    setEditingStudentId(student.id);
    setEditNameValue(student.name);
  };

  const saveEdit = (id: string) => {
    if (editNameValue.trim()) {
      setClassStudents(prev => prev.map(s => s.id === id ? { ...s, name: editNameValue.trim() } : s));
    }
    setEditingStudentId(null);
  };

  const cancelEdit = () => {
    setEditingStudentId(null);
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
      alert('Новость успешно опубликована!');
    } catch (error) {
      console.error('Ошибка публикации новости:', error);
    } finally {
      setPublishing(false);
    }
  };

  const menuItems = [
    { id: 'overview', label: 'Обзор школы', icon: LayoutDashboard },
    { id: 'classes', label: 'Все классы', icon: School },
    { id: 'publish', label: 'Опубликовать новость', icon: Megaphone },
    { id: 'newspaper', label: 'Стенгазета', icon: Tv },
  ];

  const stats = [
    { label: 'Всего учеников', value: (1200 + Math.floor(Math.random() * 100)).toLocaleString(), icon: Users, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Средний балл по школе', value: (80 + Math.random() * 10).toFixed(1) + '%', icon: BarChart3, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Активные учителя', value: (80 + Math.floor(Math.random() * 10)).toString(), icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
    { label: 'Лучший класс', value: ['11А', '11Б', '10А', '10Б'][Math.floor(Math.random() * 4)], icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  ];

  return (
    <div className={cn(
      "min-h-screen flex",
      theme === 'dark' ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
    )}>
      <aside className={cn(
        "w-72 border-r flex flex-col",
        theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200"
      )}>
        <div className="p-8 flex items-center gap-3">
          <School className="w-8 h-8 text-purple-500" />
          <span className="font-bold text-xl tracking-tight">AQBOBEK ADMIN</span>
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
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 mt-auto border-t border-white/10">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className={cn(
          "h-20 border-b flex items-center justify-between px-10",
          theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200"
        )}>
          <h2 className="text-xl font-bold">Панель администратора</h2>
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
                А
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-bold">{profile.name}</p>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Администратор школы</p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10">
          {activeTab === 'overview' && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={cn(
                      "p-6 rounded-3xl border transition-all",
                      theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200 shadow-sm"
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className={cn("p-3 rounded-2xl", stat.bg)}>
                        <stat.icon className={cn("w-6 h-6", stat.color)} />
                      </div>
                    </div>
                    <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                    <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
                  </motion.div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className={cn(
                  "lg:col-span-2 rounded-[32px] p-8 border",
                  theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200 shadow-sm"
                )}>
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-bold">Успеваемость классов</h3>
                    <button 
                      onClick={() => setActiveTab('classes')}
                      className="text-purple-500 text-sm font-bold hover:underline"
                    >
                      Посмотреть все классы
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {classes.map((c) => (
                      <div key={c.id} className={cn(
                        "p-6 rounded-2xl border flex items-center justify-between",
                        theme === 'dark' ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-100"
                      )}>
                        <div>
                          <h4 className="font-bold text-lg">{c.name}</h4>
                          <p className="text-xs text-gray-500">{c.studentCount} Учеников</p>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                            "text-xl font-black",
                            c.avgScore >= 80 ? "text-green-500" : "text-yellow-500"
                          )}>
                            {c.avgScore}%
                          </div>
                          <div className="flex items-center justify-end gap-1">
                            {c.trend === 'up' && <TrendingUp className="w-3 h-3 text-green-500" />}
                            {c.trend === 'down' && <TrendingDown className="w-3 h-3 text-red-500" />}
                            {c.trend === 'stable' && <Minus className="w-3 h-3 text-gray-500" />}
                            <span className="text-[10px] text-gray-500 uppercase font-bold">Тренд</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={cn(
                  "rounded-[32px] p-8 border",
                  theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200 shadow-sm"
                )}>
                  <h3 className="text-xl font-bold mb-8">Лучшие ученики</h3>
                  <div className="space-y-6">
                    {topStudents.map((student, i) => (
                      <div key={student.uid} className="flex items-center gap-4">
                        <div className={cn(
                          "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg",
                          i === 0 ? "bg-yellow-500 text-black" : i === 1 ? "bg-gray-300 text-black" : "bg-orange-400 text-black"
                        )}>
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.xp} XP • Уровень {student.level}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-gray-600" />
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => alert('Открытие таблицы лидеров школы...')}
                    className="w-full mt-8 py-4 rounded-2xl bg-purple-500/10 text-purple-500 font-bold text-sm hover:bg-purple-500 hover:text-white transition-all"
                  >
                    Посмотреть таблицу лидеров
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'classes' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold">Управление классами</h2>
                <p className="text-gray-500 mt-2">Выберите класс для просмотра и редактирования списка учеников.</p>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-4">
                {availableClasses.map(cls => (
                  <button
                    key={cls}
                    onClick={() => setSelectedClass(cls)}
                    className={cn(
                      "px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all",
                      selectedClass === cls 
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
                        : theme === 'dark'
                          ? "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                          : "bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-gray-200"
                    )}
                  >
                    Класс {cls}
                  </button>
                ))}
              </div>

              <div className={cn(
                "rounded-[32px] border overflow-hidden",
                theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200 shadow-sm"
              )}>
                <div className="p-6 border-b border-gray-200/10 flex justify-between items-center">
                  <h3 className="text-xl font-bold">Список учеников: {selectedClass}</h3>
                  <span className="px-4 py-1 rounded-full bg-purple-500/10 text-purple-500 font-bold text-sm">
                    {classStudents.length} учеников
                  </span>
                </div>
                <div className="divide-y divide-gray-200/10">
                  {classStudents.map((student, idx) => (
                    <div key={student.id} className="p-6 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        {editingStudentId === student.id ? (
                          <input
                            type="text"
                            value={editNameValue}
                            onChange={(e) => setEditNameValue(e.target.value)}
                            className={cn(
                              "px-4 py-2 rounded-xl border outline-none focus:border-purple-500 font-bold",
                              theme === 'dark' ? "bg-black/20 border-white/10" : "bg-white border-gray-200"
                            )}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveEdit(student.id);
                              if (e.key === 'Escape') cancelEdit();
                            }}
                          />
                        ) : (
                          <span className="font-bold text-lg">{student.name}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {editingStudentId === student.id ? (
                          <>
                            <button
                              onClick={() => saveEdit(student.id)}
                              className="p-2 rounded-xl bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white transition-colors"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-2 rounded-xl bg-gray-500/10 text-gray-500 hover:bg-gray-500 hover:text-white transition-colors"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(student)}
                              className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
                            >
                              <Edit2 className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'publish' && (
            <div className="max-w-2xl mx-auto space-y-10">
              <div className="text-center space-y-4">
                <Megaphone className="w-16 h-16 text-purple-500 mx-auto" />
                <h2 className="text-3xl font-bold">Опубликовать объявление</h2>
                <p className="text-gray-500">Публикуйте новости и обновления на школьной стенгазете.</p>
              </div>

              <form onSubmit={handlePublishNews} className={cn(
                "p-8 rounded-[32px] border space-y-6",
                theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-200 shadow-sm"
              )}>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">Заголовок</label>
                  <input 
                    type="text" 
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    placeholder="Введите заголовок объявления..."
                    className={cn(
                      "w-full px-6 py-4 rounded-2xl border outline-none focus:border-purple-500 transition-all font-bold",
                      theme === 'dark' ? "bg-white/5 border-white/5" : "bg-gray-50 border-gray-200"
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-gray-500">Содержание</label>
                  <textarea 
                    rows={6}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    placeholder="Напишите ваше объявление здесь..."
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
                  {publishing ? "ПУБЛИКАЦИЯ..." : "ОПУБЛИКОВАТЬ СЕЙЧАС"}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'newspaper' && (
            <div className="h-full -m-10">
              <KioskMode />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
