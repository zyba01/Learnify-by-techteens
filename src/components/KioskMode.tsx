import React, { useState, useEffect } from 'react';
import { News } from '../types';
import { dataService } from '../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Clock, Trophy, Star, Megaphone } from 'lucide-react';

export function KioskMode() {
  const [news, setNews] = useState<News[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const unsub = dataService.subscribeToNews((data) => {
      setNews(data);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (news.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % news.length);
    }, 8000); // Rotate every 8 seconds
    return () => clearInterval(interval);
  }, [news.length]);

  if (news.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-8 bg-[#0D0D0D]">
        <Tv className="w-32 h-32 text-orange-500/20 animate-pulse" />
        <h1 className="text-6xl font-black tracking-tighter uppercase italic text-white/20">Стенгазета 2.0</h1>
        <p className="text-gray-600 text-2xl font-bold uppercase tracking-widest">Ожидание новостей...</p>
      </div>
    );
  }

  const currentNews = news[currentIndex];

  return (
    <div className="h-full bg-[#0D0D0D] overflow-hidden relative flex flex-col">
      <div className="bg-orange-500 p-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Megaphone className="w-10 h-10 text-black" />
          <h2 className="text-4xl font-black text-black tracking-tighter uppercase italic">Aqbobek Lyceum Live</h2>
        </div>
        <div className="flex items-center gap-6 text-black font-black text-2xl">
          <div className="flex items-center gap-2">
            <Trophy className="w-8 h-8" />
            <span>ТОП НЕДЕЛИ</span>
          </div>
          <div className="w-[2px] h-10 bg-black/20" />
          <Clock className="w-8 h-8" />
          <span>{new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNews.id}
            initial={{ opacity: 0, scale: 1.1, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -40 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-6xl w-full space-y-12"
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4 text-orange-500 font-black text-2xl uppercase tracking-widest">
                <Star className="w-8 h-8 fill-orange-500" />
                <span>Главное объявление</span>
              </div>
              <h1 className="text-[120px] leading-[0.9] font-black tracking-tighter uppercase italic text-white">
                {currentNews.title}
              </h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
              <div className="space-y-8">
                <p className="text-4xl text-gray-400 font-bold leading-tight">
                  {currentNews.summary || currentNews.content.slice(0, 200) + '...'}
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center text-2xl font-bold">
                    А
                  </div>
                  <div>
                    <p className="text-2xl font-bold">Администрация школы</p>
                    <p className="text-orange-500 font-black uppercase tracking-widest text-sm">Официальное сообщение</p>
                  </div>
                </div>
              </div>

              <div className="relative aspect-video rounded-[60px] overflow-hidden border-4 border-white/5">
                <img 
                  src={`https://picsum.photos/seed/${currentNews.id}/800/600`} 
                  alt="News" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="h-4 bg-white/5">
        <motion.div 
          key={currentIndex}
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 8, ease: "linear" }}
          className="h-full bg-orange-500"
        />
      </div>

      <div className="bg-white/5 p-6 overflow-hidden">
        <div className="flex items-center gap-12 whitespace-nowrap animate-marquee">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 text-2xl font-black uppercase italic tracking-tighter text-gray-500">
              <span>Следующее событие: Ежегодная научная ярмарка - 15 апреля</span>
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Напоминание: Сдайте все домашние задания до пятницы</span>
              <span className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Лучший ученик месяца: Даукеш А.</span>
              <span className="w-3 h-3 rounded-full bg-orange-500" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
}
