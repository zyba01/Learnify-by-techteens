import React, { useState, useEffect } from 'react';
import { UserProfile, Grade, Attendance, AcademicRisk } from '../types';
import { dataService } from '../services/dataService';
import { predictAcademicRisk } from '../geminiService';
import { 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  TrendingDown,
  Info,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

interface RiskRadarProps {
  profile: UserProfile;
}

export function RiskRadar({ profile }: RiskRadarProps) {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [risk, setRisk] = useState<AcademicRisk | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubGrades = dataService.subscribeToGrades(profile.uid, (data) => {
      setGrades(data);
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

    return () => {
      unsubGrades();
    };
  }, [profile.uid]);

  const analyzeRisk = async () => {
    if (grades.length === 0) return;
    setLoading(true);
    try {
      const result = await predictAcademicRisk(grades, attendance);
      setRisk(result);
    } catch (error) {
      console.error('Error analyzing risk:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (prob: number) => {
    if (prob < 30) return 'text-green-500';
    if (prob < 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskBg = (prob: number) => {
    if (prob < 30) return 'bg-green-500/10 border-green-500/20';
    if (prob < 70) return 'bg-yellow-500/10 border-yellow-500/20';
    return 'bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-full text-red-500 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            ПРОГНОЗНАЯ АНАЛИТИКА
          </div>
          <h2 className="text-5xl font-black tracking-tight uppercase italic">Радар успеваемости</h2>
          <p className="text-gray-500 text-lg max-w-xl">
            Система раннего предупреждения для выявления потенциального снижения оценок до того, как это произойдет.
          </p>
        </div>
        
        <button
          onClick={analyzeRisk}
          disabled={loading || grades.length === 0}
          className="bg-white text-black px-12 py-6 rounded-[32px] font-black text-xl hover:scale-105 transition-transform disabled:opacity-50 flex items-center gap-4 shadow-2xl shadow-white/10"
        >
          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ShieldAlert className="w-6 h-6" />}
          ЗАПУСТИТЬ АНАЛИЗ
        </button>
      </div>

      {risk ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className={cn("lg:col-span-2 rounded-[48px] p-12 border flex flex-col items-center justify-center text-center", getRiskBg(risk.probability))}>
            <div className="relative w-64 h-64 mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  stroke="currentColor"
                  strokeWidth="24"
                  fill="transparent"
                  className="opacity-10"
                />
                <motion.circle
                  cx="128"
                  cy="128"
                  r="110"
                  stroke="currentColor"
                  strokeWidth="24"
                  fill="transparent"
                  strokeDasharray={690}
                  initial={{ strokeDashoffset: 690 }}
                  animate={{ strokeDashoffset: 690 - (690 * risk.probability) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={cn("text-7xl font-black italic", getRiskColor(risk.probability))}>{risk.probability}%</span>
                <span className="text-xs font-black uppercase tracking-widest opacity-50">Уровень риска</span>
              </div>
            </div>
            
            <h3 className="text-3xl font-black mb-4 uppercase italic">Результат анализа</h3>
            <p className="text-xl font-medium max-w-lg opacity-80 leading-relaxed">
              {risk.reason}
            </p>
          </div>

          <div className="space-y-8">
            <div className="bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8">
              <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                <TrendingDown className="w-4 h-4" />
                Предметы в зоне риска
              </h4>
              <div className="space-y-4">
                {risk.subjectsAtRisk.map(subject => (
                  <div key={subject} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <span className="font-bold">{subject}</span>
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                ))}
                {risk.subjectsAtRisk.length === 0 && (
                  <div className="flex items-center gap-3 text-green-500 font-bold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Нет предметов в зоне риска</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-orange-500 rounded-[40px] p-8 text-black">
              <h4 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70">Рекомендация платформы</h4>
              <p className="font-bold text-lg leading-snug mb-6">
                Основываясь на этом анализе, мы рекомендуем обратить внимание на посещаемость и запланировать сессию с наставником.
              </p>
              <button 
                onClick={() => alert('Переход к Наставнику для составления индивидуального плана обучения...')}
                className="w-full bg-black text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                Перейти к Наставнику <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="py-32 text-center bg-white/5 rounded-[64px] border border-dashed border-white/10">
          <ShieldAlert className="w-24 h-24 mx-auto mb-6 opacity-10" />
          <p className="text-gray-500 text-xl font-bold uppercase tracking-widest">Ожидание анализа</p>
          <p className="text-gray-600 mt-2">Нажмите кнопку выше, чтобы запустить оценку рисков.</p>
        </div>
      )}
    </div>
  );
}
