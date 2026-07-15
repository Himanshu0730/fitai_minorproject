import React, { useState, useEffect } from 'react';
import { 
  Home, Camera, MessageSquare, User, Dumbbell, 
  Sparkles, LogOut, ShieldCheck 
} from 'lucide-react';
import Signup from './components/Signup';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import MacroScanner from './components/MacroScanner';
import AICoach from './components/AICoach';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import { UserProfile, WeightLog, MealLog, Message } from './types';
import { motion } from 'motion/react';
import { authService, profileService, weightLogsService, mealLogsService, chatHistoryService } from './lib/supabase';

// -------------------------------------------------------------
// Default / Simulated Initial State (New users start fresh and empty)
// -------------------------------------------------------------
const DEFAULT_PROFILE: UserProfile = {
  fullName: "",
  email: "",
  currentWeight: 0,
  targetWeight: 0,
  height: 0,
  gender: "",
  age: 0,
  activityLevel: "moderate",
  calorieGoal: 0,
  proteinGoal: 0,
  carbsGoal: 0,
  fatGoal: 0,
  weightUnit: "lbs",
  onboardingComplete: false
};

const DEFAULT_WEIGHT_LOGS: WeightLog[] = [];
const DEFAULT_MEAL_LOGS: MealLog[] = [];
const DEFAULT_CHAT: Message[] = [];

type AppScreen = 'landing' | 'signup' | 'login' | 'dashboard' | 'scanner' | 'coach' | 'profile';

