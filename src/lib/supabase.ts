import { createClient } from '@supabase/supabase-js';
import { UserProfile, WeightLog, MealLog, Message } from '../types';

// Environment variables can be configured via public VITE_ prefixes in client build
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

if (isSupabaseConfigured) {
  console.log("Supabase successfully integrated and active.");
} else {
  console.warn("VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY not configured. Seamless local simulation fallback active.");
}

// -------------------------------------------------------------
// Database schema table helper functions (with offline-first simulation)
// -------------------------------------------------------------

// Local storage fallback state keys helper
const getKeys = (userId: string) => ({
  profile: `wellness_profile_${userId}`,
  weights: `wellness_weights_${userId}`,
  meals: `wellness_meals_${userId}`,
  chat: `wellness_chat_${userId}`
});

const KEYS = {
  user: 'wellness_user_session'
};

const getLocalUsers = (): Record<string, AppUserSession> => {
  const cached = localStorage.getItem('wellness_simulated_users');
  return cached ? JSON.parse(cached) : {};
};

const saveLocalUser = (email: string, user: AppUserSession) => {
  const users = getLocalUsers();
  users[email.toLowerCase()] = user;
  localStorage.setItem('wellness_simulated_users', JSON.stringify(users));
};

export interface AppUserSession {
  id: string;
  email: string;
  fullName: string;
}

// Save temporary session in offline mode
const getLocalSession = (): AppUserSession | null => {
  const cached = localStorage.getItem(KEYS.user);
  return cached ? JSON.parse(cached) : null;
};

const setLocalSession = (session: AppUserSession | null) => {
  if (session) {
    localStorage.setItem(KEYS.user, JSON.stringify(session));
  } else {
    localStorage.removeItem(KEYS.user);
  }
};

/**
 * Authentication Wrapper
 */
export const authService = {
  async signUp(email: string, password: string, fullName: string): Promise<{ success: boolean; user?: AppUserSession; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName
            }
          }
        });

        if (error) throw error;
        if (!data.user) throw new Error("Could not create user account.");

        const userSession: AppUserSession = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: fullName
        };

        // Initialize user profile with clean/empty values for new users
        const defaultProfile: UserProfile = {
          fullName,
          email,
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

        // Cache profile in localStorage for immediate/fallback usage
        const uKeys = getKeys(data.user.id);
        localStorage.setItem(uKeys.profile, JSON.stringify(defaultProfile));

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            full_name: fullName,
            email: email,
            current_weight: 0,
            target_weight: 0,
            height_cm: 0,
            gender: "",
            age: 0,
            activity_level: "moderate",
            calorie_goal: 0,
            protein_goal: 0,
            carbs_goal: 0,
            fat_goal: 0,
            weight_unit: "lbs"
          });

        if (profileError) {
          console.warn("Could not insert profile in database, trying simple fallback:", profileError.message);
        }

        setLocalSession(userSession);
        return { success: true, user: userSession };

      } catch (err: any) {
        return { success: false, error: err.message };
      }
    } else {
      // Simulation mode
      const userSession: AppUserSession = {
        id: `user_${Math.random().toString(36).substring(7)}`,
        email,
        fullName
      };

      const defaultProfile: UserProfile = {
        fullName,
        email,
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

      const uKeys = getKeys(userSession.id);
      localStorage.setItem(uKeys.profile, JSON.stringify(defaultProfile));

      // Save user to simulated database
      saveLocalUser(email, userSession);

      setLocalSession(userSession);
      return { success: true, user: userSession };
    }
  },

  async signIn(email: string, password: string): Promise<{ success: boolean; user?: AppUserSession; error?: string }> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        if (!data.user) throw new Error("Could not retrieve user.");

        // Retrieve custom full name from profile or metadata
        let fullName = data.user.user_metadata?.full_name || "Jamie Vance";
        
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.user.id)
          .single();

        if (profileData?.full_name) {
          fullName = profileData.full_name;
        }

        const userSession: AppUserSession = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: fullName
        };

        setLocalSession(userSession);
        return { success: true, user: userSession };

      } catch (err: any) {
        return { success: false, error: err.message };
      }
    } else {
      // Simulation mode
      const users = getLocalUsers();
      const existingUser = users[email.toLowerCase()];

      let userSession: AppUserSession;

      if (existingUser) {
        userSession = existingUser;
      } else {
        // Automatically create a simulated user if they sign in (helps for local developer convenience)
        userSession = {
          id: `user_${Math.random().toString(36).substring(7)}`,
          email,
          fullName: email.split('@')[0]
        };
        saveLocalUser(email, userSession);

        const defaultProfile: UserProfile = {
          fullName: userSession.fullName,
          email,
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
        const uKeys = getKeys(userSession.id);
        localStorage.setItem(uKeys.profile, JSON.stringify(defaultProfile));
      }

      setLocalSession(userSession);
      return { success: true, user: userSession };
    }
  },

  async signOut(): Promise<void> {
    setLocalSession(null);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
  },

  getCurrentSession(): AppUserSession | null {
    return getLocalSession();
  }
};

