import { useState, useEffect, useCallback } from 'react';
import { Goal, Profile, Settings } from './types';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from './lib/supabase';

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
  const [userId, setUserId] = useState<string | null>(null);

  // Listen to Supabase auth state
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email ?? null);
        setUserId(session.user.id);
        await loadUserData(session.user.id);
      } else {
        setIsAuthenticated(false);
        setUserEmail(null);
        setUserId(null);
        setGoals([]);
        setProfile(defaultProfile);
        setSettings(defaultSettings);
        setIsLoaded(true);
      }
    });

    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setIsLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (uid: string) => {
    try {
      // Load profile/settings
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', uid)
        .single();

      if (userData) {
        console.log("Loaded userData from Supabase:", userData);
        if (userData.profile) setProfile({ ...defaultProfile, ...userData.profile });
        if (userData.settings) setSettings({ ...defaultSettings, ...userData.settings });
        if (userData.created_at) setUserCreatedAt(userData.created_at);
      }

      // Load goals
      const { data: goalsData } = await supabase
        .from('goals')
        .select('data')
        .eq('user_id', uid);

      if (goalsData) {
        setGoals(goalsData.map((g: any) => g.data as Goal));
      }
    } catch (e) {
      console.error('Failed to load user data', e);
    } finally {
      setIsLoaded(true);
    }
  };

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

  const handleSetProfile = useCallback(async (newProfile: Profile) => {
    setProfile(newProfile);
    if (!userId) return;
    const { data, error, status } = await supabase.from('users').update({ profile: newProfile }).eq('id', userId).select();
    console.log("Supabase profile update response:", { data, error, status });
    if (error) {
      console.error('Failed to save profile:', error);
      alert('Erro ao salvar no banco de dados: ' + error.message);
    } else if (!data || data.length === 0) {
      console.warn('Profile update succeeded but no rows were updated (possible RLS issue).');
      alert('Aviso: As alterações parecem não ter sido salvas no banco de dados (erro de permissão/RLS).');
    }
  }, [userId]);

  // Update settings
  const handleSetSettings = useCallback(async (newSettings: Settings) => {
    setSettings(newSettings);
    if (!userId) return;
    await supabase.from('users').update({ settings: newSettings }).eq('id', userId);
  }, [userId]);

  // Sync goals to Supabase
  const saveGoals = useCallback(async (newGoals: Goal[]) => {
    setGoals(newGoals);
    if (!userId) return;
    try {
      // Delete all and re-insert (simple sync strategy)
      await supabase.from('goals').delete().eq('user_id', userId);
      if (newGoals.length > 0) {
        await supabase.from('goals').insert(
          newGoals.map(g => ({ user_id: userId, goal_id: g.id, data: g }))
        );
      }
    } catch (e) {
      console.error('Failed to save goals', e);
    }
  }, [userId]);

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
            history: [...goal.history, { id: uuidv4(), date: new Date().toISOString(), amount: actualAdded }],
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
            history: [...goal.history, { id: uuidv4(), date: new Date().toISOString(), amount: -actualRemoved }],
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
