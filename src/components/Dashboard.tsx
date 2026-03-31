import React, { useState, useEffect } from 'react';
import { UserProfile, Grade, News } from '../types';
import { dataService } from '../services/dataService';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  Trophy, 
  ArrowUpRight, 
  Clock,
  ChevronRight,
  Tv
} from 'lucide-react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { cn } from '../lib/utils';

interface DashboardProps {
  profile: UserProfile;
  theme?: 'light' | 'dark';
}

export function Dashboard({ profile, theme = 'dark' }: DashboardProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubGrades = dataService.subscribeToGrades(profile.uid, (data) => {
      setGrades(data);
    });

    const unsubNews = dataService.subscribeToNews((data) => {
      setNews(data);
      setLoading(false);
    });

    return () => {
      unsubGrades();
      unsubNews();
    };
  }, [profile.uid]);

  const avgGrade = grades.length > 0 
    ? (grades.reduce((acc, curr) => acc + curr.grade, 0) / grades.length).toFixed(1)
    : '0.0';

  const chartData = grades.slice().reverse().map(g => ({
    date: new Date(g.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    grade: g.grade
  }));

  return (
    <div className="space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">С возвращением, {profile.name.split(' ')[0]}!</h1>
          <p className="text-gray-500 mt-2 font-medium">Вот что происходит в лицее Акбобек сегодня.</p>
        </div>
        <div className="flex gap-4">
          <div className={cn(
            "px-6 py-3 rounded-2xl flex items-center gap-3 border transition-all",
            theme === 'dark' ? "bg-purple-500/10 border-purple-500/20" : "bg-purple-50 bg-white border-purple-100"
          )}>
            <Trophy className="w-5 h-5 text-purple-500" />
            <span className="text-purple-500 font-black text-lg">{profile.xp} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Средний балл', value: avgGrade, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Посещаемость', value: '98%', icon: Users, color: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Ударный режим', value: `${profile.streak} Дней`, icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10' },
          { label: 'Рейтинг в школе', value: '#12', icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "p-8 rounded-[32px] border transition-all group cursor-default shadow-sm",
              theme === 'dark' 
                ? "bg-gray-900 border-white/5 hover:border-purple-500/30" 
                : "bg-white border-gray-100 hover:border-purple-500/30 shadow-gray-200/50"
            )}
          >
            <div className="flex justify-between items-start mb-6">
              <div className={cn("p-4 rounded-2xl", stat.bg)}>
                <stat.icon className={cn("w-7 h-7", stat.color)} />
              </div>
              <ArrowUpRight className="w-6 h-6 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </div>
            <p className="text-gray-500 text-xs font-black uppercase tracking-widest">{stat.label}</p>
            <h3 className="text-3xl font-black mt-2 tracking-tight">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className={cn(
          "lg:col-span-2 border rounded-[32px] p-8 shadow-sm",
          theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-100 shadow-gray-200/50"
        )}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase italic tracking-tight">Успеваемость</h3>
            <select className={cn(
              "border-none rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none",
              theme === 'dark' ? "bg-white/5" : "bg-gray-100"
            )}>
              <option>Последние 10 оценок</option>
              <option>За семестр</option>
            </select>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? "#ffffff05" : "#00000005"} vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#666" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                  dy={10}
                />
                <YAxis 
                  stroke="#666" 
                  fontSize={10} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#111827' : '#ffffff', 
                    border: 'none', 
                    borderRadius: '16px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                  }}
                  itemStyle={{ color: '#a855f7', fontWeight: 'bold' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="grade" 
                  stroke="#a855f7" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorGrade)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={cn(
          "border rounded-[32px] p-8 shadow-sm",
          theme === 'dark' ? "bg-gray-900 border-white/5" : "bg-white border-gray-100 shadow-gray-200/50"
        )}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black uppercase italic tracking-tight">Новости школы</h3>
            <button className="text-purple-500 text-xs font-black uppercase tracking-widest hover:underline">Все новости</button>
          </div>
          <div className="space-y-6">
            {news.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2 font-black uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(item.date).toLocaleDateString('ru-RU')}</span>
                </div>
                <h4 className="font-black group-hover:text-purple-500 transition-colors line-clamp-1 uppercase tracking-tight">{item.title}</h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-2 font-medium leading-relaxed">{item.content}</p>
                <div className={cn(
                  "mt-4 h-[1px]",
                  theme === 'dark' ? "bg-white/5" : "bg-gray-100"
                )} />
              </motion.div>
            ))}
            {news.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                <Tv className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="font-black uppercase tracking-widest text-xs">Пока нет новостей.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
