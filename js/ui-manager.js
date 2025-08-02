export class UIManager {
  constructor() {
    this.exercisesContainer = document.getElementById("exercisesContainer");
    this.errorDiv = document.getElementById("error");
    this.loadingDiv = document.getElementById("loading");
    this.generateBtn = document.getElementById("generateBtn");
    this.loadTodayBtn = document.getElementById("loadTodayBtn");
    this.clearBtn = document.getElementById("clearBtn");
    this.resetHistoryBtn = document.getElementById("resetHistoryBtn");
    this.currentDateEl = document.getElementById("currentDate");
    
    this.initializeDate();
  }

  initializeDate() {
    this.currentDateEl.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  displayExercises(exercises) {
    if (!exercises || exercises.length === 0) {
      this.exercisesContainer.innerHTML = `
        <div class="empty-state">
          <h3>No routine found</h3>
          <p>Generate a new routine to get started</p>
        </div>
      `;
      return;
    }

    this.exercisesContainer.innerHTML = exercises
      .map((exercise, index) => this.createExerciseCard(exercise, index))
      .join("");
  }

  createExerciseCard(exercise, index) {
    return `
      <div class="exercise-card">
        <div class="exercise-header">
          <h3 class="exercise-name">${exercise.name}</h3>
          <span class="exercise-type">${exercise.type}</span>
        </div>
        <p class="exercise-target">${exercise.target}</p>
        <div class="exercise-reps">${exercise.reps}</div>
        <p class="exercise-description">${exercise.description}</p>
        <button class="complete-btn" onclick="window.toggleComplete(${index})">
          Complete
        </button>
      </div>
    `;
  }

  showError(message) {
    this.errorDiv.textContent = message;
    this.errorDiv.style.display = "block";
    setTimeout(() => {
      this.errorDiv.style.display = "none";
    }, 5000);
  }

  showSuccess(message) {
    this.errorDiv.textContent = message;
    this.errorDiv.style.display = "block";
    this.errorDiv.style.backgroundColor = "#4CAF50";
    setTimeout(() => {
      this.errorDiv.style.display = "none";
      this.errorDiv.style.backgroundColor = "#f44336";
    }, 3000);
  }

  setLoading(isLoading) {
    this.loadingDiv.style.display = isLoading ? "block" : "none";
    this.generateBtn.disabled = isLoading;
    this.loadTodayBtn.disabled = isLoading;
    this.resetHistoryBtn.disabled = isLoading;
  }

  clearExercises() {
    this.exercisesContainer.innerHTML = `
      <div class="empty-state">
        <h3>Ready to start?</h3>
        <p>Generate a new routine</p>
      </div>
    `;
  }

  toggleComplete(index) {
    const btn = document.querySelectorAll(".complete-btn")[index];
    if (btn.classList.contains("completed")) {
      btn.classList.remove("completed");
      btn.textContent = "Complete";
    } else {
      btn.classList.add("completed");
      btn.textContent = "✓ Done";
    }
  }
}
