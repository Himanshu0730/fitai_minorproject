export interface UserProfile {
  fullName: string;
  email: string;
  currentWeight: number; // in kg or lbs
  targetWeight: number;
  height: number; // in cm
  gender: 'male' | 'female' | 'other' | '';
  age: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  calorieGoal: number;
  proteinGoal: number; // in g
  carbsGoal: number; // in g
  fatGoal: number; // in g
  weightUnit: 'lbs' | 'kg';
  onboardingComplete: boolean;
}

export interface WeightLog {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number;
  notes?: string;
}

export interface MealLog {
  id: string;
  name: string;
  timestamp: string; // ISO string
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface FoodScanResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  healthScore: number; // 1-100
  confidence: number; // 0-1
  summary: string;
  breakdown: string;
  dietaryTags: string[];
}
