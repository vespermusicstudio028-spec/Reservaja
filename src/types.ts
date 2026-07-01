export interface GoalHistory {
  id: string;
  date: string; // ISO string
  amount: number;
}

export interface Goal {
  id: string;
  name: string;
  imageUrl: string;
  productUrl?: string;
  targetAmount: number;
  savedAmount: number;
  installments?: number;
  installmentValue?: number;
  bank?: string;
  createdAt: string; // ISO string
  history: GoalHistory[];
}

export interface Profile {
  name: string;
  photoUrl: string;
  currency: string;
  customBanks?: Record<string, string>;
}

export interface Settings {
  theme: 'light' | 'dark' | 'system';
}

export type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest' | 'closest';
