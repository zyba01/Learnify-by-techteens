import React from 'react';
import { UserProfile } from '../types';
import { 
  LayoutDashboard, 
  History, 
  BrainCircuit, 
  ShieldAlert, 
  Tv, 
  LogOut, 
  GraduationCap,
  Trophy,
  Book,
  Flame
} from 'lucide-react';
import { cn } from '../lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  profile: UserProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
}

export function Layout({ children, profile, activeTab, setActiveTab, onLogout, theme = 'dark' }: LayoutProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: LayoutDashboard },
    { id: 'diary', label: 'Дневник', icon: Book },
    { id: 'history', label: 'История', icon: History },
    { id: 'mentor', label: 'Наставник', icon: BrainCircuit },
    { id: 'risk', label: 'Аналитика', icon: ShieldAlert },
    { id: 'kiosk', label: 'Режим киоска', icon: Tv },
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
          <GraduationCap className="w-8 h-8 text-purple-500" />
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
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20" 
                  : theme === 'dark' 
                    ? "text-gray-400 hover:bg-white/5 hover:text-white"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5",
                activeTab === item.id ? "text-white" : "text-gray-500 group-hover:text-purple-500"
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
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center font-black text-lg text-white shadow-lg">
              {profile.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black truncate uppercase italic text-sm">{profile.name}</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-black">{profile.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              "rounded-2xl p-3 flex flex-col items-center",
              theme === 'dark' ? "bg-white/5" : "bg-gray-100"
            )}>
              <Trophy className="w-4 h-4 text-yellow-500 mb-1" />
              <span className="text-[10px] text-gray-500 uppercase font-black">Уровень</span>
              <span className="font-black">{profile.level}</span>
            </div>
            <div className={cn(
              "rounded-2xl p-3 flex flex-col items-center",
              theme === 'dark' ? "bg-white/5" : "bg-gray-100"
            )}>
              <Flame className="w-4 h-4 text-purple-500 mb-1" />
              <span className="text-[10px] text-gray-500 uppercase font-black">Стрик</span>
              <span className="font-black">{profile.streak}д</span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 hover:text-red-400 transition-colors text-[10px] font-black uppercase tracking-widest"
          >
            <LogOut className="w-4 h-4" />
            Выйти
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative">
        <div className={cn(
          "absolute top-0 right-0 w-[500px] h-[500px] blur-[120px] rounded-full -z-10 opacity-20",
          theme === 'dark' ? "bg-purple-500/20" : "bg-purple-500/10"
        )} />
        <div className={cn(
          "absolute bottom-0 left-0 w-[400px] h-[400px] blur-[120px] rounded-full -z-10 opacity-20",
          theme === 'dark' ? "bg-blue-500/20" : "bg-blue-500/10"
        )} />
        
        <div className="p-10 max-w-7xl mx-auto h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
