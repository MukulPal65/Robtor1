// --- Adapter Interfaces ---

interface RequestOptions {
    url: string;
    method: string;
    headers: Record<string, string>;
    body: string;
}

interface AIProvider {
    name: string;
    apiKey: string;
    model: string;
    supportsVision: boolean;
    // Adapter function converts standard inputs to provider-specific request
    createChatRequest: (apiKey: string, model: string, userMessage: string) => RequestOptions;
    createImageRequest: (apiKey: string, model: string, prompt: string, base64Image: string, mimeType: string) => RequestOptions;
    // Adapter function to extract text from provider-specific response
    extractContent: (response: any) => string;
}

// --- Adapters ---

// 1. OpenAI Compatible Adapter (Works for OpenAI, Groq, OpenRouter, HuggingFace)
const OpenAIAdapter = {
    createChatRequest: (apiKey: string, model: string, userMessage: string, baseUrl: string, headers: Record<string, string> = {}): RequestOptions => ({
        url: baseUrl,
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            ...headers
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: userMessage }]
        })
    }),
    createImageRequest: (apiKey: string, model: string, prompt: string, base64Image: string, mimeType: string, baseUrl: string, headers: Record<string, string> = {}): RequestOptions => ({
        url: baseUrl,
        method: "POST",
        headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            ...headers
        },
        body: JSON.stringify({
            model: model,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
                    ]
                }
            ]
        })
    }),
    extractContent: (data: any) => {
        if (data.error) throw new Error(data.error.message || "API Error");
        return data.choices?.[0]?.message?.content || "";
    }
};

// 2. Google Gemini Direct Adapter
const GoogleAdapter = {
    createChatRequest: (apiKey: string, model: string, userMessage: string): RequestOptions => ({
        url: `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: userMessage }] }]
        })
    }),
    createImageRequest: (apiKey: string, model: string, prompt: string, base64Image: string, mimeType: string): RequestOptions => ({
        url: `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent?key=${apiKey}`,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{
                parts: [
                    { text: prompt },
                    { inline_data: { mime_type: mimeType, data: base64Image } }
                ]
            }]
        })
    }),
    extractContent: (data: any) => {
        if (data.error) throw new Error(data.error.message || "Google API Error");
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    }
};

// --- Provider Configuration ---

const PROVIDERS: AIProvider[] = [
    // 1. Groq (Fastest)
    {
        name: "Groq",
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        model: import.meta.env.VITE_GROQ_MODEL || "llama-3.3-70b-versatile",
        supportsVision: false,
        createChatRequest: (k, m, u) => OpenAIAdapter.createChatRequest(k, m, u, "https://api.groq.com/openai/v1/chat/completions"),
        createImageRequest: (k, m, p, i, t) => OpenAIAdapter.createImageRequest(k, m, p, i, t, "https://api.groq.com/openai/v1/chat/completions"),
        extractContent: OpenAIAdapter.extractContent
    },
    // 2. Google Gemini Direct
    {
        name: "Google Gemini",
        apiKey: import.meta.env.VITE_GOOGLE_GEMINI_API_KEY,
        model: import.meta.env.VITE_GOOGLE_GEMINI_MODEL || "models/gemini-1.5-flash",
        supportsVision: true,
        createChatRequest: GoogleAdapter.createChatRequest,
        createImageRequest: GoogleAdapter.createImageRequest,
        extractContent: GoogleAdapter.extractContent
    },
    // 3. OpenAI (Reliable)
    {
        name: "OpenAI",
        apiKey: import.meta.env.VITE_OPENAI_API_KEY,
        model: import.meta.env.VITE_OPENAI_MODEL || "gpt-4o-mini",
        supportsVision: true,
        createChatRequest: (k, m, u) => OpenAIAdapter.createChatRequest(k, m, u, "https://api.openai.com/v1/chat/completions"),
        createImageRequest: (k, m, p, i, t) => OpenAIAdapter.createImageRequest(k, m, p, i, t, "https://api.openai.com/v1/chat/completions"),
        extractContent: OpenAIAdapter.extractContent
    },
    // 4. Hugging Face
    {
        name: "Hugging Face",
        apiKey: import.meta.env.VITE_HUGGINGFACE_API_KEY,
        model: import.meta.env.VITE_HUGGINGFACE_MODEL || "mistralai/Mixtral-8x7B-Instruct-v0.1",
        supportsVision: false,
        createChatRequest: (k, m, u) => OpenAIAdapter.createChatRequest(
            k, m, u,
            `https://api-inference.huggingface.co/models/${import.meta.env.VITE_HUGGINGFACE_MODEL || "mistralai/Mixtral-8x7B-Instruct-v0.1"}/v1/chat/completions`
        ),
        createImageRequest: (k, m, p, i, t) => OpenAIAdapter.createImageRequest(
            k, m, p, i, t,
            `https://api-inference.huggingface.co/models/${import.meta.env.VITE_HUGGINGFACE_MODEL || "mistralai/Mixtral-8x7B-Instruct-v0.1"}/v1/chat/completions`
        ),
        extractContent: OpenAIAdapter.extractContent
    },
    // 5. OpenRouter (Fallback)
    {
        name: "OpenRouter",
        apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
        model: import.meta.env.VITE_OPENROUTER_MODEL || "google/gemini-2.0-flash-exp:free",
        supportsVision: true,
        createChatRequest: (k, m, u) => OpenAIAdapter.createChatRequest(k, m, u, "https://openrouter.ai/api/v1/chat/completions", {
            "HTTP-Referer": window.location.origin,
            "X-Title": "Robtor Health"
        }),
        createImageRequest: (k, m, p, i, t) => OpenAIAdapter.createImageRequest(k, m, p, i, t, "https://openrouter.ai/api/v1/chat/completions", {
            "HTTP-Referer": window.location.origin,
            "X-Title": "Robtor Health"
        }),
        extractContent: OpenAIAdapter.extractContent
    }
];

