export class StorageService {
  constructor() {
    this.STORAGE_KEY = 'workout_routines';
    this.RECENT_EXERCISES_KEY = 'recent_exercises';
    this.MAX_RECENT_EXERCISES = 20; // Keep track of last 20 exercises
  }

  saveRoutine(exercises) {
    const today = new Date().toISOString().split("T")[0];
    const routines = this.getAllRoutines();
    
    routines[today] = {
      date: today,
      exercises: exercises,
      createdAt: new Date().toISOString()
    };
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(routines));
    this.updateRecentExercises(exercises);
  }

  loadRoutine(date = null) {
    const targetDate = date || new Date().toISOString().split("T")[0];
    const routines = this.getAllRoutines();
    return routines[targetDate]?.exercises || null;
  }

  getAllRoutines() {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  }

  updateRecentExercises(exercises) {
    let recentExercises = this.getRecentExercises();
    
    // Add new exercises to the beginning of the array
    exercises.forEach(exercise => {
      const exerciseName = exercise.name.toLowerCase();
      // Remove if already exists to avoid duplicates
      recentExercises = recentExercises.filter(name => name.toLowerCase() !== exerciseName);
      recentExercises.unshift(exercise.name);
    });
    
    // Keep only the most recent exercises
    recentExercises = recentExercises.slice(0, this.MAX_RECENT_EXERCISES);
    
    localStorage.setItem(this.RECENT_EXERCISES_KEY, JSON.stringify(recentExercises));
  }

  getRecentExercises() {
    const stored = localStorage.getItem(this.RECENT_EXERCISES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  clearRecentExercises() {
    localStorage.removeItem(this.RECENT_EXERCISES_KEY);
  }

  clearAllData() {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem(this.RECENT_EXERCISES_KEY);
  }

  getRoutineHistory(days = 7) {
    const routines = this.getAllRoutines();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const history = [];
    for (const [date, routine] of Object.entries(routines)) {
      const routineDate = new Date(date);
      if (routineDate >= startDate && routineDate <= endDate) {
        history.push(routine);
      }
    }
    
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}
