// API Keys
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const GEMINI_API_KEY_2 = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY1;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// Model configurations
const OPENROUTER_MODELS = [
    'google/gemini-flash-1.5:free',
    'meta-llama/llama-3.2-11b-vision-instruct:free',
    'mistralai/mistral-7b-instruct:free'
];

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

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

/**
 * Robust JSON parser that handles common AI output issues
 */
function parseAIJSON(text: string): any {
    // Remove markdown code blocks
    let cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    
    // Try to extract JSON if it's wrapped in text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
        cleaned = jsonMatch[0];
    }
    
    // Fix common JSON issues
    cleaned = cleaned
        .replace(/,\s*([\]}])/g, '$1')  // Remove trailing commas
        .replace(/\n/g, ' ')             // Remove newlines
        .replace(/\r/g, '')              // Remove carriage returns
        .replace(/\t/g, ' ')             // Replace tabs with spaces
        .replace(/\s+/g, ' ');           // Collapse multiple spaces
    
    try {
        return JSON.parse(cleaned);
    } catch (firstError) {
        // If first parse fails, try more aggressive cleaning
        console.warn('First JSON parse failed, trying aggressive cleaning...');
        
        // Try to fix unescaped quotes in strings
        try {
            // This is a last resort - try to parse with relaxed rules
            const relaxed = cleaned
                .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure property names are quoted
                .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas again
            
            return JSON.parse(relaxed);
        } catch (secondError) {
            console.error('Original text:', text);
            console.error('Cleaned text:', cleaned);
            throw new SyntaxError(`Failed to parse AI response as JSON: ${firstError instanceof Error ? firstError.message : 'Unknown error'}`);
        }
    }
}

