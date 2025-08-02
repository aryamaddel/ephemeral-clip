import { SupabaseService } from './supabase-service.js';
import { GeminiService } from './gemini-service.js';
import { UIManager } from './ui-manager.js';

export class WorkoutApp {
  constructor() {
    this.supabaseService = new SupabaseService();
    this.geminiService = new GeminiService();
    this.uiManager = new UIManager();
    
    this.initializeEventListeners();
    this.loadTodaysRoutine();
  }

  initializeEventListeners() {
    const generateBtn = document.getElementById("generateBtn");
    const loadTodayBtn = document.getElementById("loadTodayBtn");
    const clearBtn = document.getElementById("clearBtn");

    generateBtn.addEventListener("click", () => this.generateNewRoutine());
    loadTodayBtn.addEventListener("click", () => this.loadTodaysRoutine());
    clearBtn.addEventListener("click", () => this.uiManager.clearExercises());

    // Make toggleComplete available globally
    window.toggleComplete = (index) => this.uiManager.toggleComplete(index);
  }

  async generateNewRoutine() {
    this.uiManager.setLoading(true);
    try {
      const recentExercises = await this.supabaseService.getRecentExercises();
      const exercises = await this.geminiService.generateWorkout(recentExercises);
      await this.supabaseService.saveRoutine(exercises);
      this.uiManager.displayExercises(exercises);
    } catch (error) {
      this.uiManager.showError("Failed to generate workout. Please try again.");
      console.error(error);
    } finally {
      this.uiManager.setLoading(false);
    }
  }

  async loadTodaysRoutine() {
    this.uiManager.setLoading(true);
    try {
      const exercises = await this.supabaseService.loadRoutine();
      if (exercises) {
        this.uiManager.displayExercises(exercises);
      } else {
        this.uiManager.showError("No routine found for today. Generate a new one!");
      }
    } catch (error) {
      this.uiManager.showError("Failed to load routine.");
      console.error(error);
    } finally {
      this.uiManager.setLoading(false);
    }
  }
}