export default function App() {
  // Navigation states
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Default to false so the premium Landing Page is the public face on initial load!
  const [userId, setUserId] = useState<string | null>(null);

  // Core Data State
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>(DEFAULT_WEIGHT_LOGS);
  const [mealLogs, setMealLogs] = useState<MealLog[]>(DEFAULT_MEAL_LOGS);
  const [chatHistory, setChatHistory] = useState<Message[]>(DEFAULT_CHAT);

  // Restore user session on mount
  useEffect(() => {
    const session = authService.getCurrentSession();
    if (session) {
      setUserId(session.id);
      setIsAuthenticated(true);
      setCurrentScreen('dashboard');
    }
  }, []);

  // Fetch from database whenever user session is established
  useEffect(() => {
    if (isAuthenticated && userId) {
      profileService.getProfile(userId).then(p => {
        setUserProfile(p);
        if (!p.onboardingComplete) {
          setCurrentScreen('profile');
        }
      });
      weightLogsService.getWeightLogs(userId).then(w => setWeightLogs(w));
      mealLogsService.getMealLogs(userId).then(m => setMealLogs(m));
      chatHistoryService.getChatHistory(userId).then(c => setChatHistory(c));
    }
  }, [isAuthenticated, userId]);

  // Force profile screen when onboarding is incomplete
  useEffect(() => {
    if (isAuthenticated && !userProfile.onboardingComplete) {
      setCurrentScreen('profile');
    }
  }, [isAuthenticated, userProfile.onboardingComplete]);

  const saveProfile = async (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    if (userId) {
      await profileService.updateProfile(userId, newProfile);
    }
  };

  const addWeightLog = async (weight: number, date: string, notes?: string) => {
    const newLog: WeightLog = {
      id: Math.random().toString(36).substring(7),
      date,
      weight,
      notes
    };
    const updated = [newLog, ...weightLogs];
    setWeightLogs(updated);

    if (userId) {
      await weightLogsService.addWeightLog(userId, newLog);

      // Also update current weight on profile
      const updatedProfile = { ...userProfile, currentWeight: weight };
      setUserProfile(updatedProfile);
      await profileService.updateProfile(userId, updatedProfile);
    }
  };

  const deleteWeightLog = async (id: string) => {
    const updated = weightLogs.filter(log => log.id !== id);
    setWeightLogs(updated);
    if (userId) {
      await weightLogsService.deleteWeightLog(userId, id);
    }
  };

  const addMealLog = async (meal: Omit<MealLog, 'id' | 'timestamp'>) => {
    const newMeal: MealLog = {
      ...meal,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString()
    };
    const updated = [newMeal, ...mealLogs];
    setMealLogs(updated);
    if (userId) {
      await mealLogsService.addMealLog(userId, newMeal);
    }
  };

  const addChatMessage = async (msg: Message) => {
    const updated = [...chatHistory, msg];
    setChatHistory(updated);
    if (userId) {
      await chatHistoryService.addChatMessage(userId, msg);
    }
  };

  const clearChatHistory = async () => {
    setChatHistory([]);
    if (userId) {
      await chatHistoryService.clearChatHistory(userId);
    }
  };

  // Auth Navigation Callbacks
  const handleAuthSuccess = (user: { id?: string; fullName: string; email: string }) => {
    const activeUserId = user.id || 'simulated-user-id';
    setUserId(activeUserId);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUserId(null);
    setIsAuthenticated(false);
    setCurrentScreen('landing');
  };

  // Render current active layout
  const renderScreen = () => {
    if (!isAuthenticated) {
      if (currentScreen === 'login') {
        return <Login onSuccess={handleAuthSuccess} onNavigateToSignup={() => setCurrentScreen('signup')} />;
      }
      if (currentScreen === 'signup') {
        return <Signup onSuccess={handleAuthSuccess} onNavigateToLogin={() => setCurrentScreen('login')} />;
      }
      return (
        <LandingPage 
          onGetStarted={() => setCurrentScreen('signup')}
          onLogin={() => setCurrentScreen('login')}
          onTryDirectly={() => handleAuthSuccess({ id: "demo-jamie", fullName: "Jamie Vance", email: "jamie.vance@example.com" })}
        />
      );
    }

    switch (currentScreen) {
      case 'dashboard':
        return (
          <Dashboard 
            userProfile={userProfile}
            weightLogs={weightLogs}
            mealLogs={mealLogs}
            onAddWeightLog={addWeightLog}
            onDeleteWeightLog={deleteWeightLog}
            onNavigateToScanner={() => setCurrentScreen('scanner')}
            onNavigateToCoach={() => setCurrentScreen('coach')}
          />
        );
      case 'scanner':
        return (
          <MacroScanner 
            onAddMealLog={addMealLog}
            onNavigateToDashboard={() => setCurrentScreen('dashboard')}
          />
        );
      case 'coach':
        return (
          <AICoach 
            userProfile={userProfile}
            chatHistory={chatHistory}
            onAddChatMessage={addChatMessage}
            onClearChatHistory={clearChatHistory}
            onLogMealFromCoach={addMealLog}
          />
        );
      case 'profile':
        return (
          <Profile 
            userProfile={userProfile}
            onUpdateProfile={saveProfile}
            onLogout={handleLogout}
          />
        );
      default:
        return <div className="text-gray-400 text-center py-12">Tab under development.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F13] text-gray-100 selection:bg-emerald-500 selection:text-white flex flex-col justify-between">
      
      {/* Upper Navigation Header (Only visible if authenticated) */}
      {isAuthenticated && (
        <header id="app-nav-header" className="sticky top-0 z-40 backdrop-blur-md bg-[#0B0F13]/80 border-b border-gray-800/60 py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            
            {/* Left Brand Badge */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-linear-to-tr from-[#10B981] to-[#059669] flex items-center justify-center shadow-md shadow-emerald-950/20">
                <Dumbbell className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <span className="block font-bold text-white text-sm tracking-tight">FitAI</span>
                <span className="block text-[8px] text-emerald-400 font-bold uppercase tracking-widest font-mono">Fitness Buddy</span>
              </div>
            </div>

            {/* Center Desktop Navigation Row */}
            <nav className="hidden md:flex items-center gap-1.5 bg-[#141A21] border border-gray-800/80 p-1.5 rounded-2xl">
              <button
                disabled={!userProfile.onboardingComplete}
                onClick={() => setCurrentScreen('dashboard')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  !userProfile.onboardingComplete
                    ? 'opacity-40 cursor-not-allowed text-gray-500'
                    : currentScreen === 'dashboard' 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/20' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                <Home className="w-3.5 h-3.5" /> Dashboard
              </button>
              <button
                disabled={!userProfile.onboardingComplete}
                onClick={() => setCurrentScreen('scanner')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  !userProfile.onboardingComplete
                    ? 'opacity-40 cursor-not-allowed text-gray-500'
                    : currentScreen === 'scanner' 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/20' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                <Camera className="w-3.5 h-3.5" /> Macro Scanner
              </button>
              <button
                disabled={!userProfile.onboardingComplete}
                onClick={() => setCurrentScreen('coach')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  !userProfile.onboardingComplete
                    ? 'opacity-40 cursor-not-allowed text-gray-500'
                    : currentScreen === 'coach' 
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/20' 
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> AI Coach
              </button>
              <button
                onClick={() => setCurrentScreen('profile')}
                className={`flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer ${
                  currentScreen === 'profile' 
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-950/20' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/30'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Account
              </button>
            </nav>

            {/* Right Mini stats */}
            <div className="flex items-center gap-3">
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>
        </header>
      )}

      {/* Main Container Stage */}
      <main className={`flex-1 ${isAuthenticated ? 'max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8' : ''}`}>
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="h-full"
        >
          {renderScreen()}
        </motion.div>
      </main>

      {/* Bottom Mobile Tab Bar (Only visible if authenticated and mobile) */}
      {isAuthenticated && (
        <div id="mobile-nav-bar" className="md:hidden sticky bottom-0 z-40 bg-[#141A21]/90 backdrop-blur-lg border-t border-gray-800/60 py-2.5 px-6 flex justify-around items-center">
          <button 
            disabled={!userProfile.onboardingComplete}
            onClick={() => setCurrentScreen('dashboard')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              !userProfile.onboardingComplete 
                ? 'opacity-40 cursor-not-allowed text-gray-500' 
                : currentScreen === 'dashboard' ? 'text-emerald-400 scale-105 font-semibold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Home className="w-4.5 h-4.5" />
            <span className="text-[9px]">Home</span>
          </button>
          
          <button 
            disabled={!userProfile.onboardingComplete}
            onClick={() => setCurrentScreen('scanner')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              !userProfile.onboardingComplete 
                ? 'opacity-40 cursor-not-allowed text-gray-500' 
                : currentScreen === 'scanner' ? 'text-emerald-400 scale-105 font-semibold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Camera className="w-4.5 h-4.5" />
            <span className="text-[9px]">Scanner</span>
          </button>

          <button 
            disabled={!userProfile.onboardingComplete}
            onClick={() => setCurrentScreen('coach')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${
              !userProfile.onboardingComplete 
                ? 'opacity-40 cursor-not-allowed text-gray-500' 
                : currentScreen === 'coach' ? 'text-emerald-400 scale-105 font-semibold' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <MessageSquare className="w-4.5 h-4.5" />
            <span className="text-[9px]">Coach</span>
          </button>

          <button 
            onClick={() => setCurrentScreen('profile')}
            className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${currentScreen === 'profile' ? 'text-emerald-400 scale-105 font-semibold' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <User className="w-4.5 h-4.5" />
            <span className="text-[9px]">Account</span>
          </button>
        </div>
      )}

      {/* Subtle Footer credit bar */}
      <footer className="text-center py-4 border-t border-gray-800/20 text-[10px] text-gray-600 flex items-center justify-center gap-1">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Fully integrated with Gemini 3.5 AI Core</span>
      </footer>

    </div>
  );
}
