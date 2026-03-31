import React, { useState, useEffect } from 'react';
import { UserProfile, Grade, MentorRecommendation } from '../types';
import { dataService } from '../services/dataService';
import { getMentorRecommendations } from '../geminiService';
import { 
  BrainCircuit, 
  Sparkles, 
  Zap, 
  ChevronRight, 
  MessageCircle,
  Loader2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

interface MentorProps {
  profile: UserProfile;
}

export function Mentor({ profile }: MentorProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [recommendations, setRecommendations] = useState<MentorRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'soft' | 'hard'>('soft');

  useEffect(() => {
    const unsub = dataService.subscribeToGrades(profile.uid, (data) => {
      setGrades(data);
    });

    return () => unsub();
  }, [profile.uid]);

  const generateRecommendations = async () => {
    if (grades.length === 0) return;
    setLoading(true);
    try {
      const recs = await getMentorRecommendations(grades, mode);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full text-orange-500 font-bold text-sm">
          <BrainCircuit className="w-4 h-4" />
          АКАДЕМИЧЕСКИЙ НАСТАВНИК
        </div>
        <h2 className="text-5xl font-black tracking-tight uppercase italic">Индивидуальное руководство</h2>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Платформа анализирует вашу успеваемость, чтобы предоставить индивидуальные планы обучения и мотивацию.
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <button
          onClick={() => setMode('soft')}
          className={cn(
            "flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all border-2",
            mode === 'soft' 
              ? "bg-orange-500 border-orange-500 text-white shadow-xl shadow-orange-500/20" 
              : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
          )}
        >
          <Sparkles className="w-5 h-5" />
          Мотивационный режим
        </button>
        <button
          onClick={() => setMode('hard')}
          className={cn(
            "flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all border-2",
            mode === 'hard' 
              ? "bg-red-500 border-red-500 text-white shadow-xl shadow-red-500/20" 
              : "bg-white/5 border-white/5 text-gray-500 hover:border-white/10"
          )}
        >
          <Zap className="w-5 h-5" />
          Строгий режим
        </button>
      </div>

      <div className="flex justify-center">
        <button
          onClick={generateRecommendations}
          disabled={loading || grades.length === 0}
          className="bg-white text-black px-10 py-5 rounded-3xl font-black text-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 flex items-center gap-3"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <BrainCircuit className="w-6 h-6" />}
          СОЗДАТЬ УЧЕБНЫЙ ПЛАН
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {recommendations.map((rec, i) => (
            <motion.div
              key={rec.subject}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-10 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[80px] rounded-full -z-10 group-hover:bg-orange-500/10 transition-colors" />
              
              <div className="flex flex-col md:flex-row gap-10">
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-3xl font-black text-orange-500 uppercase italic tracking-tight">{rec.subject}</h3>
                    <p className="text-gray-400 mt-2 font-medium leading-relaxed">{rec.motivation}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Темы для изучения</h4>
                    <div className="flex flex-wrap gap-2">
                      {rec.topics.map(topic => (
                        <span key={topic} className="bg-white/5 px-4 py-2 rounded-xl text-sm font-bold border border-white/5">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="md:w-1/3 bg-white/5 rounded-3xl p-8 border border-white/5">
                  <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">План на неделю</h4>
                  <p className="text-sm text-gray-300 leading-relaxed font-medium">
                    {rec.plan}
                  </p>
                  <button 
                    onClick={() => alert('Начало учебной сессии по предмету ' + rec.subject + '...')}
                    className="mt-6 w-full bg-white text-black py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-500 hover:text-white transition-colors"
                  >
                    Начать обучение <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {!loading && recommendations.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-[40px] border border-dashed border-white/10">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-10" />
            <p className="text-gray-500 font-bold uppercase tracking-widest">Пока нет рекомендаций. Нажмите кнопку, чтобы начать.</p>
          </div>
        )}
      </div>
    </div>
  );
}
