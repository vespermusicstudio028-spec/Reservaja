import React from "react";
import {
  Target,
  BarChart2,
  User,
  Settings as SettingsIcon,
} from "lucide-react";
import { cn } from "../utils";
import logoImg from "../assets/images/reserva_ja_logo_1782703217853.jpg";

interface NavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export function BottomNav({ currentTab, onTabChange }: NavProps) {
  const tabs = [
    { id: "home", label: "Metas", icon: Target },
    { id: "stats", label: "Estatísticas", icon: BarChart2 },
    { id: "profile", label: "Perfil", icon: User },
    { id: "settings", label: "Config.", icon: SettingsIcon },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/80 pb-safe pt-2 backdrop-blur-md dark:border-gray-800 dark:bg-gray-900/80 md:hidden">
      <div className="mx-auto flex max-w-md justify-around px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex min-w-[64px] flex-col items-center gap-1 rounded-xl p-2 text-xs transition-colors",
                isActive
                  ? "text-[#00C853] font-medium"
                  : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white",
              )}
            >
              <Icon className={cn("h-6 w-6", isActive && "stroke-[2.5px]")} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SideNav({ currentTab, onTabChange }: NavProps) {
  const tabs = [
    { id: "home", label: "Metas", icon: Target },
    { id: "stats", label: "Estatísticas", icon: BarChart2 },
    { id: "profile", label: "Perfil", icon: User },
    { id: "settings", label: "Configurações", icon: SettingsIcon },
  ];

  return (
    <div className="hidden h-full w-64 flex-col border-r border-gray-200 bg-white px-4 py-8 dark:border-gray-800 dark:bg-gray-900 md:flex">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm overflow-hidden bg-white">
          <img
            src={logoImg}
            alt="Logo"
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <h1 className="font-bold text-gray-900 dark:text-white">
            Reserva Já
          </h1>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-50 text-[#00C853] dark:bg-green-900/20"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white",
              )}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
