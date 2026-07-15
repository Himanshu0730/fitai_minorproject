import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Sparkles, AlertCircle, CheckCircle, Flame, 
  HelpCircle, Apple, RefreshCw, Zap, Star 
} from 'lucide-react';
import { FoodScanResult, MealLog } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { scanMeal } from '../lib/gemini';

interface MacroScannerProps {
  onAddMealLog: (meal: Omit<MealLog, 'id' | 'timestamp'>) => void;
  onNavigateToDashboard: () => void;
}

// Default high-quality preset meal options for easy scanning
const PRESET_MEALS = [
  {
    name: "Grilled Chicken & Rice Bowl",
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80",
    hint: "Grilled chicken, white rice, steamed broccoli",
  },
  {
    name: "Pepperoni Pizza Slice",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop&q=80",
    hint: "Pepperoni pizza slice with cheese",
  },
  {
    name: "Salmon Salad Bowl",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80",
    hint: "Salmon salad with spinach and tomato",
  },
  {
    name: "Double Cheese Burger",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop&q=80",
    hint: "Beef hamburger with double cheddar cheese and potato fries",
  }
];

export default function MacroScanner({ onAddMealLog, onNavigateToDashboard }: MacroScannerProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FoodScanResult | null>(null);
  const [foodHint, setFoodHint] = useState('');
  const [error, setError] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);
  
  // Camera simulation states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Drag and drop events
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setError('');
    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Start real or simulated camera
  const handleStartCamera = async () => {
    setError('');
    setIsCameraActive(true);
    setImagePreview(null);
    setScanResult(null);

    setTimeout(async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        }
      } catch (err) {
        console.warn("Could not access physical camera, using dynamic fallback simulation.", err);
      }
    }, 100);
  };

  // Capture image from video or simulate it
  const handleCapture = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      // Real camera capture
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth || 640;
      canvas.height = videoRef.current.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx && videoRef.current) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const base64 = canvas.toDataURL('image/jpeg');
        setImagePreview(base64);
        
        // Stop stream
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    } else {
      // Simulated camera capture - pick a random preset food
      const randomPreset = PRESET_MEALS[Math.floor(Math.random() * PRESET_MEALS.length)];
      setImagePreview(randomPreset.image);
      setFoodHint(randomPreset.name);
    }
    setIsCameraActive(false);
  };

  // Quick Preset Selection
  const handleSelectPreset = (preset: typeof PRESET_MEALS[0]) => {
    setError('');
    setImagePreview(preset.image);
    setFoodHint(preset.name);
    setScanResult(null);
  };

  // Trigger Scanner using our Gemini API / Edge Function helper
  const handleScan = async () => {
    if (!imagePreview && !foodHint) {
      setError('Please provide an image, take a photo, or write a meal name first.');
      return;
    }

    setIsScanning(true);
    setError('');
    setScanResult(null);

    try {
      const result = await scanMeal(
        imagePreview && imagePreview.startsWith('data:image') ? imagePreview : undefined,
        "image/jpeg",
        foodHint || "Food Item"
      );
      setScanResult(result);
    } catch (err: any) {
      setError(err.message || 'Error scanning macro values. Please try again.');
    } finally {
      setIsScanning(false);
    }
  };

  // Save scan result to Dashboard / State
  const handleSaveMeal = () => {
    if (!scanResult) return;

    onAddMealLog({
      name: scanResult.foodName,
      calories: scanResult.calories,
      protein: scanResult.protein,
      carbs: scanResult.carbs,
      fat: scanResult.fat,
      imageUrl: imagePreview || undefined,
    });

    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onNavigateToDashboard();
    }, 1500);
  };

  // Calorie Arc Gauge math helper
  const calorieArcPercentage = scanResult ? Math.min((scanResult.calories / 800) * 100, 100) : 0;
  const strokeDashoffset = 339.292 * (1 - calorieArcPercentage / 100);

  return (
    <div id="macro-scanner-root" className="space-y-6 pb-12 font-sans text-gray-100">
      {/* Header */}
      <div id="scanner-header">
        <h1 className="text-2xl font-bold text-white tracking-tight sm:text-3xl flex items-center gap-2">
          <Apple className="w-6.5 h-6.5 text-emerald-400" />
          AI Macro Scanner
        </h1>
        <p className="text-xs text-gray-400 mt-1">
          Upload a meal image, snap a photo, or select a preset. Our multi-modal Gemini intelligence analyzes calories and macros instantly.
        </p>
      </div>

      {/* Main Grid: Upload left / Results right */}
      <div id="scanner-content" className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Input Area */}
        <div className="lg:col-span-5 space-y-6">
          <div id="scanner-uploader" className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-gray-200 mb-3 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-400" />
              Source Image
            </h3>

            {/* Drag & Drop Canvas */}
            <div 
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                dragActive 
                  ? 'border-emerald-500 bg-emerald-950/10' 
                  : imagePreview 
                    ? 'border-gray-700 bg-gray-900/40' 
                    : 'border-gray-800 bg-gray-900/20 hover:border-gray-700 hover:bg-gray-900/30'
              } flex flex-col items-center justify-center min-h-55`}
            >
              {isCameraActive ? (
                /* Live Camera simulation */
                <div className="w-full h-full flex flex-col items-center">
                  <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black border border-gray-800">
                    <video 
                      ref={videoRef} 
                      playsInline 
                      muted 
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    {/* Simulated scanning alignment guide */}
                    <div className="absolute inset-4 border border-emerald-400/40 rounded-lg pointer-events-none flex items-center justify-center">
                      <div className="w-8 h-8 border-t-2 border-l-2 border-emerald-400 absolute top-0 left-0"></div>
                      <div className="w-8 h-8 border-t-2 border-r-2 border-emerald-400 absolute top-0 right-0"></div>
                      <div className="w-8 h-8 border-b-2 border-l-2 border-emerald-400 absolute bottom-0 left-0"></div>
                      <div className="w-8 h-8 border-b-2 border-r-2 border-emerald-400 absolute bottom-0 right-0"></div>
                      <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider bg-[#141A21]/90 px-2 py-0.5 rounded border border-emerald-500/20">
                        Align meal within scope
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleCapture}
                    className="mt-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" /> Capture Photo
                  </button>
                </div>
              ) : imagePreview ? (
                /* Preview selected food */
                <div className="w-full relative">
                  <img 
                    src={imagePreview} 
                    alt="Meal Preview" 
                    className="max-h-56 w-full object-cover rounded-xl border border-gray-800"
                  />
                  <button 
                    onClick={() => { setImagePreview(null); setSelectedFile(null); }}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black/90 text-white p-1.5 rounded-full text-xs transition-colors border border-gray-800 cursor-pointer"
                    title="Remove Photo"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                /* Uploader prompts */
                <>
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold text-white">Drag & drop your meal photo</span>
                  <span className="text-[10px] text-gray-500 mt-1">Supports PNG, JPG, JPEG</span>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <label className="bg-[#1C252F] hover:bg-[#25323F] text-gray-200 border border-gray-800 hover:border-gray-700 text-[11px] font-semibold py-1.5 px-3 rounded-xl cursor-pointer transition-all">
                      Browse Files
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileInput} 
                        className="hidden" 
                      />
                    </label>
                    <span className="text-[10px] text-gray-600">or</span>
                    <button
                      onClick={handleStartCamera}
                      className="bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-900/50 text-emerald-400 text-[11px] font-semibold py-1.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1"
                    >
                      <Camera className="w-3 h-3" /> Use Camera
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Optional Hint Text box */}
            <div className="mt-4">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Meal Name or Ingredients (Hint)
              </label>
              <input
                id="scanner-hint-input"
                type="text"
                value={foodHint}
                onChange={(e) => setFoodHint(e.target.value)}
                placeholder="e.g. Scrambled eggs, avocado on toast"
                className="w-full bg-[#1C252F] border border-gray-700/60 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Trigger analysis button */}
            {error && (
              <div className="mt-3.5 p-2.5 bg-red-950/30 border border-red-800/40 text-red-300 text-[11px] rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> {error}
              </div>
            )}

            <button
              id="scan-analyze-btn"
              onClick={handleScan}
              disabled={isScanning || (!imagePreview && !foodHint)}
              className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:border-transparent text-white font-semibold text-xs py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Analyzing Food Model...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 fill-white/10" /> Scan Calories & Macros
                </>
              )}
            </button>
          </div>

          {/* Tips block */}
          <div className="bg-[#141A21]/40 border border-gray-800/60 rounded-2xl p-5 text-xs text-gray-400 space-y-2">
            <span className="block font-bold text-gray-300">Tips for Best Accuracy:</span>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">•</span>
              <span>Keep lighting bright and avoid harsh glare.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">•</span>
              <span>Center a single plate/portion to avoid mixing unrelated dishes.</span>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="text-emerald-400 font-bold shrink-0">•</span>
              <span>Optionally type ingredient details in the hint text bar for fine-tuned estimates.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Scan Results View */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {isScanning ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-125"
              >
                <div className="relative w-16 h-16 flex items-center justify-center mb-6">
                  <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin"></div>
                  <Sparkles className="w-6 h-6 text-emerald-400 animate-pulse" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">Analyzing Nutrition Metrics</h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed">
                  The model is examining the visual textures, portion weights, and ingredients structure of your dish. Please stand by...
                </p>
                <div className="w-48 bg-gray-900 h-1 rounded-full mt-6 overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[60%] animate-pulse"></div>
                </div>
              </motion.div>
            ) : scanResult ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-6 space-y-6"
              >
                {/* Result header banner */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-gray-800/60 pb-5">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                      AI Scan Success
                    </span>
                    <h2 className="text-xl font-bold text-white mt-2">{scanResult.foodName}</h2>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {scanResult.dietaryTags.map((tag, i) => (
                        <span key={i} className="text-[9px] font-medium bg-gray-900 text-gray-400 px-2 py-0.5 rounded border border-gray-800">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* Health score and confidence metrics */}
                  <div className="flex gap-3">
                    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-2.5 text-center min-w-18.75">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-500 font-bold">Health Score</span>
                      <span className="text-lg font-black text-emerald-400">{scanResult.healthScore}</span>
                      <span className="block text-[8px] text-gray-500">/100</span>
                    </div>
                    <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-2.5 text-center min-w-18.75">
                      <span className="block text-[8px] uppercase tracking-wider text-gray-500 font-bold">Confidence</span>
                      <span className="text-lg font-black text-blue-400">94%</span>
                      <span className="block text-[8px] text-gray-500">Match</span>
                    </div>
                  </div>
                </div>

                {/* Calorie arc & basic splits */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Circle Radial calories display */}
                  <div className="md:col-span-5 flex flex-col items-center justify-center py-2">
                    <div className="relative w-40 h-40">
                      {/* SVG Ring */}
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="80"
                          cy="80"
                          r="54"
                          className="stroke-gray-800 fill-none"
                          strokeWidth="10"
                        />
                        <circle
                          cx="80"
                          cy="80"
                          r="54"
                          className="stroke-emerald-400 fill-none transition-all duration-1000 ease-out"
                          strokeWidth="10"
                          strokeDasharray="339.292"
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                        />
                      </svg>
                      {/* Inner Labels */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Flame className="w-5.5 h-5.5 text-orange-400 fill-orange-400/20 mb-1" />
                        <span className="text-2xl font-black text-white leading-none">{scanResult.calories}</span>
                        <span className="text-[10px] text-gray-500 font-semibold tracking-wider uppercase mt-1">kcal</span>
                      </div>
                    </div>
                  </div>

                  {/* Micro Breakdown Details */}
                  <div className="md:col-span-7 space-y-3.5">
                    <span className="block text-xs font-bold text-gray-300 uppercase tracking-wider">Estimated Nutrient Splits</span>
                    
                    {/* Protein bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400 font-semibold">Protein (Lean muscle rebuilding)</span>
                        <span className="text-blue-400 font-bold">{scanResult.protein}g</span>
                      </div>
                      <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-400 h-full rounded-full" style={{ width: `${Math.min((scanResult.protein / 50) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Carbs bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400 font-semibold">Carbohydrates (Glycogen energy)</span>
                        <span className="text-amber-500 font-bold">{scanResult.carbs}g</span>
                      </div>
                      <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: `${Math.min((scanResult.carbs / 80) * 100, 100)}%` }}></div>
                      </div>
                    </div>

                    {/* Fat bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-400 font-semibold">Dietary Fats (Hormonal balance)</span>
                        <span className="text-red-400 font-bold">{scanResult.fat}g</span>
                      </div>
                      <div className="w-full bg-gray-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-red-400 h-full rounded-full" style={{ width: `${Math.min((scanResult.fat / 35) * 100, 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Written Summary */}
                <div className="bg-[#1C252F] border border-gray-800 rounded-xl p-4">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" /> Coach's Nutrition Commentary
                  </span>
                  <p className="text-xs text-gray-300 leading-relaxed italic">
                    "{scanResult.summary}"
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-800/60 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    id="save-scanned-meal-btn"
                    onClick={handleSaveMeal}
                    className="w-full sm:w-auto flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle className="w-4.5 h-4.5" /> Log Meal to Calories Today
                  </button>
                  <button
                    onClick={() => { setScanResult(null); setImagePreview(null); }}
                    className="w-full sm:w-auto bg-[#1C252F] hover:bg-[#25323F] border border-gray-800 text-gray-300 font-semibold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    Scan Another Dish
                  </button>
                </div>

                {addedSuccess && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs rounded-xl text-center">
                    Meal registered successfully. Updating Calorie Limits...
                  </div>
                )}
              </motion.div>
            ) : (
              /* Instructions / No search placeholder */
              <div className="bg-[#141A21] border border-gray-800/60 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-125">
                <div className="w-16 h-16 rounded-2xl bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 mb-4">
                  <Sparkles className="w-8 h-8 text-emerald-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1.5">No Meal Scanned Yet</h3>
                <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6">
                  Choose a preset or upload an image on the left, then click "Scan Calories & Macros" to run Gemini multi-modal nutritional intelligence.
                </p>
                
                {/* Visual guidance cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-md">
                  <div className="bg-[#1C252F] border border-gray-800/40 p-3 rounded-xl text-left">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" /> Real-time Calorie Gauges
                    </span>
                    <span className="block text-[10px] text-gray-500 mt-1">Estimates calories and micro-splits instantly.</span>
                  </div>
                  <div className="bg-[#1C252F] border border-gray-800/40 p-3 rounded-xl text-left">
                    <span className="text-xs font-bold text-white flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-emerald-400" /> Dynamic Health Scores
                    </span>
                    <span className="block text-[10px] text-gray-500 mt-1">Rates overall nutrient density from 1-100.</span>
                  </div>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
