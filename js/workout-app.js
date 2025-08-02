import { StorageService } from './storage-service.js';
import { GeminiService } from './gemini-service.js';
import { UIManager } from './ui-manager.js';

export class WorkoutApp {
  constructor() {
    this.storageService = new StorageService();
    this.geminiService = new GeminiService();
    this.uiManager = new UIManager();
    
    this.initializeEventListeners();
    this.loadTodaysRoutine();
  }

  initializeEventListeners() {
    const generateBtn = document.getElementById("generateBtn");
    const loadTodayBtn = document.getElementById("loadTodayBtn");
    const clearBtn = document.getElementById("clearBtn");
    const resetHistoryBtn = document.getElementById("resetHistoryBtn");

    generateBtn.addEventListener("click", () => this.generateNewRoutine());
    loadTodayBtn.addEventListener("click", () => this.loadTodaysRoutine());
    clearBtn.addEventListener("click", () => this.uiManager.clearExercises());
    resetHistoryBtn.addEventListener("click", () => this.resetExerciseHistory());

    // Make toggleComplete available globally
    window.toggleComplete = (index) => this.uiManager.toggleComplete(index);
  }

  async generateNewRoutine() {
    this.uiManager.setLoading(true);
    try {
      const recentExercises = this.storageService.getRecentExercises();
      const exercises = await this.geminiService.generateWorkout(recentExercises);
      this.storageService.saveRoutine(exercises);
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
      const exercises = this.storageService.loadRoutine();
      if (exercises) {
        this.uiManager.displayExercises(exercises);
      } else {
        this.uiManager.displayExercises(null);
      }
    } catch (error) {
      this.uiManager.showError("Failed to load routine.");
      console.error(error);
    } finally {
      this.uiManager.setLoading(false);
    }
  }

  resetExerciseHistory() {
    if (confirm("Are you sure you want to reset the exercise history? This will allow previously used exercises to appear again.")) {
      this.storageService.clearRecentExercises();
      this.uiManager.showSuccess("Exercise history reset! You'll get more variety in future workouts.");
    }
  }
}
