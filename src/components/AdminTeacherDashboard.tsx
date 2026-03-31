import React, { useState, useRef } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { 
  LogOut, 
  Download, 
  GraduationCap, 
  User,
  ChevronDown,
  Search,
  Save,
  CheckCircle2,
  Loader2,
  BrainCircuit,
  X,
  Trophy,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserProfile, Grade } from '../types';
import { dataService } from '../services/dataService';
import { cn } from '../lib/utils';
import { analyzeClassGrades } from '../geminiService';

interface AdminTeacherDashboardProps {
  profile: UserProfile;
  onLogout: () => void;
}

export function AdminTeacherDashboard({ profile, onLogout }: AdminTeacherDashboardProps) {
  const generateRandomGrades = (seed: string) => {
    const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return {
      q1: Math.floor(((hash * 13) % 41) + 60),
      q2: Math.floor(((hash * 17) % 41) + 60),
      q3: Math.floor(((hash * 19) % 41) + 60),
      q4: Math.floor(((hash * 23) % 41) + 60),
    };
  };

  const STUDENT_NAMES_BY_CLASS: Record<string, string[]> = {
    '11 "А"': ['Азамат Нурланов', 'Айя Смагулова', 'Берик Касымов', 'Мадина Ерасыл', 'Арман Идрисов', 'Даурен Жумабеков', 'Елена Ким'],
    '11 "Б"': ['Динара Алиева', 'Ержан Сабитов', 'Гульназ Омарова', 'Тимур Бекмамбетов', 'Асель Курмангалиева', 'Игорь Пак', 'Марат Оспанов'],
    '10 "А"': ['Кайрат Нуртас', 'Баян Есентаева', 'Нуртас Адамбай', 'Айсулу Азимбаева', 'Санжар Мади', 'Виктор Цой', 'Земфира Рамазанова']
  };

  const [selectedClass, setSelectedClass] = useState('11 "А"');
  const [activeTab, setActiveTab] = useState('Физика');

  const getStudentsForContext = (className: string, subject: string) => {
    const names = STUDENT_NAMES_BY_CLASS[className] || [];
    return names.map((name, index) => ({
      id: index + 1,
      uid: `student_${className}_${index}`, // Simulated UID
      name,
      ...generateRandomGrades(name + className + subject)
    }));
  };

  const [students, setStudents] = useState(getStudentsForContext('11 "А"', 'Физика'));
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      try {
        const result = await analyzeClassGrades(content, selectedClass, activeTab);
        setAnalysisResult(result);
      } catch (error) {
        console.error('AI Analysis error:', error);
        alert('Ошибка при анализе данных ИИ. Попробуйте другой формат файла.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClassChange = (className: string) => {
    setSelectedClass(className);
    setStudents(getStudentsForContext(className, activeTab));
  };

  const handleSubjectChange = (subject: string) => {
    setActiveTab(subject);
    setStudents(getStudentsForContext(selectedClass, subject));
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateFinal = (s: any) => {
    const grades = [s.q1, s.q2, s.q3, s.q4].filter(g => g > 0);
    if (grades.length === 0) return 0;
    return Math.round(grades.reduce((a, b) => a + b) / grades.length);
  };

  const handleGradeChange = (id: number, quarter: string, value: string) => {
    const val = value === '' ? 0 : parseInt(value);
    if (val < 0 || val > 100) return;

    setStudents(students.map(s => 
      s.id === id ? { ...s, [quarter]: val } : s
    ));
  };

  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save each student's grades to Firestore
      for (const student of students) {
        const quarters = ['q1', 'q2', 'q3', 'q4'];
        for (let i = 0; i < quarters.length; i++) {
          const q = quarters[i];
          const val = student[q as keyof typeof student];
          if (val > 0) {
            await dataService.addGrade({
              studentId: student.uid,
              subject: activeTab,
              grade: val,
              date: new Date().toISOString(),
              type: 'exam' // Defaulting to exam for quarterly grades
            });
          }
        }
      }
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving grades:', error);
      alert('Ошибка при сохранении оценок.');
    } finally {
      setIsSaving(false);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text(`AQBOBEK Lyceum - Отчет по предмету: ${activeTab}`, 14, 20);
    doc.setFontSize(11);
    doc.text(`Класс: ${selectedClass} | Учитель: ${profile.name} | Дата: ${new Date().toLocaleDateString()}`, 14, 30);

    const tableColumn = ["№", "ФИО Ученика", "1 Чтв (%)", "2 Чтв (%)", "3 Чтв (%)", "4 Чтв (%)", "ИТОГ (%)"];
    const tableRows: any[] = [];

    students.forEach((s, index) => {
      const studentData = [
        index + 1,
        s.name,
        `${s.q1}%`,
        `${s.q2}%`,
        `${s.q3}%`,
        `${s.q4}%`,
        `${calculateFinal(s)}%`
      ];
      tableRows.push(studentData);
    });

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      theme: 'grid',
      headStyles: { fillColor: [75, 0, 130] },
      styles: { fontSize: 10, cellPadding: 3 },
    });

    doc.save(`Grades_${activeTab}_${selectedClass.replace(/ /g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      <nav className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-indigo-700 rounded-lg flex items-center justify-center shadow-indigo-200 shadow-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-800">AQBOBEK <span className="text-indigo-600">ERP</span></span>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['11 "А"', '11 "Б"', '10 "А"'].map(cls => (
              <button
                key={cls}
                onClick={() => handleClassChange(cls)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
                  selectedClass === cls 
                    ? "bg-white text-indigo-600 shadow-sm" 
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                {cls}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-5">
          <AnimatePresence>
            {showSuccess && (
              <motion.span 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-emerald-600 font-bold flex items-center gap-2 text-xs"
              >
                <CheckCircle2 className="w-4 h-4" />
                Сохранено!
              </motion.span>
            )}
          </AnimatePresence>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-2 text-white shadow-md transition text-sm font-bold",
              isSaving ? "bg-slate-400 cursor-not-allowed" : "bg-emerald-600 hover:bg-emerald-700"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Сохранение...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Сохранить всё
              </>
            )}
          </button>

          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-white shadow-md transition hover:bg-purple-700 text-sm font-bold"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <BrainCircuit className="w-4 h-4" />
            )}
            ИИ Анализ файла
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
            accept=".csv,.txt,.tsv"
          />

          <button 
            onClick={exportToPDF}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-white shadow-md transition hover:bg-indigo-700 text-sm font-bold"
          >
            <Download className="w-4 h-4" />
            Скачать PDF
          </button>
          
          <div className="h-8 w-px bg-slate-200 mx-1"></div>

          <div className="relative">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{profile.name}</p>
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-1">{profile.role}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-sm overflow-hidden">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>
              <ChevronDown className={cn("w-4 h-4 text-slate-400 transition-transform", isProfileOpen && "rotate-180")} />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 overflow-hidden">
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium"
                >
                  <LogOut className="w-4 h-4" /> Выйти
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 p-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-indigo-900 tracking-tight">Панель учителя</h1>
            <p className="text-slate-500 font-medium mt-1">Классный журнал: <span className="text-indigo-600 font-bold">{selectedClass}</span></p>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Поиск ученика..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white border border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium text-sm"
            />
          </div>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2">
          {['Физика', 'Математика', 'История КЗ', 'Информатика', 'Английский'].map(subject => (
            <button
              key={subject}
              onClick={() => handleSubjectChange(subject)}
              className={cn(
                "rounded-2xl px-8 py-3 text-sm font-black uppercase tracking-widest transition-all shadow-sm whitespace-nowrap",
                activeTab === subject 
                  ? "bg-indigo-600 text-white shadow-indigo-200 ring-4 ring-indigo-500/20" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-200"
              )}
            >
              {subject}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-[32px] bg-white shadow-2xl shadow-slate-200/50 border border-slate-200">
          {/* AI Analysis Result Section */}
          <AnimatePresence>
            {analysisResult && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="bg-indigo-50/50 border-b border-indigo-100 overflow-hidden"
              >
                <div className="p-8 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-600 rounded-xl text-white">
                        <BrainCircuit className="w-6 h-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-indigo-900 uppercase tracking-tight">ИИ Анализ успеваемости</h2>
                        <p className="text-indigo-600/70 text-xs font-bold uppercase tracking-widest">Отчет сформирован на основе ваших данных</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAnalysisResult(null)}
                      className="p-2 hover:bg-indigo-100 rounded-full transition-colors text-indigo-400"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-indigo-900 font-black uppercase text-xs tracking-wider">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        Лучшие ученики
                      </div>
                      <ul className="space-y-2">
                        {analysisResult.topPerformers.map((name: string, i: number) => (
                          <li key={i} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                            <span className="w-6 h-6 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-[10px]">{i+1}</span>
                            {name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-indigo-900 font-black uppercase text-xs tracking-wider">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        Группа риска
                      </div>
                      <div className="space-y-3">
                        {analysisResult.studentsAtRisk.map((s: any, i: number) => (
                          <div key={i} className="space-y-1">
                            <p className="text-sm font-black text-slate-800">{s.name}</p>
                            <p className="text-[10px] text-red-500 font-bold leading-tight">{s.reason}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl border border-indigo-100 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-indigo-900 font-black uppercase text-xs tracking-wider">
                        <Lightbulb className="w-4 h-4 text-emerald-500" />
                        Средний балл и план
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-black text-indigo-600">{analysisResult.classAverage}%</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase mb-2">Средний по классу</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic">
                          "{analysisResult.improvementPlan}"
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-600/5 p-4 rounded-2xl border border-indigo-600/10">
                    <p className="text-sm text-indigo-900 font-medium leading-relaxed">
                      <span className="font-black uppercase text-[10px] tracking-widest block mb-1 opacity-50">Резюме ИИ:</span>
                      {analysisResult.summary}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">
                  <th className="px-8 py-6">№</th>
                  <th className="px-8 py-6">ФИО Ученика</th>
                  <th className="px-6 py-6 text-center">1 Чтв</th>
                  <th className="px-6 py-6 text-center">2 Чтв</th>
                  <th className="px-6 py-6 text-center">3 Чтв</th>
                  <th className="px-6 py-6 text-center">4 Чтв</th>
                  <th className="px-8 py-6 text-center text-indigo-600 bg-indigo-50/30">Итоговая (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => (
                    <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 text-slate-400 font-bold">{idx + 1}</td>
                      <td className="px-8 py-5 font-bold flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black border border-indigo-100 group-hover:scale-110 transition-transform">
                          {student.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="text-slate-800">{student.name}</span>
                      </td>
                      {['q1', 'q2', 'q3', 'q4'].map(q => (
                        <td key={q} className="px-6 py-5">
                          <input 
                            type="number"
                            value={student[q as keyof typeof student]}
                            onChange={(e) => handleGradeChange(student.id, q, e.target.value)}
                            className="w-16 mx-auto block rounded-xl border-2 border-transparent bg-slate-50 p-2 text-center font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                          />
                        </td>
                      ))}
                      <td className="px-8 py-5 font-black text-indigo-600 text-center text-lg bg-indigo-50/10">
                        {calculateFinal(student)}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-20 text-center text-slate-400 font-medium italic">
                      Ничего не найдено по вашему запросу...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
