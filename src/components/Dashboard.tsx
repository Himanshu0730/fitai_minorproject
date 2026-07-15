import React, { useState, useMemo } from 'react';
import { 
  Flame, TrendingDown, Target, Scale, Plus, Calendar, 
  Trash2, Sparkles, Trophy, CheckCircle, ArrowRight 
} from 'lucide-react';
import { UserProfile, WeightLog, MealLog, Message } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface DashboardProps {
  userProfile: UserProfile;
  weightLogs: WeightLog[];
  mealLogs: MealLog[];
  chatHistory?: Message[];
  onAddWeightLog: (weight: number, date: string, notes?: string) => void;
  onDeleteWeightLog: (id: string) => void;
  onNavigateToScanner: () => void;
  onNavigateToCoach: () => void;
}

export default function Dashboard({
  userProfile,
  weightLogs,
  mealLogs,
  chatHistory = [],
  onAddWeightLog,
  onDeleteWeightLog,
  onNavigateToScanner,
  onNavigateToCoach,
}: DashboardProps) {
  const [inputWeight, setInputWeight] = useState('');
  const [inputDate, setInputDate] = useState(new Date().toISOString().split('T')[0]);
  const [inputNotes, setInputNotes] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  // 1. Calculate BMI
  // Formula: weight (kg) / [height (m)]^2
  // If weight is in lbs, convert to kg first: lbs * 0.453592
  const bmiInfo = useMemo(() => {
    const weightInKg = userProfile.weightUnit === 'lbs' 
      ? userProfile.currentWeight * 0.453592 
      : userProfile.currentWeight;
    
    const heightInM = userProfile.height / 100;
    
    if (!weightInKg || !heightInM) return { bmi: 0, status: 'N/A', color: 'text-gray-400', bg: 'bg-gray-800' };
    
    const bmi = parseFloat((weightInKg / (heightInM * heightInM)).toFixed(1));
    let status = 'Normal';
    let color = 'text-emerald-400';
    let bg = 'bg-emerald-500/10 border-emerald-500/20';

    if (bmi < 18.5) {
      status = 'Underweight';
      color = 'text-blue-400';
      bg = 'bg-blue-500/10 border-blue-500/20';
    } else if (bmi >= 18.5 && bmi < 25) {
      status = 'Healthy';
      color = 'text-emerald-400';
      bg = 'bg-emerald-500/10 border-emerald-500/20';
    } else if (bmi >= 25 && bmi < 30) {
      status = 'Overweight';
      color = 'text-amber-400';
      bg = 'bg-amber-500/10 border-amber-500/20';
    } else {
      status = 'Obese';
      color = 'text-red-400';
      bg = 'bg-red-500/10 border-red-500/20';
    }

    return { bmi, status, color, bg };
  }, [userProfile]);

  // 2. Calories & Macros Today (Filtered specifically for today's date)
  const nutritionToday = useMemo(() => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    // Use local timezone date string (YYYY-MM-DD) for accurate matching
    const todayLocalStr = new Date().toLocaleDateString('en-CA');

    mealLogs.forEach(meal => {
      if (meal.timestamp) {
        const mealLocalStr = new Date(meal.timestamp).toLocaleDateString('en-CA');
        if (mealLocalStr === todayLocalStr) {
          calories += meal.calories;
          protein += meal.protein;
          carbs += meal.carbs;
          fat += meal.fat;
        }
      }
    });

    return { calories, protein, carbs, fat };
  }, [mealLogs]);

  // Calories % limit
  const caloriesPercent = useMemo(() => {
    if (!userProfile.calorieGoal) return 0;
    return Math.min(
      Math.round((nutritionToday.calories / userProfile.calorieGoal) * 100),
      100
    );
  }, [nutritionToday.calories, userProfile.calorieGoal]);

  // Streak calculation (consecutive active days backwards from today/yesterday)
  const streakInfo = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const activeDates = new Set<string>();
    
    weightLogs.forEach(log => {
      if (log.date) activeDates.add(log.date);
    });
    
    mealLogs.forEach(meal => {
      if (meal.timestamp) {
        activeDates.add(meal.timestamp.split('T')[0]);
      }
    });

    let streak = 0;
    const todayActive = activeDates.has(todayStr);
    const yesterdayActive = activeDates.has(yesterdayStr);
    
    if (!todayActive && !yesterdayActive) {
      return { streak: 0, level: 0 };
    }
    
    let currentCheck = todayActive ? new Date() : new Date(Date.now() - 86400000);
    
    while (true) {
      const dateStr = currentCheck.toISOString().split('T')[0];
      if (activeDates.has(dateStr)) {
        streak++;
        currentCheck.setDate(currentCheck.getDate() - 1);
      } else {
        break;
      }
    }
    
    let level = 1;
    if (streak > 15) level = 3;
    else if (streak > 5) level = 2;
    
    return { streak, level };
  }, [weightLogs, mealLogs]);

  // 3. Weight log submission
  const handleLogWeight = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(inputWeight);
    if (isNaN(weightNum) || weightNum <= 0) return;

    onAddWeightLog(weightNum, inputDate, inputNotes);
    setInputWeight('');
    setInputNotes('');
    setLogSuccess(true);
    setTimeout(() => setLogSuccess(false), 4000);
  };

  // 4. Weight history formatted for Recharts
  const chartData = useMemo(() => {
    // Sort logs chronologically
    const sorted = [...weightLogs].sort((a, b) => a.date.localeCompare(b.date));
    
    // Take last 7 logs
    const last7 = sorted.slice(-7);
    
    return last7.map(log => ({
      date: new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      Weight: log.weight,
    }));
  }, [weightLogs]);

  // 5. Generate Consistency Heatmap (28 Days)
  const heatmapDays = useMemo(() => {
    const days = [];
    const today = new Date();
    
    for (let i = 27; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      
      // Check if logged weight, meal, or used AI coach on this date
      const hasWeight = weightLogs.some(log => log.date === dateStr);
      const hasMeal = mealLogs.some(meal => meal.timestamp && meal.timestamp.startsWith(dateStr));
      
      // Count AI coach interaction as active if we have messages on current day
      const hasChatToday = (dateStr === today.toISOString().split('T')[0]) && (chatHistory && chatHistory.length > 0);
      
      let level = 0; // 0: none, 1: single log, 2: multiple logs
      const activeCount = (hasWeight ? 1 : 0) + (hasMeal ? 1 : 0) + (hasChatToday ? 1 : 0);
      if (activeCount >= 2) level = 2;
      else if (activeCount === 1) level = 1;

      days.push({
        date: dateStr,
        dayNum: d.getDate(),
        month: d.toLocaleString('default', { month: 'short' }),
        level
      });
    }
    return days;
  }, [weightLogs, mealLogs, chatHistory]);

  // Active logs today summary
  const weightsDifference = useMemo(() => {
    if (weightLogs.length < 2) return null;
    const sorted = [...weightLogs].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sorted[0].weight;
    const previous = sorted[1].weight;
    const diff = parseFloat((latest - previous).toFixed(1));
    return {
      diff,
      isLoss: diff < 0,
      text: diff === 0 ? 'No change' : `${diff > 0 ? '+' : ''}${diff} ${userProfile.weightUnit}`
    };
  }, [weightLogs, userProfile]);

  return (
    <div id="dashboard-root" className="space-y-6 pb-12">
      {/* Header Banner */}
      <div id="dashboard-header" className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl">
            Good morning, <span className="text-emerald-400">{userProfile.fullName.split(' ')[0]}</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Here's your metabolic health and nutrient dashboard for today. Keep logging to prolong your streak!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={onNavigateToScanner}
            className="bg-[#1C252F] hover:bg-[#25323F] border border-gray-800 text-xs font-semibold py-2 px-3.5 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer text-gray-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Scan Meal
          </button>
          <button 
            onClick={onNavigateToCoach}
            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold py-2 px-3.5 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center gap-1.5 cursor-pointer"
          >
            Talk to Coach
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bento Grid Metrics */}
      <div id="dashboard-bento" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: BMI */}
        <div id="bento-bmi" className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Body Mass Index</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            {!userProfile.height || !userProfile.currentWeight ? (
              <p className="text-sm font-semibold text-gray-400">
                Complete profile to calculate BMI
              </p>
            ) : (
              <>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white tracking-tight">{bmiInfo.bmi}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bmiInfo.bg} ${bmiInfo.color}`}>
                    {bmiInfo.status}
                  </span>
                </div>
                {/* Visual Gauge */}
                <div className="w-full bg-gray-800 h-1.5 rounded-full mt-3 overflow-hidden flex">
                  <div className="w-[30%] bg-blue-500 h-full"></div>
                  <div className="w-[20%] bg-emerald-500 h-full border-r border-l border-[#141A21]"></div>
                  <div className="w-[25%] bg-amber-500 h-full border-r border-[#141A21]"></div>
                  <div className="w-[25%] bg-red-500 h-full"></div>
                </div>
                <div className="flex justify-between text-[9px] text-gray-500 mt-1 font-mono">
                  <span>18.5</span>
                  <span>25.0</span>
                  <span>30.0</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metric 2: Streak */}
        <div id="bento-streak" className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Daily Streak</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 animate-pulse">
              <Flame className="w-4 h-4 fill-orange-500/20" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-white tracking-tight">{streakInfo.streak} Days</span>
              <span className="text-xs text-orange-400 font-bold flex items-center gap-0.5">
                <Trophy className="w-3 h-3" /> Level {streakInfo.level}
              </span>
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              {streakInfo.streak > 0 
                ? "Excellent consistency! Keep up logging your metrics daily."
                : "Start logging your weight or meals today to initiate your streak!"}
            </p>
          </div>
        </div>

        {/* Metric 3: Calories Tracker */}
        <div id="bento-calories" className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Calories Today</span>
            {userProfile.calorieGoal > 0 && (
              <span className="text-xs font-mono text-gray-400">
                {nutritionToday.calories} / {userProfile.calorieGoal} kcal
              </span>
            )}
          </div>
          <div className="mt-4">
            {userProfile.calorieGoal <= 0 ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-gray-400">
                  Set daily goal in settings
                </p>
                <p className="text-[10px] text-gray-500">
                  Configure goals in your Profile tab to track.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-baseline justify-between mb-1.5">
                  <span className="text-3xl font-extrabold text-white tracking-tight">
                    {userProfile.calorieGoal - nutritionToday.calories > 0 
                      ? userProfile.calorieGoal - nutritionToday.calories 
                      : 0}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">kcal left</span>
                </div>
                {/* Calories Progress Bar */}
                <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      caloriesPercent > 90 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${caloriesPercent}%` }}
                  ></div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Metric 4: Fitness Goal */}
        <div id="bento-goals" className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Fitness Target</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-bold text-white capitalize">
                {userProfile.activityLevel.replace('_', ' ')}
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-1 text-center">
                <span className="block text-[8px] uppercase tracking-widest text-gray-500 font-semibold">Protein</span>
                <span className="text-xs font-bold text-blue-400">{nutritionToday.protein} / {userProfile.proteinGoal}g</span>
              </div>
              <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-1 text-center">
                <span className="block text-[8px] uppercase tracking-widest text-gray-500 font-semibold">Carbs</span>
                <span className="text-xs font-bold text-amber-500">{nutritionToday.carbs} / {userProfile.carbsGoal}g</span>
              </div>
              <div className="flex-1 bg-gray-900 border border-gray-800 rounded-lg p-1 text-center">
                <span className="block text-[8px] uppercase tracking-widest text-gray-500 font-semibold">Fat</span>
                <span className="text-xs font-bold text-red-400">{nutritionToday.fat} / {userProfile.fatGoal}g</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Content */}
      <div id="dashboard-interactive-row" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Weight Tracker & Heatmap */}
        <div className="lg:col-span-1 space-y-6">
          {/* Log Weight Card */}
          <div id="card-log-weight" className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-6 relative overflow-hidden">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1.5">
              <Scale className="w-4.5 h-4.5 text-emerald-400" />
              Log Body Weight
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Enter your current morning weight to update charts and BMI logs instantly.
            </p>

            {logSuccess && (
              <div id="weight-success-banner" className="mb-4 p-3 bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Weight registered successfully! Streak extended.</span>
              </div>
            )}

            <form onSubmit={handleLogWeight} className="space-y-3.5">
              <div>
                <div className="relative">
                  <input
                    id="weight-input-field"
                    type="number"
                    step="0.1"
                    value={inputWeight}
                    onChange={(e) => setInputWeight(e.target.value)}
                    placeholder={`Weight in ${userProfile.weightUnit}`}
                    required
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2.5 px-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute inset-y-0 right-4 flex items-center text-xs font-bold text-gray-500">
                    {userProfile.weightUnit}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
                      <Calendar className="w-3.5 h-3.5" />
                    </span>
                    <input
                      id="weight-input-date"
                      type="date"
                      value={inputDate}
                      onChange={(e) => setInputDate(e.target.value)}
                      className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <input
                    id="weight-input-notes"
                    type="text"
                    placeholder="Short note (e.g. Fasting)"
                    value={inputNotes}
                    onChange={(e) => setInputNotes(e.target.value)}
                    className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                id="weight-submit-btn"
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-900/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Log Weight
              </button>
            </form>

            {/* Difference Tracker */}
            {weightsDifference && (
              <div className="mt-4 pt-4 border-t border-gray-800/60 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Difference (Last Log):</span>
                <span className={`text-xs font-bold flex items-center gap-0.5 ${weightsDifference.isLoss ? 'text-emerald-400' : 'text-amber-400'}`}>
                  <TrendingDown className={`w-3.5 h-3.5 ${weightsDifference.isLoss ? '' : 'rotate-180'}`} />
                  {weightsDifference.text}
                </span>
              </div>
            )}
          </div>

          {/* Consistency Heatmap Card */}
          <div id="card-consistency" className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1.5">
              <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />
              Consistency Heatmap
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Your logs over the last 28 days. Fill the grid to sustain your daily metabolic streak.
            </p>

            {/* Grid display */}
            <div className="grid grid-cols-7 gap-2">
              {heatmapDays.map((day, idx) => (
                <div 
                  key={idx}
                  title={`${day.month} ${day.dayNum}: ${day.level === 2 ? 'Both logs' : day.level === 1 ? 'Single log' : 'No logs'}`}
                  className={`aspect-square rounded-md flex flex-col items-center justify-center border text-[9px] font-medium transition-colors cursor-help ${
                    day.level === 2 
                      ? 'bg-emerald-500 text-white border-emerald-400' 
                      : day.level === 1 
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/40' 
                        : 'bg-gray-900/60 text-gray-500 border-gray-800/50 hover:bg-gray-800/50'
                  }`}
                >
                  <span>{day.dayNum}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-4 text-[10px] text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-gray-900 border border-gray-800"></span> None
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-950/50 border border-emerald-800/40"></span> Single Log
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500 border border-emerald-400"></span> Double Log
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Charts & Logs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Chart */}
          <div id="card-chart" className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-1.5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingDown className="w-4.5 h-4.5 text-emerald-400" />
                Weight Progress
              </h3>
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/40 rounded-full">
                Last 7 Entries
              </span>
            </div>
            <p className="text-xs text-gray-400 mb-6">
              Track your weight trend relative to your target body weight goal of **{userProfile.targetWeight} {userProfile.weightUnit}**.
            </p>

            <div className="h-64 w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#4B5563" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#4B5563" 
                      fontSize={10} 
                      tickLine={false} 
                      axisLine={false} 
                      domain={['dataMin - 2', 'dataMax + 2']} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#141A21', borderColor: '#374151', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Weight" 
                      stroke="#10B981" 
                      strokeWidth={2.5} 
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-xs">
                  <Scale className="w-10 h-10 text-gray-700 mb-2" />
                  No logged weight values. Add weight above to generate your trend graph.
                </div>
              )}
            </div>
          </div>

          {/* Historical Logs List */}
          <div id="card-logs-list" className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1.5">
              <Calendar className="w-4.5 h-4.5 text-emerald-400" />
              Weight Registry
            </h3>
            <p className="text-xs text-gray-400 mb-4">
              Your recorded weight log entries. Keeping clean data optimizes AI Coach suggestions.
            </p>

            <div className="max-h-56 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
              {weightLogs.length > 0 ? (
                [...weightLogs]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((log) => (
                    <div 
                      key={log.id} 
                      className="bg-[#1C252F] border border-gray-800/50 rounded-xl p-3 flex items-center justify-between hover:border-gray-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                          W
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">
                            {log.weight} <span className="text-[10px] text-gray-500">{userProfile.weightUnit}</span>
                          </div>
                          <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                            <span>{new Date(log.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' })}</span>
                            {log.notes && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                                <span className="text-gray-500 italic">"{log.notes}"</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => onDeleteWeightLog(log.id)}
                        className="text-gray-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition-colors cursor-pointer"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
              ) : (
                <div className="text-center py-6 text-xs text-gray-500">
                  No logged history entries. Start by logging your weight today.
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