export const GeminiService = {
    async generateResponse(userMessage: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
        // Build messages array with conversation history
        const systemMessage = `You are Robtor, a helpful and empathetic personal AI health assistant. 

IMPORTANT FORMATTING RULES:
- Structure your responses with clear sections using line breaks
- Use bullet points (•) for lists
- Use numbered lists (1., 2., 3.) for steps
- Add blank lines between paragraphs for readability
- Use **bold** for important terms (the chat will render this)
- Keep paragraphs short (2-3 sentences max)

Provide helpful, concise, and safe responses. If the user asks for medical advice, kindly remind them that you are an AI and they should consult a doctor for serious concerns. Keep the tone professional yet warm. Do not make up facts.

Remember the conversation context and refer back to it when relevant.`;

        const messages = [
            { "role": "system", "content": systemMessage },
            ...conversationHistory,
            { "role": "user", "content": userMessage }
        ];

        // Priority 1: Try Groq (FASTEST for chat, use as primary)
        if (GROQ_API_KEY && GROQ_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Groq API...');
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: messages.map(m => ({ role: m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant', content: m.content }))
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text) {
                        console.log('✓ Groq API succeeded');
                        return text;
                    }
                }
            } catch (error) {
                console.warn('Groq API failed:', error);
            }
        }

        // Priority 2: Try Google Gemini Direct API
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Gemini Direct API...');
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `${systemMessage}\n\nConversation History:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${userMessage}`
                            }]
                        }]
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log('✓ Gemini Direct API succeeded');
                        return text;
                    }
                }
            } catch (error) {
                console.warn('Gemini Direct API failed:', error);
            }
        }

        // Priority 1B: Try Google Gemini Direct API (Key 2)
        if (GEMINI_API_KEY_2 && GEMINI_API_KEY_2 !== 'your_api_key_here') {
            try {
                console.log('Trying Gemini Direct API (Key 2)...');
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY_2}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: `${systemMessage}\n\nConversation History:\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser: ${userMessage}`
                            }]
                        }]
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log('✓ Gemini Direct API (Key 2) succeeded');
                        return text;
                    }
                }
            } catch (error) {
                console.warn('Gemini Direct API (Key 2) failed:', error);
            }
        }

        // Priority 2: Try Groq
        if (GROQ_API_KEY && GROQ_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Groq API...');
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: messages.map(m => ({ role: m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant', content: m.content }))
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text) {
                        console.log('✓ Groq API succeeded');
                        return text;
                    }
                }
            } catch (error) {
                console.warn('Groq API failed:', error);
            }
        }

        // Priority 3: Try Hugging Face
        if (HUGGINGFACE_API_KEY && HUGGINGFACE_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Hugging Face API...');
                const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        inputs: `${systemMessage}\n\n${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}\nUser: ${userMessage}\nAssistant:`,
                        parameters: { max_new_tokens: 500, temperature: 0.7 }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data[0]?.generated_text;
                    if (text) {
                        console.log('✓ Hugging Face API succeeded');
                        // Extract only the assistant's response
                        const assistantResponse = text.split('Assistant:').pop()?.trim();
                        return assistantResponse || text;
                    }
                }
            } catch (error) {
                console.warn('Hugging Face API failed:', error);
            }
        }

        // Priority 4: Try OpenRouter with multiple models
        if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_key_here') {
            for (const model of OPENROUTER_MODELS) {
                try {
                    console.log(`Trying OpenRouter with ${model}...`);
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                            "HTTP-Referer": window.location.origin,
                            "X-Title": "Robtor Health Assistant",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: messages
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const text = data.choices?.[0]?.message?.content;
                        if (text) {
                            console.log(`✓ OpenRouter (${model}) succeeded`);
                            return text;
                        }
                    }
                } catch (error) {
                    console.warn(`OpenRouter (${model}) failed:`, error);
                }
            }
        }

        // Priority 5: Try OpenAI (ChatGPT)
        if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying OpenAI API...');
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: messages.map(m => ({ role: m.role === 'system' ? 'system' : m.role === 'user' ? 'user' : 'assistant', content: m.content }))
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text) {
                        console.log('✓ OpenAI API succeeded');
                        return text;
                    }
                }
            } catch (error) {
                console.warn('OpenAI API failed:', error);
            }
        }

        // Fallback: Return general helpful response
        console.warn('All AI services failed, using fallback response');
        return this.getFallbackResponse(userMessage);
    },

    getFallbackResponse(userMessage: string): string {
        const lowerMessage = userMessage.toLowerCase();
        
        // General health queries
        if (lowerMessage.includes('symptom') || lowerMessage.includes('pain') || lowerMessage.includes('sick')) {
            return `I apologize, but I'm currently experiencing connectivity issues with my AI services. 

**General Health Advice:**
• If you're experiencing symptoms, please consult a healthcare professional
• For emergencies, call 911 or your local emergency services
• Keep track of your symptoms and when they started
• Stay hydrated and get adequate rest

**I recommend:**
1. Visit the Emergency tab for quick access to emergency services
2. Try again in a few moments when my connection is restored
3. For urgent matters, please contact your doctor directly

Your health and safety are the top priority! 🏥`;
        }

        // Diet/nutrition queries
        if (lowerMessage.includes('diet') || lowerMessage.includes('food') || lowerMessage.includes('eat')) {
            return `I'm having trouble connecting to my AI brain right now, but here are some general healthy eating tips:

**Balanced Diet Basics:**
• Eat plenty of fruits and vegetables (5+ servings daily)
• Choose whole grains over refined grains
• Include lean proteins (fish, chicken, legumes)
• Stay hydrated with 8-10 glasses of water
• Limit processed foods and added sugars

**Healthy Meal Structure:**
1. Breakfast: Whole grains + protein + fruit
2. Lunch: Lean protein + vegetables + healthy carbs
3. Dinner: Similar to lunch, lighter portions
4. Snacks: Nuts, fruits, yogurt

Please try again in a moment for personalized advice! 🥗`;
        }

        // Exercise queries
        if (lowerMessage.includes('exercise') || lowerMessage.includes('workout') || lowerMessage.includes('fitness')) {
            return `My AI connection is temporarily down, but here's general fitness guidance:

**General Exercise Guidelines:**
• Aim for 150 minutes of moderate activity per week
• Include both cardio and strength training
• Start slow and gradually increase intensity
• Always warm up before and cool down after exercise

**Beginner Workout:**
1. Walking: 30 minutes daily
2. Bodyweight exercises: Push-ups, squats, planks
3. Stretching: 10 minutes daily

**Safety Tips:**
• Listen to your body
• Stay hydrated
• Consult a doctor before starting new exercise programs

I'll be back online soon for personalized recommendations! 💪`;
        }

        // Default fallback
        return `I'm currently experiencing technical difficulties connecting to my AI services. 

**What you can do:**
• Try again in a few moments
• Check the Dashboard for your health metrics
• Use the Reports tab to upload medical documents
• Access Emergency Contacts if needed

**In the meantime:**
• For medical emergencies: Call 911
• For health questions: Consult your doctor
• For general wellness: Stay hydrated, get rest, eat healthy

I apologize for the inconvenience and will be back to helping you soon! 🤖💚`;
    },

    async analyzeImage(file: File): Promise<any> {
        const base64Image = await fileToBase64(file);
        const prompt = `You are an expert medical AI assistant. Analyze this medical report image.

CRITICAL: You must return ONLY valid JSON. No explanations, no markdown, no code blocks. Just the JSON object.

Return this exact structure (ensure all arrays end without trailing commas):
{
    "health_score": <number 0-100, calculate based on test results: 90-100 if all tests normal, 70-89 if mostly normal with minor issues, 50-69 if several abnormal results, 30-49 if multiple concerning results, below 30 if critical issues found>,
    "summary": "Brief summary here",
    "results": [
        {
            "test_name": "Test name",
            "value": "Value",
            "status": "Normal|Borderline|Abnormal|Critical",
            "normal_range": "Range",
            "interpretation": "Explanation"
        }
    ],
    "recommendations": [
        "Recommendation 1",
        "Recommendation 2"
    ],
    "diet_plan": {
        "breakfast": "Breakfast suggestion",
        "lunch": "Lunch suggestion",
        "dinner": "Dinner suggestion",
        "snacks": ["Snack 1", "Snack 2"],
        "avoid": ["Food 1", "Food 2"]
    },
    "fitness_plan": {
        "routine_name": "Routine name",
        "exercises": [
            {
                "name": "Exercise name",
                "duration": "20 mins",
                "intensity": "Moderate",
                "benefit": "Benefit explanation"
            }
        ],
        "weekly_goal": "Weekly goal"
    }
}

IMPORTANT: No trailing commas in arrays or objects. Ensure valid JSON syntax.

If the image is not a medical report, return: {"health_score": 0, "summary": "This does not appear to be a valid medical report.", "results": [], "recommendations": [], "diet_plan": {"breakfast": "", "lunch": "", "dinner": "", "snacks": [], "avoid": []}, "fitness_plan": {"routine_name": "", "exercises": [], "weekly_goal": ""}}`;

        // Priority 1: Try OpenAI (Best for vision tasks)
        if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying OpenAI API for image analysis...');
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: prompt },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: `data:${file.type};base64,${base64Image}`
                                        }
                                    }
                                ]
                            }
                        ]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text) {
                        console.log('✓ OpenAI API succeeded for image');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('OpenAI image analysis failed:', error);
            }
        }

        // Priority 2: Try Google Gemini Direct API
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Gemini Direct API for image analysis...');
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: prompt },
                                {
                                    inline_data: {
                                        mime_type: file.type,
                                        data: base64Image
                                    }
                                }
                            ]
                        }]
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log('✓ Gemini Direct API succeeded for image');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('Gemini Direct image analysis failed:', error);
            }
        }

        // Priority 1B: Try Google Gemini Direct API (Key 2) for image
        if (GEMINI_API_KEY_2 && GEMINI_API_KEY_2 !== 'your_api_key_here') {
            try {
                console.log('Trying Gemini Direct API (Key 2) for image analysis...');
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY_2}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [
                                { text: prompt },
                                {
                                    inline_data: {
                                        mime_type: file.type,
                                        data: base64Image
                                    }
                                }
                            ]
                        }]
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log('✓ Gemini Direct API (Key 2) succeeded for image');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('Gemini Direct (Key 2) image analysis failed:', error);
            }
        }

        // Priority 2-3: Skip Groq and Hugging Face for vision (not supported well)

        // Priority 4: Try OpenRouter (skip broken models)
        if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_key_here') {
            // Only use models that actually support vision
            const visionModels = ['google/gemini-flash-1.5-8b'];
            
            for (const model of visionModels) {
                try {
                    console.log(`Trying OpenRouter with ${model} for image...`);
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                            "HTTP-Referer": window.location.origin,
                            "X-Title": "Robtor Health Assistant",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            "model": model,
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

                    if (response.ok) {
                        const data = await response.json();
                        const text = data.choices?.[0]?.message?.content;
                        if (text) {
                            console.log(`✓ OpenRouter (${model}) succeeded for image`);
                            return parseAIJSON(text);
                        }
                    }
                } catch (error) {
                    console.warn(`OpenRouter (${model}) image analysis failed:`, error);
                }
            }
        }

        // Priority 5: Try OpenAI (gpt-4o-mini has vision)
        if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying OpenAI API for image analysis...');
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            {
                                role: "user",
                                content: [
                                    { type: "text", text: prompt },
                                    {
                                        type: "image_url",
                                        image_url: {
                                            url: `data:${file.type};base64,${base64Image}`
                                        }
                                    }
                                ]
                            }
                        ]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text) {
                        console.log('✓ OpenAI API succeeded for image');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('OpenAI image analysis failed:', error);
            }
        }

        // Fallback: Return demo data with comprehensive report analysis
        console.error('All vision APIs failed - returning demo data');
        console.log('📊 Returning demo medical report analysis');
        
        return {
            health_score: 78,
            summary: "⚠️ AI services are currently unavailable. This is demo data for testing purposes. Based on a sample comprehensive metabolic panel and lipid profile, your results show mostly normal values with some areas requiring attention. Your kidney function and blood glucose levels are within normal range. However, your LDL cholesterol is slightly elevated, and your vitamin D levels are below optimal. Overall health status is good with room for improvement.",
            results: [
                {
                    test_name: "Fasting Blood Glucose",
                    value: "92 mg/dL",
                    status: "Normal",
                    normal_range: "70-100 mg/dL",
                    interpretation: "Your blood sugar level is well-controlled. Continue maintaining a balanced diet and regular exercise routine."
                },
                {
                    test_name: "HbA1c (Glycated Hemoglobin)",
                    value: "5.4%",
                    status: "Normal",
                    normal_range: "4.0-5.6%",
                    interpretation: "Excellent long-term blood sugar control. Your average glucose levels over the past 3 months are normal, indicating low diabetes risk."
                },
                {
                    test_name: "Total Cholesterol",
                    value: "198 mg/dL",
                    status: "Borderline",
                    normal_range: "<200 mg/dL",
                    interpretation: "Just below the optimal threshold. Monitor your intake of saturated fats and focus on heart-healthy foods."
                },
                {
                    test_name: "LDL Cholesterol (Bad)",
                    value: "128 mg/dL",
                    status: "Borderline",
                    normal_range: "<100 mg/dL",
                    interpretation: "Slightly elevated LDL cholesterol increases cardiovascular risk. Dietary changes and regular exercise can help lower this."
                },
                {
                    test_name: "HDL Cholesterol (Good)",
                    value: "52 mg/dL",
                    status: "Normal",
                    normal_range: ">40 mg/dL (men), >50 mg/dL (women)",
                    interpretation: "Good protective cholesterol level. HDL helps remove bad cholesterol from your arteries."
                },
                {
                    test_name: "Triglycerides",
                    value: "145 mg/dL",
                    status: "Normal",
                    normal_range: "<150 mg/dL",
                    interpretation: "Within normal range. Triglycerides are a type of fat in your blood used for energy."
                },
                {
                    test_name: "Blood Pressure (Systolic/Diastolic)",
                    value: "122/78 mmHg",
                    status: "Normal",
                    normal_range: "<120/80 mmHg",
                    interpretation: "Slightly elevated systolic pressure. Continue monitoring and maintain a low-sodium diet."
                },
                {
                    test_name: "Creatinine",
                    value: "0.9 mg/dL",
                    status: "Normal",
                    normal_range: "0.7-1.3 mg/dL",
                    interpretation: "Your kidney function is excellent. Creatinine levels indicate healthy waste filtration."
                },
                {
                    test_name: "eGFR (Kidney Function)",
                    value: ">90 mL/min",
                    status: "Normal",
                    normal_range: ">60 mL/min",
                    interpretation: "Normal kidney filtration rate. Your kidneys are functioning optimally."
                },
                {
                    test_name: "Hemoglobin",
                    value: "14.2 g/dL",
                    status: "Normal",
                    normal_range: "13.5-17.5 g/dL (men), 12.0-15.5 g/dL (women)",
                    interpretation: "Healthy red blood cell count. No signs of anemia."
                },
                {
                    test_name: "White Blood Cell Count",
                    value: "7,200 /μL",
                    status: "Normal",
                    normal_range: "4,500-11,000 /μL",
                    interpretation: "Normal immune system function. Your body is ready to fight infections."
                },
                {
                    test_name: "Vitamin D (25-OH)",
                    value: "22 ng/mL",
                    status: "Borderline",
                    normal_range: "30-100 ng/mL",
                    interpretation: "Vitamin D deficiency detected. Consider supplementation (1000-2000 IU daily) and increased sun exposure."
                },
                {
                    test_name: "TSH (Thyroid)",
                    value: "2.1 mIU/L",
                    status: "Normal",
                    normal_range: "0.4-4.0 mIU/L",
                    interpretation: "Thyroid function is normal. Your metabolism and energy regulation are balanced."
                },
                {
                    test_name: "ALT (Liver Enzyme)",
                    value: "28 U/L",
                    status: "Normal",
                    normal_range: "7-56 U/L",
                    interpretation: "Liver function is healthy. No signs of liver damage or inflammation."
                }
            ],
            recommendations: [
                "🥗 Reduce LDL cholesterol: Focus on soluble fiber (oats, beans, apples), omega-3 fatty acids (salmon, walnuts), and limit saturated fats.",
                "☀️ Vitamin D supplementation: Take 1000-2000 IU daily or spend 15-20 minutes in sunlight. Include vitamin D-rich foods (fatty fish, fortified milk, egg yolks).",
                "🚶 Regular cardiovascular exercise: Aim for 150 minutes per week of moderate activity (brisk walking, cycling) to improve heart health and cholesterol levels.",
                "🧂 Blood pressure management: Limit sodium intake to <2,300mg/day, increase potassium-rich foods (bananas, spinach, sweet potatoes).",
                "💧 Stay hydrated: Drink 8-10 glasses of water daily to support kidney function and overall health.",
                "🩺 Follow-up testing: Recheck lipid panel and vitamin D levels in 3 months after implementing lifestyle changes.",
                "👨‍⚕️ Consult your healthcare provider: Discuss these results with your doctor for personalized medical advice and treatment plan."
            ],
            diet_plan: {
                breakfast: "🥣 Oatmeal (soluble fiber) with berries, chia seeds, and a handful of walnuts. Add a glass of fortified orange juice for vitamin D. (Helps lower LDL cholesterol)",
                lunch: "🥗 Grilled salmon salad (omega-3s) with mixed greens, avocado, cherry tomatoes, and olive oil vinaigrette. Side of quinoa. (Heart-healthy fats and vitamin D)",
                dinner: "🍗 Baked chicken breast with roasted vegetables (broccoli, carrots, bell peppers) and brown rice. Season with herbs instead of salt. (Low sodium, high nutrients)",
                snacks: [
                    "Greek yogurt with berries (vitamin D fortified)",
                    "Apple slices with almond butter (soluble fiber)",
                    "Handful of almonds or walnuts (healthy fats)",
                    "Carrot sticks with hummus (fiber and protein)"
                ],
                avoid: [
                    "Trans fats and fried foods (raise LDL cholesterol)",
                    "Processed meats (high sodium and saturated fat)",
                    "Sugary beverages and excess sweets",
                    "High-sodium packaged foods and fast food",
                    "Excessive red meat (limit to 1-2 times per week)",
                    "Full-fat dairy products (choose low-fat alternatives)"
                ]
            },
            fitness_plan: {
                routine_name: "Cardiovascular Health & Cholesterol Management Program",
                exercises: [
                    {
                        name: "Brisk Walking or Light Jogging",
                        duration: "30 minutes",
                        intensity: "Moderate (able to talk but not sing)",
                        benefit: "Improves cardiovascular health, helps lower LDL cholesterol, and increases HDL cholesterol. Walking is low-impact and suitable for all fitness levels."
                    },
                    {
                        name: "Swimming or Water Aerobics",
                        duration: "30 minutes",
                        intensity: "Moderate",
                        benefit: "Full-body workout that's easy on joints. Excellent for heart health and burning calories without high impact."
                    },
                    {
                        name: "Cycling (Outdoor or Stationary)",
                        duration: "30-45 minutes",
                        intensity: "Moderate to Vigorous",
                        benefit: "Strengthens leg muscles, improves cardiovascular endurance, and helps maintain healthy cholesterol levels."
                    },
                    {
                        name: "Strength Training (Bodyweight or Light Weights)",
                        duration: "20-30 minutes",
                        intensity: "Moderate",
                        benefit: "Builds muscle mass which helps boost metabolism and improve cholesterol metabolism. Include exercises: squats, lunges, push-ups, planks."
                    },
                    {
                        name: "Yoga or Stretching",
                        duration: "15-20 minutes",
                        intensity: "Light",
                        benefit: "Reduces stress (which affects blood pressure), improves flexibility, and promotes relaxation. Practice on rest days."
                    },
                    {
                        name: "Outdoor Sunlight Activity",
                        duration: "15-20 minutes",
                        intensity: "Light",
                        benefit: "Boosts vitamin D levels naturally. Combine with walking or light gardening during morning or late afternoon."
                    }
                ],
                weekly_goal: "Aim for 150 minutes of moderate aerobic activity (5 days x 30 mins) plus 2 days of strength training. Schedule outdoor morning walks 3x/week for vitamin D. Track your progress and gradually increase intensity as fitness improves. Rest at least 1-2 days per week for recovery."
            }
        };
    },

    async analyzeSymptoms(symptoms: string[]): Promise<any> {
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

        // Priority 1: Try Google Gemini Direct API
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Gemini Direct API for symptom analysis...');
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log('✓ Gemini Direct API succeeded for symptoms');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('Gemini Direct symptom analysis failed:', error);
            }
        }

        // Priority 1B: Try Google Gemini Direct API (Key 2) for symptoms
        if (GEMINI_API_KEY_2 && GEMINI_API_KEY_2 !== 'your_api_key_here') {
            try {
                console.log('Trying Gemini Direct API (Key 2) for symptom analysis...');
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY_2}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log('✓ Gemini Direct API (Key 2) succeeded for symptoms');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('Gemini Direct (Key 2) symptom analysis failed:', error);
            }
        }

        // Priority 2: Try Groq
        if (GROQ_API_KEY && GROQ_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Groq API for symptom analysis...');
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: prompt }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text) {
                        console.log('✓ Groq API succeeded for symptoms');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('Groq symptom analysis failed:', error);
            }
        }

        // Priority 3: Try Hugging Face
        if (HUGGINGFACE_API_KEY && HUGGINGFACE_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Hugging Face API for symptom analysis...');
                const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: { max_new_tokens: 500, temperature: 0.7 }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data[0]?.generated_text;
                    if (text) {
                        console.log('✓ Hugging Face API succeeded for symptoms');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('Hugging Face symptom analysis failed:', error);
            }
        }

        // Priority 4: Try OpenRouter with multiple models
        if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_key_here') {
            for (const model of OPENROUTER_MODELS) {
                try {
                    console.log(`Trying OpenRouter with ${model} for symptom analysis...`);
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                            "HTTP-Referer": window.location.origin,
                            "X-Title": "Robtor Health Assistant",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [{ role: "user", content: prompt }]
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const text = data.choices?.[0]?.message?.content;
                        if (text) {
                            console.log(`✓ OpenRouter (${model}) succeeded for symptoms`);
                            return parseAIJSON(text);
                        }
                    }
                } catch (error) {
                    console.warn(`OpenRouter (${model}) symptom analysis failed:`, error);
                }
            }
        }

        // Priority 5: Try OpenAI
        if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying OpenAI API for symptom analysis...');
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${OPENAI_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [{ role: "user", content: prompt }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text) {
                        console.log('✓ OpenAI API succeeded for symptoms');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('OpenAI symptom analysis failed:', error);
            }
        }

        // Fallback: Return error structure
        console.error('All AI services failed for symptom analysis');
        throw new Error("Unable to analyze symptoms. All AI services are currently unavailable. Please try again later or consult a healthcare professional.");
    },

    async analyzeHealthRisks(healthData: {
        reportData?: any;
        metricsData?: any;
        weeklyMetrics?: any[];
    }): Promise<any> {
        const { reportData, metricsData, weeklyMetrics } = healthData;
        
        // Build context from available data
        let context = 'Analyze the following health data and provide detailed risk predictions:\n\n';
        
        if (reportData) {
            context += `Recent Medical Report:\n`;
            context += `- Health Score: ${reportData.health_score}/100\n`;
            context += `- Summary: ${reportData.summary}\n`;
            if (reportData.results && reportData.results.length > 0) {
                context += `- Test Results:\n`;
                reportData.results.forEach((r: any) => {
                    context += `  * ${r.test_name}: ${r.value} (${r.status}) - ${r.normal_range}\n`;
                });
            }
        }
        
        if (metricsData) {
            context += `\nToday's Metrics:\n`;
            context += `- Steps: ${metricsData.steps || 'N/A'}\n`;
            context += `- Heart Rate: ${metricsData.heart_rate || 'N/A'} bpm\n`;
            context += `- Sleep: ${metricsData.sleep_hours || 'N/A'} hours\n`;
            context += `- Blood Oxygen: ${metricsData.blood_oxygen || 'N/A'}%\n`;
        }
        
        if (weeklyMetrics && weeklyMetrics.length > 0) {
            context += `\nWeekly Activity Trends:\n`;
            const avgSteps = Math.round(weeklyMetrics.reduce((sum, m) => sum + (m.steps || 0), 0) / weeklyMetrics.length);
            const avgSleep = (weeklyMetrics.reduce((sum, m) => sum + (m.sleep_hours || 0), 0) / weeklyMetrics.length).toFixed(1);
            context += `- Average Steps: ${avgSteps}/day\n`;
            context += `- Average Sleep: ${avgSleep} hours/day\n`;
        }

        const prompt = `${context}

Based on this health data, provide a comprehensive risk analysis in valid JSON format ONLY:
{
    "overall_risk": "<Low|Medium|High>",
    "confidence": <number 0-100>,
    "risk_areas": [
        {
            "category": "<Cardiovascular|Sleep Quality|Activity Level|Metabolic Health|etc>",
            "risk_level": "<Low|Medium|High>",
            "current_status": "<detailed description of current health in this area>",
            "prediction": "<what might happen if trends continue>",
            "recommendations": "<specific actionable advice>",
            "icon_suggestion": "<Heart|Moon|Activity|Droplet|etc>"
        }
    ],
    "action_plan": {
        "week_1_2": "<goals for weeks 1-2>",
        "week_2_3": "<goals for weeks 2-3>",
        "week_3_4": "<goals for weeks 3-4>",
        "ongoing": "<long-term recommendations>"
    },
    "positive_trends": ["<positive finding 1>", "<positive finding 2>"],
    "areas_for_improvement": ["<area 1>", "<area 2>"]
}

Analyze all available data comprehensively. If data is limited, mention that in predictions. Be specific and actionable.`;

        // Priority 1: Try Google Gemini Direct API
        if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Gemini Direct API for risk analysis...');
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: prompt }]
                        }]
                    })
                });
                
                if (response.ok) {
                    const data = await response.json();
                    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (text) {
                        console.log('✓ Gemini Direct API succeeded for risk analysis');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('Gemini Direct risk analysis failed:', error);
            }
        }

        // Priority 2: Try Groq
        if (GROQ_API_KEY && GROQ_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Groq API for risk analysis...');
                const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${GROQ_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: prompt }]
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data.choices?.[0]?.message?.content;
                    if (text) {
                        console.log('✓ Groq API succeeded for risk analysis');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('Groq risk analysis failed:', error);
            }
        }

        // Priority 3: Try Hugging Face
        if (HUGGINGFACE_API_KEY && HUGGINGFACE_API_KEY !== 'your_api_key_here') {
            try {
                console.log('Trying Hugging Face API for risk analysis...');
                const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        inputs: prompt,
                        parameters: { max_new_tokens: 800, temperature: 0.7 }
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    const text = data[0]?.generated_text;
                    if (text) {
                        console.log('✓ Hugging Face API succeeded for risk analysis');
                        return parseAIJSON(text);
                    }
                }
            } catch (error) {
                console.warn('Hugging Face risk analysis failed:', error);
            }
        }

        // Priority 4: Try OpenRouter with multiple models
        if (OPENROUTER_API_KEY && OPENROUTER_API_KEY !== 'your_openrouter_key_here') {
            for (const model of OPENROUTER_MODELS) {
                try {
                    console.log(`Trying OpenRouter with ${model} for risk analysis...`);
                    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                            "HTTP-Referer": window.location.origin,
                            "X-Title": "Robtor Health Assistant",
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            model: model,
                            messages: [{ role: "user", content: prompt }]
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        const text = data.choices?.[0]?.message?.content;
                        if (text) {
                            console.log(`✓ OpenRouter (${model}) succeeded for risk analysis`);
                            return parseAIJSON(text);
                        }
                    }
                } catch (error) {
                    console.warn(`OpenRouter (${model}) risk analysis failed:`, error);
                }
            }
        }

        // Fallback: Return basic analysis
        console.error('All AI services failed for risk analysis');
        return {
            overall_risk: "Medium",
            confidence: 50,
            risk_areas: [
                {
                    category: "General Health",
                    risk_level: "Medium",
                    current_status: "Unable to analyze detailed health data at this time due to service unavailability.",
                    prediction: "Continue monitoring your health metrics regularly.",
                    recommendations: "Maintain a balanced diet, regular exercise, and adequate sleep. Consult healthcare professionals for personalized advice.",
                    icon_suggestion: "Activity"
                }
            ],
            action_plan: {
                week_1_2: "Focus on consistent health tracking",
                week_2_3: "Establish healthy routines",
                week_3_4: "Review progress and adjust goals",
                ongoing: "Continue monitoring and maintaining healthy habits"
            },
            positive_trends: ["You're tracking your health data"],
            areas_for_improvement: ["Try again later for detailed AI analysis"]
        };
    }
};