/**
 * Profile DB operations
 */
export const profileService = {
  async getProfile(userId: string): Promise<UserProfile> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // New user without a profile record
            return {
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
          }
          throw error;
        }

        return {
          fullName: data.full_name || "",
          email: data.email || "",
          currentWeight: data.current_weight ? Number(data.current_weight) : 0,
          targetWeight: data.target_weight ? Number(data.target_weight) : 0,
          height: data.height_cm ? Number(data.height_cm) : 0,
          gender: data.gender || "",
          age: data.age ? Number(data.age) : 0,
          activityLevel: data.activity_level || "moderate",
          calorieGoal: data.calorie_goal ? Number(data.calorie_goal) : 0,
          proteinGoal: data.protein_goal ? Number(data.protein_goal) : 0,
          carbsGoal: data.carbs_goal ? Number(data.carbs_goal) : 0,
          fatGoal: data.fat_goal ? Number(data.fat_goal) : 0,
          weightUnit: data.weight_unit || "lbs",
          onboardingComplete: data.onboarding_complete !== undefined ? !!data.onboarding_complete : (data.calorie_goal && Number(data.calorie_goal) > 0)
        };
      } catch (err) {
        console.warn("Database profile fetch error, returning default / local profile.", err);
      }
    }

    // Demo Guest pre-seeded data
    if (userId === "demo-jamie") {
      return {
        fullName: "Jamie Vance",
        email: "jamie.vance@example.com",
        currentWeight: 172.4,
        targetWeight: 160.0,
        height: 178,
        gender: "male",
        age: 28,
        activityLevel: "moderate",
        calorieGoal: 2050,
        proteinGoal: 145,
        carbsGoal: 215,
        fatGoal: 68,
        weightUnit: "lbs",
        onboardingComplete: true
      };
    }

    const uKeys = getKeys(userId);
    const cached = localStorage.getItem(uKeys.profile);
    if (cached) {
      return JSON.parse(cached);
    }

    // Try to get fullName and email from session
    const session = getLocalSession();
    const name = (session && session.id === userId) ? session.fullName : "";
    const emailStr = (session && session.id === userId) ? session.email : "";

    return {
      fullName: name,
      email: emailStr,
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
  },

  async updateProfile(userId: string, profile: UserProfile): Promise<void> {
    const uKeys = getKeys(userId);
    localStorage.setItem(uKeys.profile, JSON.stringify(profile));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            full_name: profile.fullName,
            email: profile.email,
            current_weight: profile.currentWeight,
            target_weight: profile.targetWeight,
            height_cm: profile.height,
            gender: profile.gender,
            age: profile.age,
            activity_level: profile.activityLevel,
            calorie_goal: profile.calorieGoal,
            protein_goal: profile.proteinGoal,
            carbs_goal: profile.carbsGoal,
            fat_goal: profile.fatGoal,
            weight_unit: profile.weightUnit,
            onboarding_complete: profile.onboardingComplete
          });
      } catch (err) {
        console.error("Could not sync profile with Supabase:", err);
      }
    }
  }
};

/**
 * Weight Logs DB operations
 */
export const weightLogsService = {
  async getWeightLogs(userId: string): Promise<WeightLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });

        if (error) throw error;

        return data.map(item => ({
          id: item.id,
          date: item.date,
          weight: Number(item.weight),
          notes: item.notes
        }));
      } catch (err) {
        console.warn("Database weight fetch failed, using local caching.", err);
      }
    }

    if (userId === "demo-jamie") {
      return [
        { id: "w1", date: "2026-07-10", weight: 175.2, notes: "Fasting morning weight" },
        { id: "w2", date: "2026-07-11", weight: 174.4, notes: "Fasting morning weight" },
        { id: "w3", date: "2026-07-12", weight: 173.8, notes: "Post-workout" },
        { id: "w4", date: "2026-07-13", weight: 173.1, notes: "Fasting morning weight" },
        { id: "w5", date: "2026-07-14", weight: 172.4, notes: "Fasting morning weight" }
      ];
    }

    const uKeys = getKeys(userId);
    const cached = localStorage.getItem(uKeys.weights);
    return cached ? JSON.parse(cached) : [];
  },

  async addWeightLog(userId: string, weightLog: WeightLog): Promise<void> {
    const logs = await this.getWeightLogs(userId);
    const updated = [weightLog, ...logs.filter(l => l.id !== weightLog.id)];
    const uKeys = getKeys(userId);
    localStorage.setItem(uKeys.weights, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('weight_logs')
          .upsert({
            id: weightLog.id,
            user_id: userId,
            date: weightLog.date,
            weight: weightLog.weight,
            notes: weightLog.notes
          });
      } catch (err) {
        console.error("Could not sync weight log with Supabase:", err);
      }
    }
  },

  async deleteWeightLog(userId: string, id: string): Promise<void> {
    const logs = await this.getWeightLogs(userId);
    const updated = logs.filter(l => l.id !== id);
    const uKeys = getKeys(userId);
    localStorage.setItem(uKeys.weights, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('weight_logs')
          .delete()
          .eq('id', id);
      } catch (err) {
        console.error("Could not delete weight log from Supabase:", err);
      }
    }
  }
};

