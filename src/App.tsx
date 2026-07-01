/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useStore } from "./store";
import { Home } from "./screens/Home";
import { Stats } from "./screens/Stats";
import { ProfileScreen } from "./screens/Profile";
import { SettingsScreen } from "./screens/Settings";
import { Login } from "./screens/Login";
import { BottomNav, SideNav } from "./components/Navigation";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "./lib/supabase";

function TrialBanner({ createdAt, email }: { createdAt: string | null, email: string | null }) {
  if (!createdAt) return null;
  if (email === "veraspatrick@gmail.com" || email === "atendimento@reservaja.com.br") return null;
  
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const remaining = 3 - diffDays;
  
  let message = "";
  if (remaining >= 3) message = "Faltam 3 dias para vencer. Renove para continuar usando o aplicativo.";
  else if (remaining === 2) message = "Faltam 2 dias para vencer. Renove para continuar usando o aplicativo.";
  else if (remaining === 1) message = "Vence amanhã. Renove para continuar usando o aplicativo.";
  else if (remaining === 0) message = "Vence hoje. Renove para continuar usando o aplicativo.";
  else message = "Período de teste expirado. Renove para continuar usando o aplicativo.";

  return (
    <div className="bg-yellow-500 text-yellow-950 px-4 py-2 text-center text-sm font-medium shadow-sm flex items-center justify-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
      {message}
    </div>
  );
}

export default function App() {
  const {
    goals,
    profile,
    settings,
    setProfile,
    setSettings,
    addGoal,
    updateGoal,
    deleteGoal,
    addMoney,
    removeMoney,
    importData,
    isLoaded,
    isAuthenticated,
    setIsAuthenticated,
    userCreatedAt,
    userEmail
  } = useStore();

  const [currentTab, setCurrentTab] = useState("home");

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-[#00C853] animate-pulse">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  const renderScreen = () => {
    switch (currentTab) {
      case "home":
        return (
          <Home
            goals={goals}
            profile={profile}
            onAddGoal={addGoal}
            onUpdateGoal={updateGoal}
            onDeleteGoal={deleteGoal}
            onAddMoney={addMoney}
            onRemoveMoney={removeMoney}
          />
        );
      case "stats":
        return <Stats goals={goals} profile={profile} />;
      case "profile":
        return (
          <ProfileScreen
            profile={profile}
            onUpdateProfile={setProfile}
            onLogout={async () => {
              await supabase.auth.signOut();
            }}
          />
        );
      case "settings":
        return (
          <SettingsScreen
            settings={settings}
            onUpdateSettings={setSettings}
            fullData={{ goals, profile, settings }}
            onImportData={importData}
            profile={profile}
            onUpdateProfile={setProfile}
            isAdmin={userEmail === "veraspatrick@gmail.com" || userEmail === "atendimento@reservaja.com.br"}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 selection:bg-green-500/30 flex-col md:flex-row">
      <SideNav currentTab={currentTab} onTabChange={setCurrentTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <TrialBanner createdAt={userCreatedAt} email={userEmail} />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="p-4 sm:p-6 md:p-8">
            <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderScreen()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      
      <div className="md:hidden">
        <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
      </div>
      </div>
    </div>
  );
}
