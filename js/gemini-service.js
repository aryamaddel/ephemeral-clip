import { CONFIG } from './config.js';

export class GeminiService {
  async generateWorkout(recentExercises = []) {
    const currentTime = new Date().getTime();
    const randomSeed = Math.floor(Math.random() * 1000);
    const today = new Date().toLocaleDateString();
    
    const exerciseVariations = [
      "Include creative variations and avoid common exercises like basic push-ups and squats",
      "Focus on functional movements and compound exercises",
      "Mix traditional exercises with modern fitness trends",
      "Include both dynamic and static holds",
      "Emphasize different movement patterns and planes of motion"
    ];
    
    const intensityLevels = [
      "beginner-friendly with modifications",
      "intermediate difficulty",
      "challenging but doable at home",
      "mix of easy and hard exercises"
    ];
    
    const randomVariation = exerciseVariations[Math.floor(Math.random() * exerciseVariations.length)];
    const randomIntensity = intensityLevels[Math.floor(Math.random() * intensityLevels.length)];
    
    let avoidanceText = "";
    if (recentExercises.length > 0) {
      avoidanceText = `\n\nIMPORTANT: AVOID these recently used exercises: ${recentExercises.join(', ')}
      Generate completely different exercises that are NOT in this list.`;
    }
    
    const prompt = `Generate exactly 4 UNIQUE and DIFFERENT exercises for today's workout (${today}). 

    Guidelines:
    - ${randomVariation}
    - Make them ${randomIntensity}
    - No equipment needed (bodyweight only)
    - Avoid repetitive or basic exercises
    - Each exercise should target different muscle groups
    - Be creative and include exercise variations
    ${avoidanceText}
    
    Random seed: ${randomSeed} (use this for variation)
        
    Respond ONLY with a valid JSON array in this exact format:
    [
        {
            "name": "Exercise Name",
            "type": "Exercise Type (Bodyweight/Cardio/Strength/Core)",
            "target": "Target muscles",
            "reps": "Sets and reps (e.g., '3 sets of 12' or '30 seconds')",
            "description": "Brief description of proper form"
        }
    ]`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemma-3n-e4b-it:generateContent?key=${CONFIG.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;

      // Clean up the response and parse JSON
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error("Could not extract JSON from Gemini response");
      }

      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}
