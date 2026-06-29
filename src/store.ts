import { useState, useEffect, useCallback } from 'react';
import { Goal, Profile, Settings } from './types';
import { v4 as uuidv4 } from 'uuid';

const defaultProfile: Profile = {
  name: 'Usuário',
  photoUrl: '',
  currency: 'BRL',
};

const defaultSettings: Settings = {
  theme: 'system',
};

export function useStore() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userCreatedAt, setUserCreatedAt] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Sync with backend
  useEffect(() => {
    const token = localStorage.getItem('reservaja_token');
    if (!token) {
      setIsLoaded(true);
      setIsAuthenticated(false);
      return;
    }
    
    setIsAuthenticated(true);
    
    fetch('/api/sync', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) throw new Error('Auth failed');
      return res.json();
    })
    .then(data => {
      if (data.goals) setGoals(data.goals);
      if (data.profile) setProfile({ ...defaultProfile, ...data.profile });
      if (data.settings) setSettings({ ...defaultSettings, ...data.settings });
      if (data.createdAt) setUserCreatedAt(data.createdAt);
      if (data.email) setUserEmail(data.email);
    })
    .catch(e => {
      console.error('Failed to load from backend', e);
      // Fallback or handle auth error
      if (e.message === 'Auth failed') {
        localStorage.removeItem('reservaja_token');
        setIsAuthenticated(false);
      }
    })
    .finally(() => {
      setIsLoaded(true);
    });
  }, [isAuthenticated]);

  // Save changes to backend
  const saveToBackend = useCallback(async (endpoint: string, data: any) => {
    const token = localStorage.getItem('reservaja_token');
    if (!token) return;
    try {
      await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(data)
      });
    } catch (e) {
      console.error(`Failed to save ${endpoint}`, e);
    }
  }, []);

  // Update profile
  const handleSetProfile = useCallback((newProfile: Profile) => {
    setProfile(newProfile);
    saveToBackend('profile', { profile: newProfile });
  }, [saveToBackend]);

  // Update settings
  const handleSetSettings = useCallback((newSettings: Settings) => {
    setSettings(newSettings);
    saveToBackend('settings', { settings: newSettings });
  }, [saveToBackend]);

  // Apply theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (settings.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  const saveGoals = useCallback((newGoals: Goal[]) => {
    setGoals(newGoals);
    saveToBackend('goals/sync', { goals: newGoals });
  }, [saveToBackend]);

  const addGoal = useCallback((goal: Omit<Goal, 'id' | 'createdAt' | 'savedAmount' | 'history'>) => {
    const newGoal: Goal = {
      ...goal,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      savedAmount: 0,
      history: [],
    };
    saveGoals([...goals, newGoal]);
  }, [goals, saveGoals]);

  const updateGoal = useCallback((id: string, updates: Partial<Omit<Goal, 'id' | 'createdAt' | 'savedAmount' | 'history'>>) => {
    saveGoals(goals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)));
  }, [goals, saveGoals]);

  const deleteGoal = useCallback((id: string) => {
    saveGoals(goals.filter((g) => g.id !== id));
  }, [goals, saveGoals]);

  const addMoney = useCallback((goalId: string, amount: number) => {
    saveGoals(goals.map((goal) => {
      if (goal.id === goalId) {
        const newSavedAmount = Math.min(goal.savedAmount + amount, goal.targetAmount);
        const actualAdded = newSavedAmount - goal.savedAmount;

        if (actualAdded > 0) {
          return {
            ...goal,
            savedAmount: newSavedAmount,
            history: [
              ...goal.history,
              { id: uuidv4(), date: new Date().toISOString(), amount: actualAdded },
            ],
          };
        }
      }
      return goal;
    }));
  }, [goals, saveGoals]);

  const removeMoney = useCallback((goalId: string, amount: number) => {
    saveGoals(goals.map((goal) => {
      if (goal.id === goalId) {
        const newSavedAmount = Math.max(goal.savedAmount - amount, 0);
        const actualRemoved = goal.savedAmount - newSavedAmount;

        if (actualRemoved > 0) {
          return {
            ...goal,
            savedAmount: newSavedAmount,
            history: [
              ...goal.history,
              { id: uuidv4(), date: new Date().toISOString(), amount: -actualRemoved },
            ],
          };
        }
      }
      return goal;
    }));
  }, [goals, saveGoals]);

  const importData = useCallback((data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.goals) saveGoals(parsed.goals);
      if (parsed.profile) handleSetProfile(parsed.profile);
      if (parsed.settings) handleSetSettings(parsed.settings);
      return true;
    } catch (e) {
      console.error('Failed to import data', e);
      return false;
    }
  }, [saveGoals, handleSetProfile, handleSetSettings]);

  return {
    goals,
    profile,
    settings,
    setProfile: handleSetProfile,
    setSettings: handleSetSettings,
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
  };
}
