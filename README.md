# Workout Routine App Configuration

## Required API Keys and Setup

### 1. Supabase Setup
1. Go to [Supabase](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy your project URL and anon public key
4. Run the SQL schema from `database_schema.sql` in your Supabase SQL editor
5. Update the following values in `index.html`:
   ```javascript
   const SUPABASE_URL = 'your-project-url';
   const SUPABASE_ANON_KEY = 'your-anon-key';
   ```

### 2. Google Gemini API Setup
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Update the following value in `index.html`:
   ```javascript
   const GEMINI_API_KEY = 'your-gemini-api-key';
   ```

### 3. Environment Variables (Optional but Recommended)
For better security, consider moving API keys to environment variables or a separate config file:

```javascript
// config.js (not committed to git)
export const config = {
    SUPABASE_URL: 'your-supabase-url',
    SUPABASE_ANON_KEY: 'your-supabase-anon-key',
    GEMINI_API_KEY: 'your-gemini-api-key'
};
```

## Features
- ✅ Generate 4 new exercises daily using Gemini AI
- ✅ Mix of upper body, lower body, core, and cardio exercises
- ✅ Save routines to Supabase database
- ✅ Load previous routines by date
- ✅ Mark exercises as complete
- ✅ Responsive design for mobile and desktop
- ✅ No equipment required - bodyweight exercises

## Usage
1. Open `index.html` in your browser
2. Click "Generate New Routine" to get 4 new exercises
3. Click "Load Today's Routine" to see saved exercises
4. Mark exercises as complete as you finish them
5. The routine is automatically saved to your database

## Database Schema
The app uses two main tables:
- `workout_routines`: Stores daily exercise routines
- `exercise_history`: Tracks completion history (optional)

See `database_schema.sql` for complete schema details.

## Troubleshooting
- Make sure all API keys are correctly set
- Check browser console for error messages
- Ensure Supabase RLS policies allow your operations
- Verify internet connection for API calls
