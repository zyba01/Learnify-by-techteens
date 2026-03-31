import React, { useState, useEffect } from 'react';
import { UserProfile, UserRole } from './types';
import { dataService } from './services/dataService';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Diary } from './components/Diary';
import { StudentHistory } from './components/StudentHistory';
import { AdminTeacherDashboard } from './components/AdminTeacherDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ParentDashboard } from './components/ParentDashboard';
import { KioskMode } from './components/KioskMode';
import { Mentor } from './components/Mentor';
import { RiskRadar } from './components/RiskRadar';
import { MockDataGenerator } from './components/MockDataGenerator';
import { SchoolHelper } from './components/SchoolHelper';
import { LogIn, GraduationCap, ShieldAlert, BookOpen, Tv, BrainCircuit, Trophy, Moon, Sun, School, Users, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './lib/utils';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isHelperOpen, setIsHelperOpen] = useState(false);

  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = dataService.onAuthChange((user) => {
      setProfile(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleLogin = async (role: UserRole) => {
    if (isLoggingIn) return;
    
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await dataService.login(role);
      // Note: Supabase OAuth redirects the page, so the code below might not execute immediately
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError('Произошла ошибка при входе. Попробуйте еще раз.');
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await dataService.logout();
    setProfile(null);
  };

  if (loading) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        theme === 'dark' ? "bg-gray-950" : "bg-gray-50"
      )}>
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-t-2 border-purple-500 rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={cn(
        "min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500",
        theme === 'dark' ? "bg-gray-950 text-white" : "bg-gray-50 text-gray-900"
      )}>
        <button 
          onClick={toggleTheme}
          className={cn(
            "fixed top-8 right-8 p-3 rounded-2xl transition-all hover:scale-110",
            theme === 'dark' ? "bg-white/5 hover:bg-white/10" : "bg-white shadow-lg hover:bg-gray-50"
          )}
        >
          {theme === 'dark' ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-purple-500" />}
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center space-y-12"
        >
          <div className="space-y-4">
            <div className="relative inline-block">
              <GraduationCap className="w-20 h-20 text-purple-500 mx-auto" />
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 rounded-full blur-lg opacity-50"
              />
            </div>
            <h1 className="text-5xl font-black tracking-tighter uppercase italic">Aqbobek Lyceum</h1>
            <p className="text-gray-500 font-medium tracking-wide">Единый школьный портал</p>
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-sm font-bold"
              >
                {loginError}
              </motion.div>
            )}
            {[
              { role: 'student' as UserRole, label: 'Войти как Ученик', icon: GraduationCap, color: 'bg-purple-500' },
              { role: 'parent' as UserRole, label: 'Войти как Родитель', icon: Users, color: 'bg-emerald-500' },
              { role: 'teacher' as UserRole, label: 'Войти как Учитель', icon: BookOpen, color: 'bg-blue-600' },
              { role: 'admin' as UserRole, label: 'Войти как Админ', icon: School, color: 'bg-gray-800' },
            ].map((btn) => (
              <button
                key={btn.role}
                disabled={isLoggingIn}
                onClick={() => handleLogin(btn.role)}
                className={cn(
                  "w-full flex items-center justify-between gap-4 px-8 py-5 rounded-[24px] font-black text-lg transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] group",
                  theme === 'dark' ? "bg-white/5 border border-white/5 hover:bg-white/10" : "bg-white shadow-xl border border-gray-100 hover:border-purple-500/50",
                  isLoggingIn && "opacity-50 cursor-not-allowed grayscale"
                )}
              >
                <div className="flex items-center gap-4">
                  <div className={cn("p-3 rounded-2xl text-white", btn.color)}>
                    {isLoggingIn ? <Loader2 className="w-6 h-6 animate-spin" /> : <btn.icon className="w-6 h-6" />}
                  </div>
                  <span>{btn.label}</span>
                </div>
                <LogIn className="w-5 h-5 text-gray-500 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
              </button>
            ))}
          </div>
          
          <div className="pt-8 grid grid-cols-3 gap-4 text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">
            <div className="space-y-2">
              <BrainCircuit className="w-5 h-5 mx-auto opacity-30" />
              <span>Наставник</span>
            </div>
            <div className="space-y-2">
              <ShieldAlert className="w-5 h-5 mx-auto opacity-30" />
              <span>Аналитика</span>
            </div>
            <div className="space-y-2">
              <Trophy className="w-5 h-5 mx-auto opacity-30" />
              <span>Геймификация</span>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (profile.role === 'admin') {
    return (
      <>
        <AdminDashboard profile={profile} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
        <HelperButton theme={theme} onClick={() => setIsHelperOpen(true)} />
        <SchoolHelper isOpen={isHelperOpen} onClose={() => setIsHelperOpen(false)} theme={theme} profile={profile} />
      </>
    );
  }

  if (profile.role === 'teacher') {
    return (
      <>
        <AdminTeacherDashboard profile={profile} onLogout={handleLogout} />
        <HelperButton theme="light" onClick={() => setIsHelperOpen(true)} />
        <SchoolHelper isOpen={isHelperOpen} onClose={() => setIsHelperOpen(false)} theme="light" profile={profile} />
      </>
    );
  }

  if (profile.role === 'parent') {
    return (
      <div className={theme === 'dark' ? 'dark' : ''}>
        <ParentDashboard profile={profile} onLogout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
        <HelperButton theme={theme} onClick={() => setIsHelperOpen(true)} />
        <SchoolHelper isOpen={isHelperOpen} onClose={() => setIsHelperOpen(false)} theme={theme} profile={profile} />
      </div>
    );
  }

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Layout 
        profile={profile} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      >
        <div className="fixed top-8 right-8 z-50 flex gap-4">
          <button 
            onClick={toggleTheme}
            className={cn(
              "p-3 rounded-2xl transition-all hover:scale-110 shadow-lg",
              theme === 'dark' ? "bg-white/5 hover:bg-white/10 text-yellow-500" : "bg-white hover:bg-gray-50 text-purple-500"
            )}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {activeTab === 'dashboard' && <Dashboard profile={profile} />}
            {activeTab === 'diary' && <Diary profile={profile} />}
            {activeTab === 'history' && <StudentHistory profile={profile} />}
            {activeTab === 'mentor' && <Mentor profile={profile} />}
            {activeTab === 'risk' && <RiskRadar profile={profile} />}
            {activeTab === 'kiosk' && <KioskMode />}
          </motion.div>
        </AnimatePresence>
        <MockDataGenerator profile={profile} />
        <HelperButton theme={theme} onClick={() => setIsHelperOpen(true)} />
        <SchoolHelper isOpen={isHelperOpen} onClose={() => setIsHelperOpen(false)} theme={theme} profile={profile} />
      </Layout>
    </div>
  );
}

function HelperButton({ theme, onClick }: { theme: 'light' | 'dark', onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className={cn(
        "fixed bottom-8 right-8 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center z-[60] transition-all group overflow-hidden",
        theme === 'dark' ? "bg-purple-500 text-white" : "bg-purple-600 text-white"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <Sparkles className="w-6 h-6" />
    </motion.button>
  );
}