/**
 * Meal Logs DB operations
 */
export const mealLogsService = {
  async getMealLogs(userId: string): Promise<MealLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('meal_logs')
          .select('*')
          .eq('user_id', userId)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        return data.map(item => ({
          id: item.id,
          name: item.name,
          timestamp: item.timestamp,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          imageUrl: item.image_url
        }));
      } catch (err) {
        console.warn("Database meal logs fetch failed, using local caching.", err);
      }
    }

    if (userId === "demo-jamie") {
      return [
        { id: "m1", name: "Avocado & Egg Sourdough Toast", timestamp: "2026-07-15T08:30:00Z", calories: 340, protein: 14, carbs: 36, fat: 16 },
        { id: "m2", name: "Greek Yogurt Bowl with Berries", timestamp: "2026-07-15T10:45:00Z", calories: 180, protein: 18, carbs: 20, fat: 4 }
      ];
    }

    const uKeys = getKeys(userId);
    const cached = localStorage.getItem(uKeys.meals);
    return cached ? JSON.parse(cached) : [];
  },

  async addMealLog(userId: string, mealLog: MealLog): Promise<void> {
    const logs = await this.getMealLogs(userId);
    const updated = [mealLog, ...logs.filter(m => m.id !== mealLog.id)];
    const uKeys = getKeys(userId);
    localStorage.setItem(uKeys.meals, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('meal_logs')
          .upsert({
            id: mealLog.id,
            user_id: userId,
            name: mealLog.name,
            timestamp: mealLog.timestamp,
            calories: mealLog.calories,
            protein: mealLog.protein,
            carbs: mealLog.carbs,
            fat: mealLog.fat,
            image_url: mealLog.imageUrl
          });
      } catch (err) {
        console.error("Could not sync meal log with Supabase:", err);
      }
    }
  }
};

/**
 * Chat History DB operations
 */
export const chatHistoryService = {
  async getChatHistory(userId: string): Promise<Message[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('chat_history')
          .select('*')
          .eq('user_id', userId)
          .order('id', { ascending: true }); // ID can act as chronological order or use raw created_at

        if (error) throw error;

        return data.map(item => ({
          id: item.id,
          sender: item.sender,
          text: item.text,
          timestamp: item.timestamp
        }));
      } catch (err) {
        console.warn("Database chat history fetch failed, using local caching.", err);
      }
    }

    if (userId === "demo-jamie") {
      return [
        {
          id: "init",
          sender: "ai",
          text: "### Welcome to your Personalized Workspace! 🏋️‍♂️🥗\n\nI am your **AI Performance & Diet Coach**. I have synchronized with your current calorie target (**2,050 kcal**) and daily protein objective (**145g**).\n\nFeel free to ask me questions regarding meal preps, specialized resistance gym routines, or how to maintain consistency to hit your weight target of **160.0 lbs**. \n\nWhat are we focusing on today?",
          timestamp: "10:00 AM"
        }
      ];
    }

    const uKeys = getKeys(userId);
    const cached = localStorage.getItem(uKeys.chat);
    return cached ? JSON.parse(cached) : [];
  },

  async addChatMessage(userId: string, msg: Message): Promise<void> {
    const history = await this.getChatHistory(userId);
    const updated = [...history, msg];
    const uKeys = getKeys(userId);
    localStorage.setItem(uKeys.chat, JSON.stringify(updated));

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('chat_history')
          .upsert({
            id: msg.id,
            user_id: userId,
            sender: msg.sender,
            text: msg.text,
            timestamp: msg.timestamp
          });
      } catch (err) {
        console.error("Could not sync chat message with Supabase:", err);
      }
    }
  },

  async clearChatHistory(userId: string): Promise<void> {
    const uKeys = getKeys(userId);
    localStorage.removeItem(uKeys.chat);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase
          .from('chat_history')
          .delete()
          .eq('user_id', userId);
      } catch (err) {
        console.error("Could not clear chat history on Supabase:", err);
      }
    }
  }
};
