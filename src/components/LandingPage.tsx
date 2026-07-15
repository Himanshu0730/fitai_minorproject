import React, { useState } from 'react';
import { 
  Dumbbell, Camera, MessageSquare, Sparkles, TrendingUp, 
  ShieldCheck, ArrowRight, HelpCircle, Star, Flame, Zap, 
  Lock, Check, Play, Award, ChevronDown, ChevronUp, UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onTryDirectly?: () => void;
}

export default function LandingPage({ onGetStarted, onLogin, onTryDirectly }: LandingPageProps) {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [previewTab, setPreviewTab] = useState<'scanner' | 'coach' | 'dashboard'>('scanner');

  const faqs = [
    {
      question: "How accurate is the AI Macro Scanner?",
      answer: "The FIT.AI Macro Scanner uses Google Gemini's advanced multimodal vision architecture. By analyzing the textures, colors, and ingredient compositions of a meal, it can estimate weights and portion sizes to within 90-95% accuracy compared to standard laboratory scales and nutritional databases. Providing hint text (like describing dynamic ingredients) improves accuracy even further!"
    },
    {
      question: "Can the AI Coach adapt to specific injuries or diet limits?",
      answer: "Absolutely. During onboarding, the AI Coach registers any food intolerances, physical constraints, or fitness conditions. Your coach grounds every conversation in your personal medical boundaries, activity metrics, and current body goals to deliver safe, actionable instruction. However, for serious medical concerns, we always recommend consulting a physician."
    },
    {
      question: "Is my biometric and health data secure?",
      answer: "Yes, security is our primary design tenet. All health entries, weight histories, and scanned photos are completely isolated and protected by strict Supabase Row-Level Security policies. We never sell, share, or monetize your personal metrics or biometric details."
    },
    {
      question: "Do I need a credit card to sign up?",
      answer: "No. FIT.AI is completely free to start with our core AI Macro Scanner, weight logger, and chat assistance. There are no hidden subscription walls or mandatory billing templates for the base MVP features."
    }
  ];

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div id="landing-root" className="min-h-screen bg-[#051424] text-[#d4e4fa] font-sans overflow-x-hidden selection:bg-[#00ff66] selection:text-black">
      
      {/* Dynamic Upper Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#051424]/85 border-b border-[#3b4b3a]/15 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#00ff66] to-[#00e55b] flex items-center justify-center shadow-md shadow-[#00e55b]/20">
              <Dumbbell className="w-5 h-5 text-[#002107]" />
            </div>
            <div>
              <span className="block font-black text-white text-lg tracking-tight uppercase">FIT.AI</span>
              <span className="block text-[8px] text-[#00e55b] font-bold uppercase tracking-widest font-mono">Ambient Intelligence</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features-anchor" className="text-xs font-semibold text-gray-300 hover:text-[#00e55b] transition-colors">Features</a>
            <a href="#how-it-works-anchor" className="text-xs font-semibold text-gray-300 hover:text-[#00e55b] transition-colors">How It Works</a>
            <a href="#previews-anchor" className="text-xs font-semibold text-gray-300 hover:text-[#00e55b] transition-colors">Product Previews</a>
            <a href="#testimonials-anchor" className="text-xs font-semibold text-gray-300 hover:text-[#00e55b] transition-colors">Real Results</a>
            <a href="#faq-anchor" className="text-xs font-semibold text-gray-300 hover:text-[#00e55b] transition-colors">Pricing & FAQ</a>
          </nav>

          {/* Right Action Stack */}
          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
            >
              Log In
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-[#00ff66] hover:bg-[#00e55b] text-[#002107] text-xs font-bold py-2.5 px-5 rounded-full transition-all duration-200 transform active:scale-95 shadow-md shadow-[#00ff66]/10 cursor-pointer"
            >
              Get Started
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Glow ambient blobs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-[#00ff66]/5 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Hero Copy (Left) */}
        <div className="lg:col-span-7 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#122131]/80 border border-[#3b4b3a]/25 rounded-full backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#00e55b] fill-[#00e55b]/20" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e55b] font-mono">Personal AI Health Engine</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Your fitness plan, <br />
            <span className="bg-linear-to-r from-[#00ff66] to-[#00e55b] bg-clip-text text-transparent">personalized by AI</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
            Skip the static generic templates. FIT.AI builds an adaptable workout schedule around your physical body, scans your macro nutrients instantly from a single food photo, and provides a continuous 24/7 AI diet coach.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button 
              onClick={onGetStarted}
              className="bg-[#00ff66] hover:bg-[#00e55b] hover:shadow-lg hover:shadow-[#00ff66]/20 text-[#002107] font-bold text-sm py-3.5 px-8 rounded-full transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              Start for free <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={onLogin}
              className="bg-[#122131]/60 hover:bg-[#1c2b3c]/80 text-[#d4e4fa] border border-[#3b4b3a]/30 font-semibold text-sm py-3.5 px-8 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer hover:border-gray-500"
            >
              I have an account
            </button>
          </div>

          {/* Social Proof */}
          <div className="pt-6 flex items-center gap-4 border-t border-[#3b4b3a]/15">
            <div className="flex -space-x-2">
              <img className="w-8 h-8 rounded-full border-2 border-[#051424] object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="user" />
              <img className="w-8 h-8 rounded-full border-2 border-[#051424] object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="user" />
              <img className="w-8 h-8 rounded-full border-2 border-[#051424] object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="user" />
            </div>
            <div className="text-xs text-gray-400">
              <span className="block font-bold text-white">Trusted by 28,000+ athletes</span>
              <span className="block text-[10px]">Achieving goal weights and fitness targets daily</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Preview Mockup (Right) */}
        <div className="lg:col-span-5 relative z-10">
          <div className="absolute inset-0 bg-[#00ff66]/10 rounded-[2.5rem] blur-2xl transform rotate-3"></div>
          
          <div className="relative bg-[#122131]/80 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-gray-800/40 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold">STATUS: Elite</span>
              </div>
              <div className="flex gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500/40"></span>
                <span className="w-2 h-2 rounded-full bg-yellow-500/40"></span>
                <span className="w-2 h-2 rounded-full bg-green-500/40"></span>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0d1c2d]/90 border border-gray-800 p-4 rounded-2xl">
                <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold font-mono">Streak Objective</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-white">12</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Days 🔥</span>
                </div>
              </div>
              <div className="bg-[#0d1c2d]/90 border border-gray-800 p-4 rounded-2xl">
                <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-bold font-mono">Optimal Macros</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl font-black text-white">92%</span>
                  <span className="text-[10px] text-blue-400 font-bold">Accuracy</span>
                </div>
              </div>
            </div>

            {/* Live Chart Visualizer */}
            <div className="space-y-2 bg-[#0d1c2d]/50 border border-gray-800/40 p-4 rounded-2xl">
              <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-mono font-bold">Calories Remaining Today</span>
              <div className="flex justify-between text-xs font-bold text-white">
                <span>1,530 / 2,050 kcal</span>
                <span className="text-emerald-400">75% Consumed</span>
              </div>
              <div className="w-full bg-[#051424] h-3 rounded-full overflow-hidden border border-gray-800/80">
                <div className="bg-linear-to-r from-emerald-500 to-[#00ff66] h-full rounded-full transition-all duration-1000" style={{ width: '75%' }}></div>
              </div>
            </div>

            {/* Dynamic AI advice box */}
            <div className="bg-[#1c2b3c]/80 border border-[#00ff66]/10 p-3.5 rounded-xl flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#00ff66]" />
              </div>
              <div>
                <span className="block text-[10px] font-bold text-[#00ff66] font-mono tracking-wider uppercase">Live Coach Feedback</span>
                <p className="text-xs text-gray-300 mt-1">
                  "Based on your weight trend of -0.8 lbs this week, your metabolic burn is peak. Target 45g protein post leg workout tonight."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kinetic Stats Bar */}
      <section className="bg-[#010f1f] border-y border-[#3b4b3a]/10 py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <span className="block text-3xl sm:text-4xl font-extrabold text-white">28k+</span>
            <span className="block text-[10px] tracking-widest text-[#00e55b] font-mono font-bold uppercase">ACTIVE USERS</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl sm:text-4xl font-extrabold text-white">4.9/5</span>
            <span className="block text-[10px] tracking-widest text-[#00e55b] font-mono font-bold uppercase">APP STORE RATING</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl sm:text-4xl font-extrabold text-white">3M+</span>
            <span className="block text-[10px] tracking-widest text-[#00e55b] font-mono font-bold uppercase">MEALS LOGGED</span>
          </div>
          <div className="space-y-1">
            <span className="block text-3xl sm:text-4xl font-extrabold text-white">94%</span>
            <span className="block text-[10px] tracking-widest text-[#00e55b] font-mono font-bold uppercase">GOAL ACHIEVEMENT</span>
          </div>
        </div>
      </section>

      {/* Feature Grid / Core Capabilities */}
      <section id="features-anchor" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        
        {/* Features Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e55b] font-mono bg-[#00ff66]/10 px-3 py-1 rounded-full border border-[#00ff66]/10">
            FEATURES
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Everything you need to reach your goal</h2>
          <p className="text-xs text-gray-400 max-w-lg mx-auto">
            Three powerful tools combined with unified, intelligent health telemetry. Built on Google Gemini vision and chat models.
          </p>
        </div>

        {/* Features Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: AI Workouts */}
          <div className="bg-[#122131]/60 border border-white/5 rounded-3xl p-6 hover:border-[#00ff66]/30 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500/20 to-[#00ff66]/10 flex items-center justify-center text-[#00ff66]">
                <Dumbbell className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#00ff66] transition-colors">AI Workout Plans</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                FIT.AI generates custom 3-day or 5-day resistance splits tailored around your available equipment and target weight. It adapts sets, fatigue metrics, and volume cycles dynamically as you progress.
              </p>
            </div>
            <div className="flex gap-2 mt-6">
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-gray-900 border border-gray-800 rounded">#HYPERTROPHY</span>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-gray-900 border border-gray-800 rounded">#RECOVERY</span>
            </div>
          </div>

          {/* Card 2: Food Scanner */}
          <div className="bg-[#122131]/60 border border-white/5 rounded-3xl p-6 hover:border-[#00ff66]/30 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500/20 to-[#00ff66]/10 flex items-center justify-center text-[#00ff66]">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#00ff66] transition-colors">AI Food Scanner</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Forget standard database typing. Snap a meal photo to identify ingredients, portion sizes, calories, and detailed macro breakdowns including protein, carbohydrates, fats, and fiber instantly.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold">
              <Zap className="w-3.5 h-3.5 fill-emerald-500/10" /> 94% verified accuracy
            </div>
          </div>

          {/* Card 3: Ask AI Coach */}
          <div className="bg-[#122131]/60 border border-white/5 rounded-3xl p-6 hover:border-[#00ff66]/30 transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500/20 to-[#00ff66]/10 flex items-center justify-center text-[#00ff66]">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#00ff66] transition-colors">Interactive AI Coach</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Connect with an expert nutritionist and performance coach 24/7. Ask questions, optimize meal prep plans, receive muscle stretching guides, and fine-tune your caloric targets with natural language.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs text-[#d4e4fa]">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-ping"></span> Live & Grounded
            </div>
          </div>

        </div>

        {/* Secondary Benefit row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="bg-[#0d1c2d]/50 border border-gray-800/40 rounded-2xl p-6 flex items-start gap-4">
            <TrendingUp className="w-6 h-6 text-[#00e55b] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Consistent Metrics</h4>
              <p className="text-xs text-gray-400 mt-1">
                Visual dashboards render weight logs, daily macro totals, and compliance markers.
              </p>
            </div>
          </div>
          <div className="bg-[#0d1c2d]/50 border border-gray-800/40 rounded-2xl p-6 flex items-start gap-4">
            <ShieldCheck className="w-6 h-6 text-[#00e55b] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Privacy Secured</h4>
              <p className="text-xs text-gray-400 mt-1">
                All data remains safe and isolated behind standard secure database partitions.
              </p>
            </div>
          </div>
          <div className="bg-[#0d1c2d]/50 border border-gray-800/40 rounded-2xl p-6 flex items-start gap-4">
            <Award className="w-6 h-6 text-[#00e55b] shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">Optimal Calculations</h4>
              <p className="text-xs text-gray-400 mt-1">
                Integrates Mifflin-St Jeor metabolic tracking to pinpoint ideal macro split targets.
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* Dynamic Product Previews Section */}
      <section id="previews-anchor" className="py-24 bg-[#010f1f]/60 border-y border-[#3b4b3a]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e55b] font-mono">APP PREVIEW</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Inside the Ambient AI Ecosystem</h2>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              Select a tab below to preview the high-performance interfaces designed to track your fitness and nutrition goals.
            </p>
          </div>

          {/* Preview Navigation Tabs */}
          <div className="flex justify-center border-b border-gray-800/50 max-w-md mx-auto">
            <button 
              onClick={() => setPreviewTab('scanner')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${previewTab === 'scanner' ? 'border-[#00ff66] text-white font-black' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              Macro Scanner
            </button>
            <button 
              onClick={() => setPreviewTab('coach')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${previewTab === 'coach' ? 'border-[#00ff66] text-white font-black' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              AI Chat Coach
            </button>
            <button 
              onClick={() => setPreviewTab('dashboard')}
              className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 cursor-pointer ${previewTab === 'dashboard' ? 'border-[#00ff66] text-white font-black' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
            >
              Dashboard Bento
            </button>
          </div>

          {/* Tabs Content */}
          <div className="mt-8 max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
              {previewTab === 'scanner' && (
                <motion.div 
                  key="scanner"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#122131]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
                >
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00ff66] text-[10px] font-mono">
                      <Camera className="w-3 h-3" /> MULTIMODAL VISION MODEL
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Visual Calorie & Macro Decomposition</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Simply hold your camera over your meal. Our custom system bypasses tedious weight typing by calculating food metrics visually. Instantly separates fats, proteins, carbohydrates, and fiber.
                    </p>
                    <div className="space-y-2 pt-2">
                      <div className="flex justify-between text-xs text-gray-400 font-mono">
                        <span>Protein (92% goal reached)</span>
                        <span className="text-[#00ff66] font-bold">42g</span>
                      </div>
                      <div className="w-full bg-[#051424] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#00ff66] h-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Simulated screen capture */}
                  <div className="bg-[#0d1c2d] border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                    <img className="w-full h-48 object-cover" src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80" alt="meal" />
                    <div className="p-4 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white text-xs">Grilled Salmon Salad Bowl</span>
                        <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950/40 border border-emerald-900/50 rounded-full">480 Kcal</span>
                      </div>
                      <p className="text-[10px] text-gray-400 leading-relaxed italic">
                        "High in omega-3 healthy fats, lean protein, and leafy fiber. Ideal post-workout performance meal."
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {previewTab === 'coach' && (
                <motion.div 
                  key="coach"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#122131]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6 max-w-2xl mx-auto"
                >
                  <div className="flex justify-between items-center border-b border-gray-800/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/20 flex items-center justify-center">
                        <MessageSquare className="w-4 h-4 text-[#00ff66]" />
                      </div>
                      <div>
                        <span className="block font-bold text-white text-xs">FIT.AI Expert Coach</span>
                        <span className="block text-[8px] text-emerald-400 font-mono">Grounded telemetry</span>
                      </div>
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-[#00ff66] font-mono px-2 py-0.5 bg-[#00ff66]/10 border border-[#00ff66]/15 rounded">GEMINI 3.5</span>
                  </div>

                  {/* Conversation transcript */}
                  <div className="space-y-4">
                    <div className="flex flex-col items-end">
                      <div className="bg-[#00ff66]/10 border border-[#00ff66]/20 text-[#e2f1dd] text-xs p-3.5 rounded-2xl rounded-tr-none max-w-[85%]">
                        What's the best nutrient strategy for active weight training and recovery?
                      </div>
                    </div>

                    <div className="flex flex-col items-start">
                      <div className="bg-[#1c2b3c] border border-white/5 text-[#d4e4fa] text-xs p-3.5 rounded-2xl rounded-tl-none max-w-[85%] space-y-2">
                        <p className="font-bold text-[#00ff66] flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-[#00ff66]" /> Personalized Coach Protocol
                        </p>
                        <p>To support your body target weight of 160 lbs, here is your daily formula:</p>
                        <ul className="list-disc pl-4 space-y-1 text-gray-300 text-[11px]">
                          <li><strong className="text-white">Protein Target:</strong> Aim for 145g daily (rebuilding muscle tissue)</li>
                          <li><strong className="text-white">Hydration:</strong> Drink 3.2L filtered water daily to buffer protein load</li>
                          <li><strong className="text-white">Timing:</strong> Consume 30g protein within 45 mins post-training</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {previewTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-[#122131]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-6 sm:p-8 space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-gray-800/60 pb-3">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-[#00ff66]" /> Telemetry Bento Hub
                    </h3>
                    <span className="text-[10px] text-gray-500 font-mono">Auto updates on weight sync</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Weight Logged Card */}
                    <div className="bg-[#0d1c2d] border border-gray-800/80 p-4 rounded-xl text-center space-y-1">
                      <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-mono font-bold">Latest Weight</span>
                      <span className="text-2xl font-black text-white">172.4 <span className="text-xs text-gray-400">lbs</span></span>
                      <span className="block text-[9px] text-emerald-400 font-mono">-1.4 lbs this week</span>
                    </div>

                    {/* Calories consumed */}
                    <div className="bg-[#0d1c2d] border border-gray-800/80 p-4 rounded-xl text-center space-y-1">
                      <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-mono font-bold">Today's Calories</span>
                      <span className="text-2xl font-black text-white">1,530 / 2,050 <span className="text-xs text-gray-400">kcal</span></span>
                      <span className="block text-[9px] text-yellow-400 font-mono">520 kcal budget left</span>
                    </div>

                    {/* Heatmap summary */}
                    <div className="bg-[#0d1c2d] border border-gray-800/80 p-4 rounded-xl text-center space-y-1">
                      <span className="block text-[9px] uppercase tracking-wider text-gray-500 font-mono font-bold">Heatmap Score</span>
                      <span className="text-2xl font-black text-white">28 / 31 <span className="text-xs text-gray-400">Days</span></span>
                      <span className="block text-[9px] text-blue-400 font-mono">90% compliance</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* "How It Works" Section */}
      <section id="how-it-works-anchor" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Steps Left */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e55b] font-mono bg-[#00ff66]/10 px-3 py-1 rounded-full border border-[#00ff66]/10 inline-block">
                HOW IT WORKS
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white">From sign-up to results in minutes</h2>
              <p className="text-xs text-gray-400 leading-relaxed max-w-md">
                No complicated spreadsheets, no manual calorie estimations. FIT.AI is designed to simplify logging and optimize results.
              </p>
            </div>

            {/* Stepper items */}
            <div className="space-y-6">
              
              {/* Step 1 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#122131]/20 hover:bg-[#122131]/50 border border-gray-800/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/20 flex items-center justify-center font-bold font-mono text-xs text-[#00ff66] shrink-0">
                  01
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Create your biometric profile</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Enter height, age, target weight, and physical goals. Our Mifflin formula calculates basal caloric caps instantly.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#122131]/20 hover:bg-[#122131]/50 border border-gray-800/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/20 flex items-center justify-center font-bold font-mono text-xs text-[#00ff66] shrink-0">
                  02
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Receive optimized calorie & macro targets</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    The system suggestions map optimal proportions of protein, carbohydrates, and fats to hit your target safely.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-4 p-4 rounded-2xl bg-[#122131]/20 hover:bg-[#122131]/50 border border-gray-800/40 transition-colors">
                <div className="w-8 h-8 rounded-full bg-[#00ff66]/10 border border-[#00ff66]/20 flex items-center justify-center font-bold font-mono text-xs text-[#00ff66] shrink-0">
                  03
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Snap meals to log dynamically</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Point your phone camera at any dish. Multi-modal AI translates the meal into verified database figures and saves it.
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Graphical display (Right) */}
          <div className="lg:col-span-6">
            <div className="relative bg-[#122131]/80 backdrop-blur-2xl border border-white/5 p-6 rounded-3xl shadow-2xl space-y-6">
              <span className="block text-[10px] font-mono tracking-widest text-[#00ff66] uppercase font-bold">Telemetry Report Card</span>
              
              <div className="space-y-4">
                {/* Metric 1 */}
                <div>
                  <div className="flex justify-between text-xs text-gray-300 font-semibold mb-1">
                    <span>Workout Adherence</span>
                    <span className="text-[#00ff66] font-bold">87%</span>
                  </div>
                  <div className="w-full bg-[#051424] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#00ff66] h-full" style={{ width: '87%' }}></div>
                  </div>
                </div>

                {/* Metric 2 */}
                <div>
                  <div className="flex justify-between text-xs text-gray-300 font-semibold mb-1">
                    <span>Protein Goal Hit Rate</span>
                    <span className="text-blue-400 font-bold">74%</span>
                  </div>
                  <div className="w-full bg-[#051424] h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-400 h-full" style={{ width: '74%' }}></div>
                  </div>
                </div>

                {/* Metric 3 */}
                <div>
                  <div className="flex justify-between text-xs text-gray-300 font-semibold mb-1">
                    <span>Streak Level (Active Days)</span>
                    <span className="text-amber-500 font-bold">91%</span>
                  </div>
                  <div className="w-full bg-[#051424] h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: '91%' }}></div>
                  </div>
                </div>
              </div>

              {/* Rec box */}
              <div className="bg-[#0d1c2d] border border-gray-800/80 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#00ff66]/10 flex items-center justify-center text-[#00ff66]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-[#00ff66] uppercase font-mono font-bold">Wellness Adjustment</span>
                    <span className="block text-xs text-white font-bold">Increase recovery rest by 15 mins</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </section>

      {/* Testimonials */}
      <section id="testimonials-anchor" className="py-24 bg-[#010f1f]/40 border-t border-[#3b4b3a]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e55b] font-mono">TESTIMONIALS</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Real people. Real results.</h2>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Athletes, lifters, and everyday users achieving their ideal fitness thresholds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Testimonial 1 */}
            <div className="bg-[#122131]/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-xs text-gray-300 leading-relaxed italic">
                "FIT.AI built me a custom diet protocol that actually fit my complex work hours. I stopped typing numbers into spreadsheet databases and saw real definition gains in weeks."
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-gray-800/40 pt-4">
                <img className="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80" alt="Sarah" />
                <div>
                  <span className="block font-bold text-white text-xs">Sarah K.</span>
                  <span className="block text-[10px] text-emerald-400">Lost 12 kg in 3 months</span>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#122131]/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-xs text-gray-300 leading-relaxed italic">
                "The AI food scanner is ridiculously good. I used to spend 20 minutes daily looking up generic nutritional data — now it takes 3 seconds and I get perfect, custom reports."
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-gray-800/40 pt-4">
                <img className="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80" alt="Marcos" />
                <div>
                  <span className="block font-bold text-white text-xs">Marcos T.</span>
                  <span className="block text-[10px] text-emerald-400">Gained 6 kg of muscle</span>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[#122131]/60 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
              <p className="text-xs text-gray-300 leading-relaxed italic">
                "I sent the AI coach a long list of questions about progressive loading at midnight. I expected standard canned answers, but got a detailed, encouraging program. Amazing app."
              </p>
              <div className="mt-6 flex items-center gap-3 border-t border-gray-800/40 pt-4">
                <img className="w-10 h-10 rounded-full object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Priya" />
                <div>
                  <span className="block font-bold text-white text-xs">Priya M.</span>
                  <span className="block text-[10px] text-emerald-400">Ran her first 10k race</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Pricing / FAQ Anchor Section */}
      <section id="faq-anchor" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        
        {/* FAQ Header */}
        <div className="text-center space-y-3">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#00e55b] font-mono">PRICING & FAQ</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Everything you need to understand regarding the FIT.AI nutritional telemetry and pricing levels.
          </p>
        </div>

        {/* Pricing tier teaser */}
        <div className="max-w-md mx-auto bg-linear-to-b from-[#122131] to-[#0d1c2d] border border-white/10 rounded-3xl p-8 text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-[#00ff66]"></div>
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-[#00ff66] font-bold">MVP RELEASE</span>
            <h3 className="text-xl font-bold text-white mt-1">100% Free Core Ecosystem</h3>
            <p className="text-xs text-gray-400 mt-1">Full access to scanner, logs, and AI coach during our open release phase.</p>
          </div>
          <div className="text-3xl font-black text-white">$0 <span className="text-xs text-gray-500 font-normal">/ month forever</span></div>
          <button 
            onClick={onGetStarted}
            className="w-full bg-[#00ff66] hover:bg-[#00e55b] text-[#002107] font-bold text-xs py-3 rounded-full shadow-lg shadow-[#00ff66]/10 transition-all cursor-pointer"
          >
            Claim Free Account
          </button>
          <ul className="text-left text-xs space-y-2 max-w-xs mx-auto border-t border-gray-800 pt-4 text-gray-400">
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Multimodal food vision scans</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Interactive grounded chat coach</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> Weight telemetry and target charts</li>
            <li className="flex items-center gap-2"><Check className="w-3.5 h-3.5 text-emerald-400" /> No ads or registration paywalls</li>
          </ul>
        </div>

        {/* FAQs accordions */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-[#122131]/40 border border-gray-800 rounded-2xl overflow-hidden">
              <button 
                onClick={() => toggleFaq(i)}
                className="w-full py-4 px-6 text-left flex items-center justify-between text-white font-bold text-sm cursor-pointer hover:bg-white/5 transition-colors"
              >
                <span>{faq.question}</span>
                {activeFaq === i ? <ChevronUp className="w-4 h-4 text-emerald-400" /> : <ChevronDown className="w-4 h-4 text-emerald-400" />}
              </button>
              
              <AnimatePresence initial={false}>
                {activeFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-t border-gray-800"
                  >
                    <p className="p-6 text-xs text-gray-400 leading-relaxed bg-[#0d1c2d]/20">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

      </section>

      {/* final CTA banner */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/5 rounded-full blur-[90px]"></div>
        
        <div className="relative bg-[#122131]/60 border border-white/5 rounded-[2.5rem] p-10 sm:p-16 space-y-6">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            The best day to start was yesterday. <br />
            <span className="text-[#00ff66]">Today is fine too.</span>
          </h2>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Free to start. No credit card required. Cancel anytime.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-4">
            <button 
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-[#00ff66] hover:bg-[#00e55b] hover:shadow-lg hover:shadow-[#00ff66]/25 text-[#002107] font-bold text-xs py-3.5 px-8 rounded-full transition-all duration-300 transform active:scale-95 cursor-pointer"
            >
              Start for free
            </button>
            <a 
              href="#faq-anchor"
              className="w-full sm:w-auto bg-[#1c2b3c]/60 hover:bg-[#1c2b3c]/80 text-[#d4e4fa] border border-[#3b4b3a]/30 font-semibold text-xs py-3.5 px-8 rounded-full transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              View pricing
            </a>
          </div>
          <span className="block text-[10px] text-gray-500 pt-2">Join 28,000+ people already hitting their goals with FIT.AI</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#3b4b3a]/15 bg-[#010f1f] text-gray-500 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#00ff66]/10 border border-[#00ff66]/20 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-[#00ff66]" />
            </div>
            <span className="font-extrabold text-white text-sm uppercase tracking-tight">FIT.AI</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-400 font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Help Center</a>
            <a href="#" className="hover:text-white transition-colors">API Contract</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>

          <div className="text-[10px] text-gray-600 font-mono">
            © 2026 FIT.AI Precision Performance. All rights reserved.
          </div>

        </div>
      </footer>

    </div>
  );
}
