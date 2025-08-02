-- Supabase Database Schema for Workout Routine App
-- Run this in your Supabase SQL editor

-- Table to store daily workout routines
CREATE TABLE workout_routines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL UNIQUE,
  exercises JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table to store exercise history for analytics (optional)
CREATE TABLE exercise_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  routine_id UUID REFERENCES workout_routines(id) ON DELETE CASCADE,
  exercise_name TEXT NOT NULL,
  exercise_type TEXT NOT NULL,
  target_muscle TEXT NOT NULL,
  reps INTEGER,
  sets INTEGER,
  duration TEXT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_workout_routines_date ON workout_routines(date);
CREATE INDEX idx_exercise_history_routine_id ON exercise_history(routine_id);
CREATE INDEX idx_exercise_history_completed ON exercise_history(completed);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_workout_routines_updated_at 
  BEFORE UPDATE ON workout_routines 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) - Optional but recommended
ALTER TABLE workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_history ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (if you want to add user authentication later)
-- For now, allow all operations (you can modify this based on your auth requirements)
CREATE POLICY "Allow all operations on workout_routines" ON workout_routines
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on exercise_history" ON exercise_history
  FOR ALL USING (true) WITH CHECK (true);

-- Insert sample data (optional)
INSERT INTO workout_routines (date, exercises) VALUES (
  CURRENT_DATE,
  '[
    {
      "name": "Push-ups",
      "type": "Bodyweight",
      "target": "Chest, Triceps",
      "reps": "3 sets of 12-15",
      "description": "Keep your body straight and lower until chest nearly touches ground"
    },
    {
      "name": "Squats",
      "type": "Bodyweight",
      "target": "Legs, Glutes",
      "reps": "3 sets of 15-20",
      "description": "Lower until thighs are parallel to ground, keep knees aligned"
    },
    {
      "name": "Plank",
      "type": "Core",
      "target": "Core, Shoulders",
      "reps": "3 sets of 30-60 seconds",
      "description": "Hold straight body position, engage core muscles"
    },
    {
      "name": "Jumping Jacks",
      "type": "Cardio",
      "target": "Full Body",
      "reps": "3 sets of 20",
      "description": "Jump while spreading legs and raising arms overhead"
    }
  ]'::jsonb
);
