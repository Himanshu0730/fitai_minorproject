import React, { useState } from 'react';
import { 
  User, Mail, Scale, Target, Activity, Settings, 
  Sparkles, Check, LogOut, ShieldAlert, KeyRound, BellRing 
} from 'lucide-react';
import { UserProfile } from '../types';
import { motion } from 'motion/react';

interface ProfileProps {
  userProfile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  onLogout: () => void;
}

export default function Profile({ userProfile, onUpdateProfile, onLogout }: ProfileProps) {
  const [fullName, setFullName] = useState(userProfile.fullName);
  const [email, setEmail] = useState(userProfile.email);
  const [currentWeight, setCurrentWeight] = useState(userProfile.currentWeight.toString());
  const [targetWeight, setTargetWeight] = useState(userProfile.targetWeight.toString());
  const [height, setHeight] = useState(userProfile.height.toString());
  const [age, setAge] = useState(userProfile.age.toString());
  const [gender, setGender] = useState(userProfile.gender);
  const [activityLevel, setActivityLevel] = useState(userProfile.activityLevel);
  const [weightUnit, setWeightUnit] = useState(userProfile.weightUnit);

  // Keep inputs synchronized with asynchronously fetched profile values
  React.useEffect(() => {
    setFullName(userProfile.fullName);
    setEmail(userProfile.email);
    setCurrentWeight(userProfile.currentWeight.toString());
    setTargetWeight(userProfile.targetWeight.toString());
    setHeight(userProfile.height.toString());
    setAge(userProfile.age.toString());
    setGender(userProfile.gender);
    setActivityLevel(userProfile.activityLevel);
    setWeightUnit(userProfile.weightUnit);
  }, [userProfile]);

  // Notification states
  const [notifyMeal, setNotifyMeal] = useState(true);
  const [notifyWeight, setNotifyWeight] = useState(true);
  const [notifyCoach, setNotifyCoach] = useState(false);

  const [saveSuccess, setSaveSuccess] = useState(false);

  // Calculate customized BMR & TDEE to recommend Calorie targets
  const calculatedCalorieRecommendation = React.useMemo(() => {
    const weightNum = parseFloat(currentWeight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);

    if (isNaN(weightNum) || isNaN(heightNum) || isNaN(ageNum) || !gender || weightNum <= 0 || heightNum <= 0 || ageNum <= 0) {
      return 2000;
    }

    // Convert weight to kg if lbs
    const weightInKg = weightUnit === 'lbs' ? weightNum * 0.45359237 : weightNum;

    // Mifflin-St Jeor Equation
    let bmr = (10 * weightInKg) + (6.25 * heightNum) - (5 * ageNum);
    if (gender === 'male') {
      bmr += 5;
    } else if (gender === 'female') {
      bmr -= 161;
    } else {
      bmr -= 78; // average neutral adjustment
    }

    // Activity multiplier
    let multiplier = 1.2;
    switch (activityLevel) {
      case 'sedentary': multiplier = 1.2; break;
      case 'light': multiplier = 1.375; break;
      case 'moderate': multiplier = 1.55; break;
      case 'active': multiplier = 1.725; break;
      case 'very_active': multiplier = 1.9; break;
    }

    const tdee = bmr * multiplier;
    // Standard target adjustment
    const targetWeightNum = parseFloat(targetWeight);
    if (!isNaN(targetWeightNum) && targetWeightNum > 0) {
      if (targetWeightNum < weightNum) {
        return Math.max(1200, Math.round(tdee - 500)); // standard calorie deficit for weight loss
      } else if (targetWeightNum > weightNum) {
        return Math.round(tdee + 300); // standard calorie surplus for muscle building
      }
    }
    return Math.round(tdee);
  }, [currentWeight, height, age, gender, activityLevel, weightUnit, targetWeight]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const weightNum = parseFloat(currentWeight);
    const targetWeightNum = parseFloat(targetWeight);
    const heightNum = parseFloat(height);
    const ageNum = parseInt(age);

    if (
      isNaN(weightNum) || isNaN(targetWeightNum) || isNaN(heightNum) || isNaN(ageNum) ||
      weightNum <= 0 || targetWeightNum <= 0 || heightNum <= 0 || ageNum <= 0 || !gender
    ) {
      alert("Please configure all metrics with positive numbers (current weight, target weight, height, age) and select a gender to complete onboarding.");
      return;
    }

    // Recalculate macro targets based on calculated calorie recommendation
    // Standard healthy split: 30% Protein, 40% Carbs, 30% Fat
    const totalCal = calculatedCalorieRecommendation;
    const proteinG = Math.round((totalCal * 0.30) / 4);
    const carbsG = Math.round((totalCal * 0.40) / 4);
    const fatG = Math.round((totalCal * 0.30) / 9);

    const updated: UserProfile = {
      fullName,
      email,
      currentWeight: weightNum,
      targetWeight: targetWeightNum,
      height: heightNum,
      gender,
      age: ageNum,
      activityLevel,
      calorieGoal: totalCal,
      proteinGoal: proteinG,
      carbsGoal: carbsG,
      fatGoal: fatG,
      weightUnit,
      onboardingComplete: true
    };

    onUpdateProfile(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div id="profile-root" className="space-y-6 pb-12 font-sans text-gray-100">
      
      {/* Header */}
      <div id="profile-header">
        <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl flex items-center gap-2">
          <Settings className="w-6.5 h-6.5 text-emerald-400" />
          Account & Body Metrics
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Customize your weight settings, height values, and metabolic activity states to customize Gemini Coach recommendations.
        </p>
      </div>

      {!userProfile.onboardingComplete && (
        <div className="p-4 bg-emerald-950/30 border border-emerald-800/40 text-emerald-300 text-xs rounded-xl flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="font-bold text-sm text-emerald-200">Welcome to FIT.AI! 🌟</p>
            <p className="mt-1 text-gray-300 leading-relaxed">
              Before accessing the dashboard, macro scanner, and your AI coach, please configure your body metrics below. 
              Our metabolic engine will automatically compute your ideal daily calorie and macro goals.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Columns: Forms */}
        <div className="lg:col-span-8">
          <form id="profile-form" onSubmit={handleSave} className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-6 space-y-6">
            
            {saveSuccess && (
              <div id="profile-success-banner" className="p-3.5 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4.5 h-4.5 text-emerald-400" />
                <span>Body metrics saved successfully. Optimal daily macro targets recalculated!</span>
              </div>
            )}

            {/* Section 1: Personal Info */}
            <div>
              <h3 className="text-sm font-bold text-gray-200 border-b border-gray-800/60 pb-2 mb-4 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-400" />
                Profile Identity
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Physical Metrics */}
            <div>
              <h3 className="text-sm font-bold text-gray-200 border-b border-gray-800/60 pb-2 mb-4 flex items-center gap-2">
                <Scale className="w-4 h-4 text-emerald-400" />
                Physical Metrics
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Weight Unit
                  </label>
                  <select
                    value={weightUnit}
                    onChange={(e) => setWeightUnit(e.target.value as 'lbs' | 'kg')}
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="lbs">lbs (Pounds)</option>
                    <option value="kg">kg (Kilograms)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Current Weight
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentWeight}
                    onChange={(e) => setCurrentWeight(e.target.value)}
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Target Weight
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Metabolic Activity state */}
            <div>
              <h3 className="text-sm font-bold text-gray-200 border-b border-gray-800/60 pb-2 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Metabolic Activity & Demographics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Age (Years)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Gender Identity
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other' | '')}
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other / Prefer not to say</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Activity Level
                  </label>
                  <select
                    value={activityLevel}
                    onChange={(e) => setActivityLevel(e.target.value as any)}
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="sedentary">Sedentary (Little/no exercise)</option>
                    <option value="light">Lightly Active (1-3 days/wk)</option>
                    <option value="moderate">Moderately Active (3-5 days/wk)</option>
                    <option value="active">Active Daily (6-7 days/wk)</option>
                    <option value="very_active">Very Active (Heavy training)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notification settings */}
            <div>
              <h3 className="text-sm font-bold text-gray-200 border-b border-gray-800/60 pb-2 mb-4 flex items-center gap-2">
                <BellRing className="w-4 h-4 text-emerald-400" />
                Notification Preferences
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyMeal}
                    onChange={(e) => setNotifyMeal(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 border-gray-700 bg-[#1C252F] rounded focus:ring-emerald-500 focus:ring-offset-[#141A21]"
                  />
                  <span className="text-xs text-gray-300">Send reminder if meal scanning is missed for 24 hours</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyWeight}
                    onChange={(e) => setNotifyWeight(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 border-gray-700 bg-[#1C252F] rounded focus:ring-emerald-500 focus:ring-offset-[#141A21]"
                  />
                  <span className="text-xs text-gray-300">Prompt weight entry checks at morning time (fasting)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={notifyCoach}
                    onChange={(e) => setNotifyCoach(e.target.checked)}
                    className="w-4 h-4 text-emerald-500 border-gray-700 bg-[#1C252F] rounded focus:ring-emerald-500 focus:ring-offset-[#141A21]"
                  />
                  <span className="text-xs text-gray-300">Authorize Coach AI to nudge daily wellness summaries</span>
                </label>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-800/60 flex items-center justify-end">
              <button
                id="profile-save-btn"
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-emerald-950/40 cursor-pointer"
              >
                Save Metrics & Re-calculate Macros
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Recommendations Overview */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Target Macro Card */}
          <div className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-0.75 bg-linear-to-r from-teal-500 to-emerald-500"></div>
            
            <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-1.5">
              <Target className="w-4.5 h-4.5 text-emerald-400" />
              Optimal Macro Targets
            </h3>
            <p className="text-xs text-gray-400 mb-6">
              Recalculated in real-time according to Mifflin-St Jeor metabolic guidelines.
            </p>

            <div className="space-y-4">
              {/* Daily Limit */}
              <div className="bg-[#1C252F] border border-gray-800 rounded-xl p-4 text-center">
                <span className="block text-[8px] uppercase tracking-wider text-gray-500 font-bold">Optimal Calorie Limit</span>
                <span className="text-3xl font-black text-white">{calculatedCalorieRecommendation}</span>
                <span className="block text-[10px] text-emerald-400 font-semibold mt-1">kcal / daily</span>
              </div>

              {/* Protein Goal */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Protein (30%)</span>
                  <span className="text-blue-400 font-bold">{Math.round((calculatedCalorieRecommendation * 0.3) / 4)}g</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-400 h-full rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>

              {/* Carbs Goal */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Carbohydrates (45%)</span>
                  <span className="text-amber-500 font-bold">{Math.round((calculatedCalorieRecommendation * 0.45) / 4)}g</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* Fat Goal */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium">Fats (25%)</span>
                  <span className="text-red-400 font-bold">{Math.round((calculatedCalorieRecommendation * 0.25) / 9)}g</span>
                </div>
                <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-red-400 h-full rounded-full" style={{ width: '25%' }}></div>
                </div>
              </div>

            </div>
          </div>

          {/* Logout & Safety block */}
          <div className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-6 space-y-4">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              Security & Session
            </h3>
            
            <button
              id="profile-logout-btn"
              onClick={onLogout}
              className="w-full bg-red-950/30 hover:bg-red-950/50 border border-red-900/40 hover:border-red-800/50 text-red-400 font-semibold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out from Applet
            </button>
            
            <div className="flex items-start gap-2 text-[10px] text-gray-500 leading-normal bg-gray-900/40 p-3 rounded-lg border border-gray-800/40">
              <ShieldAlert className="w-4 h-4 text-amber-500/80 shrink-0" />
              <span>
                To fully wipe stored body logs and scan histories from your device, clear the browser local storage session cache.
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
