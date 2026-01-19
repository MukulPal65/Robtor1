const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

async function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export const GeminiService = {
    async generateResponse(userMessage: string): Promise<string> {
        if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
            return "Error: OpenRouter API Key not configured. Please add VITE_OPENROUTER_API_KEY to your .env file.";
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "Robtor Health Assistant",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-001",
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are Robtor, a helpful and empathetic personal AI health assistant. Provide helpful, concise, and safe responses. If the user asks for medical advice, kindly remind them that you are an AI and they should consult a doctor for serious concerns. Keep the tone professional yet warm. Do not make up facts."
                        },
                        {
                            "role": "user",
                            "content": userMessage
                        }
                    ]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "OpenRouter API Error");
            return data.choices[0].message.content;
        } catch (error: any) {
            console.error("OpenRouter/Gemini API Error:", error);
            return "I'm having trouble connecting to my AI brain right now. Please try again later.";
        }
    },

    async analyzeImage(file: File): Promise<any> {
        if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
            throw new Error("OpenRouter API Key missing");
        }

        try {
            const base64Image = await fileToBase64(file);
            const prompt = `
            You are an expert medical AI assistant. Analyze this medical report image.
            
            Extract the following information and return it in valid JSON format ONLY (no markdown formatting, just the raw JSON object):
            {
                "health_score": <number between 0-100 based on overall results>,
                "summary": "<brief 1-sentence summary of the user's health status>",
                "results": [
                    {
                        "test_name": "<name of the test, e.g. HbA1c>",
                        "value": "<the value found, e.g. 5.4%>",
                        "status": "<Normal|Borderline|High|Low>",
                        "normal_range": "<the reference range, e.g. 4.0-5.6%>",
                        "interpretation": "<brief explanation of what this means>"
                    }
                ],
                "recommendations": [
                    "<specific actionable recommendation 1>",
                    "<specific actionable recommendation 2>",
                    "<specific actionable recommendation 3>"
                ],
                "diet_plan": {
                    "breakfast": "<personalized breakfast recommendation>",
                    "lunch": "<personalized lunch recommendation>",
                    "dinner": "<personalized dinner recommendation>",
                    "snacks": ["<snack 1>", "<snack 2>"],
                    "avoid": ["<food to avoid 1>", "<food to avoid 2>"]
                },
                "fitness_plan": {
                    "routine_name": "<name for this routine, e.g. Heart-Healthy Walk>",
                    "exercises": [
                        {
                            "name": "<exercise name>",
                            "duration": "<duration, e.g. 20 mins>",
                            "intensity": "<Low|Moderate|High>",
                            "benefit": "<why this is recommended based on report>"
                        }
                    ],
                    "weekly_goal": "<summary goal for the week>"
                }
            }

            If the image is not a medical report, return a JSON with health_score: 0 and summary: "This does not appear to be a valid medical report."
            `;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "Robtor Health Assistant",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-001",
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                { "type": "text", "text": prompt },
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": `data:${file.type};base64,${base64Image}`
                                    }
                                }
                            ]
                        }
                    ]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "OpenRouter API Error");

            const text = data.choices[0].message.content;
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (error) {
            console.error("Error analyzing image with OpenRouter:", error);
            throw error;
        }
    },

    async analyzeSymptoms(symptoms: string[]): Promise<any> {
        if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
            throw new Error("OpenRouter API Key missing");
        }

        try {
            const prompt = `
            You are an expert medical AI. Analyze the following symptoms: ${symptoms.join(', ')}.
            
            Provide a health assessment in valid JSON format ONLY:
            {
                "possible_condition": "<most likely condition>",
                "confidence_score": <number between 0-100>,
                "explanation": "<brief explanation of what this means>",
                "recommendations": [
                    {
                        "title": "<recommendation title>",
                        "description": "<long description>",
                        "type": "<lifestyle|medication|monitoring>"
                    }
                ],
                "urgent_signs": ["<sign 1>", "<sign 2>"],
                "disclaimer": "This is not a medical diagnosis. Always consult a professional."
            }
            `;

            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "HTTP-Referer": window.location.origin,
                    "X-Title": "Robtor Health Assistant",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-001",
                    "messages": [{ "role": "user", "content": prompt }]
                })
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error.message || "OpenRouter API Error");

            const text = data.choices[0].message.content;
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            return JSON.parse(cleanText);
        } catch (error) {
            console.error("Error analyzing symptoms with OpenRouter:", error);
            throw error;
        }
    }
};
