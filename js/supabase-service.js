import { CONFIG } from './config.js';

export class SupabaseService {
  constructor() {
    const { createClient } = supabase;
    this.client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }

  async saveRoutine(exercises) {
    const today = new Date().toISOString().split("T")[0];

    try {
      const { data, error } = await this.client
        .from("workout_routines")
        .upsert(
          {
            date: today,
            exercises: exercises,
          },
          {
            onConflict: "date",
          }
        );

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Supabase Error:", error);
      throw error;
    }
  }

  async loadRoutine(date = null) {
    const targetDate = date || new Date().toISOString().split("T")[0];

    try {
      const { data, error } = await this.client
        .from("workout_routines")
        .select("exercises")
        .eq("date", targetDate)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data?.exercises || null;
    } catch (error) {
      console.error("Supabase Error:", error);
      throw error;
    }
  }

  async getRecentExercises() {
    try {
      const pastWeek = new Date();
      pastWeek.setDate(pastWeek.getDate() - 7);
      const pastWeekStr = pastWeek.toISOString().split('T')[0];
      
      const { data, error } = await this.client
        .from('workout_routines')
        .select('exercises')
        .gte('date', pastWeekStr)
        .order('date', { ascending: false });

      if (error) throw error;
      
      const recentExercises = [];
      data?.forEach(routine => {
        routine.exercises?.forEach(exercise => {
          recentExercises.push(exercise.name);
        });
      });
      
      return [...new Set(recentExercises)]; // Remove duplicates
    } catch (error) {
      console.error('Error getting recent exercises:', error);
      return [];
    }
  }
}