// --- Helpers & Logic ---

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

// Generic execution wrapper with fallback
async function executeWithFallback(
    operationName: string,
    executeOperation: (provider: AIProvider) => Promise<any>,
    requiresVision: boolean = false
): Promise<any> {
    let attempts = 0;
    const errors: string[] = [];

    for (const provider of PROVIDERS) {
        // Skip if vision is required but provider doesn't support it
        if (requiresVision && !provider.supportsVision) {
            console.log(`[AIService] Skipping ${provider.name} - Vision not supported.`);
            continue;
        }

        // Skip if API key is missing or placeholder
        if (!provider.apiKey || provider.apiKey.includes('your_') || provider.apiKey.length < 5) {
            console.warn(`[AIService] Skipping ${provider.name} - No valid API key found.`);
            continue;
        }

        attempts++;
        try {
            console.log(`[AIService] Attempting ${operationName} with ${provider.name} (${provider.model})...`);
            const result = await executeOperation(provider);
            console.log(`[AIService] Success with ${provider.name}`);
            return result;
        } catch (error: any) {
            const errorMsg = error.message || error.toString();
            console.error(`[AIService] Error with ${provider.name}:`, errorMsg);

            // Special handling for common errors
            if (errorMsg.includes("403")) {
                errors.push(`${provider.name}: Permission denied (403)`);
            } else if (errorMsg.includes("401")) {
                errors.push(`${provider.name}: Invalid API Key (401)`);
            } else if (errorMsg.includes("429")) {
                errors.push(`${provider.name}: Rate limit exceeded (429)`);
            } else {
                errors.push(`${provider.name}: ${errorMsg}`);
            }

            // Continue to next provider
        }
    }

    if (attempts === 0) {
        throw new Error(`No ${requiresVision ? 'Vision-capable ' : ''}AI providers configured. Check your API keys in .env`);
    }

    const finalErrorMessage = errors.length > 0 ? errors.join(" | ") : "All AI providers failed.";
    const compositeError = new Error(finalErrorMessage);
    compositeError.name = "AIServiceError";
    throw compositeError;
}

export const GeminiService = {
    async generateResponse(userMessage: string): Promise<string> {
        return executeWithFallback("Chat Generation", async (provider) => {
            const req = provider.createChatRequest(provider.apiKey, provider.model, userMessage);
            const response = await fetch(req.url, {
                method: req.method,
                headers: req.headers,
                body: req.body
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return provider.extractContent(data);
        }, false);
    },

    async analyzeImage(file: File): Promise<any> {
        const base64Image = await fileToBase64(file);
        // Note: Google requires proper MIME type, we'll extract it or default to jpeg
        const mimeType = file.type || 'image/jpeg';

        const prompt = `
            You are an expert medical AI assistant. Analyze this medical report image.
            
            PART 1 - ANALYSIS:
            1. Identify the key health parameters and their values.
            2. Determine if each value is Normal, Low, or High.
            3. Provide a brief interpretation of the findings.

            PART 2 - RECOMMENDATIONS:
            Based on the analysis, provide personalized recommendations for:
            1. Diet (Meals + Tips)
            2. Lifestyle changes
            3. Exercise & Fitness
            4. Yoga & Mindfulness
            5. Things to avoid
            6. Key Benefits of following this advice

            You MUST return the result in the following JSON format ONLY (no markdown, just raw JSON):
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
                    "<specific actionable recommendation 3>",
                    "<specific actionable recommendation 4>",
                    "<specific actionable recommendation 5>"
                ],
                "lifestyle_tips": [
                    "<lifestyle tip 1>",
                    "<lifestyle tip 2>",
                    "<lifestyle tip 3>",
                    "<lifestyle tip 4>",
                    "<lifestyle tip 5>"
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
                },
                "yoga_tips": [
                    "<yoga/mindfulness practice 1>",
                    "<yoga/mindfulness practice 2>",
                    "<yoga/mindfulness practice 3>",
                    "<yoga/mindfulness practice 4>",
                    "<yoga/mindfulness practice 5>"
                ],
                "benefits": [
                    "<benefit of following advice 1>",
                    "<benefit of following advice 2>",
                    "<benefit of following advice 3>",
                    "<benefit of following advice 4>",
                    "<benefit of following advice 5>"
                ]
            }

            If the image is not a medical report, return a JSON with health_score: 0 and summary: "This does not appear to be a valid medical report." and empty arrays/objects for other fields.
            `;

        return executeWithFallback("Image Analysis", async (provider) => {
            const req = provider.createImageRequest(provider.apiKey, provider.model, prompt, base64Image, mimeType);
            const response = await fetch(req.url, {
                method: req.method,
                headers: req.headers,
                body: req.body
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const text = provider.extractContent(data);
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                return JSON.parse(cleanText);
            } catch (parseError) {
                console.error("[AIService] JSON Parse Error. Raw text:", text);
                throw new Error("Failed to parse AI response as JSON");
            }
        }, true);
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

        return executeWithFallback("Symptom Analysis", async (provider) => {
            const req = provider.createChatRequest(provider.apiKey, provider.model, prompt);
            const response = await fetch(req.url, {
                method: req.method,
                headers: req.headers,
                body: req.body
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            const text = provider.extractContent(data);
            const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                return JSON.parse(cleanText);
            } catch (parseError) {
                console.error("[AIService] JSON Parse Error. Raw text:", text);
                throw new Error("Failed to parse AI response as JSON");
            }
        }, false);
    }
};
