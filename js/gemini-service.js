export class GeminiService {
  async generateWorkout(recentExercises = []) {
    const currentTime = new Date().getTime();
    const randomSeed = Math.floor(Math.random() * 10000);
    const today = new Date().toLocaleDateString();
    
    const exerciseVariations = [
      "Include creative variations and avoid common exercises like basic push-ups and squats",
      "Focus on functional movements and compound exercises",
      "Mix traditional exercises with modern fitness trends",
      "Include both dynamic and static holds",
      "Emphasize different movement patterns and planes of motion",
      "Focus on unilateral (single-sided) movements",
      "Include plyometric and explosive movements",
      "Incorporate isometric holds and tempo variations",
      "Mix animal movements and primal patterns",
      "Include yoga-inspired flows and stretches"
    ];
    
    const intensityLevels = [
      "beginner-friendly with modifications",
      "intermediate difficulty",
      "challenging but doable at home",
      "mix of easy and hard exercises",
      "focus on endurance and time-based challenges",
      "emphasize strength and power"
    ];
    
    const targetFocus = [
      "full-body integration",
      "core stability and strength",
      "upper body dominant",
      "lower body dominant", 
      "cardio and conditioning",
      "flexibility and mobility"
    ];
    
    const randomVariation = exerciseVariations[Math.floor(Math.random() * exerciseVariations.length)];
    const randomIntensity = intensityLevels[Math.floor(Math.random() * intensityLevels.length)];
    const randomFocus = targetFocus[Math.floor(Math.random() * targetFocus.length)];
    
    let avoidanceText = "";
    if (recentExercises.length > 0) {
      const recentList = recentExercises.slice(0, 12); // Only avoid the most recent 12 exercises
      avoidanceText = `\n\nIMPORTANT: Try to AVOID these recently used exercises: ${recentList.join(', ')}
      Generate different exercises that are NOT in this list. If you must use similar exercises, use creative variations with different names.`;
    }
    
    const prompt = `Generate exactly 4 UNIQUE and DIFFERENT exercises for today's workout (${today}). 

    Guidelines:
    - ${randomVariation}
    - Make them ${randomIntensity}
    - Focus on ${randomFocus}
    - No equipment needed (bodyweight only)
    - Each exercise should target different muscle groups
    - Be creative and include exercise variations
    - Use descriptive, specific exercise names (not generic ones)
    - Include exercise variations, modifications, or unique twists
    ${avoidanceText}
    
    Random seed: ${randomSeed} (use this for variation)
    Date: ${today}
        
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
        `https://generativelanguage.googleapis.com/v1beta/models/gemma-3n-e4b-it:generateContent?key=${process.env.GEMINI_API_KEY}`,
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
            generationConfig: {
              temperature: 0.9, // Higher temperature for more creativity
              topK: 40,
              topP: 0.9,
              maxOutputTokens: 2048,
            },
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
