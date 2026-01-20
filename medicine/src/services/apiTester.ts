// API Testing Service - Check if all APIs are working
const GEMINI_API_KEY = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY;
const GEMINI_API_KEY_2 = import.meta.env.VITE_GOOGLE_GEMINI_API_KEY1;
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const HUGGINGFACE_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

interface APITestResult {
    name: string;
    status: 'success' | 'failed' | 'not_configured';
    responseTime: number;
    error?: string;
    response?: any;
}

export const APITester = {
    async testAllAPIs(): Promise<APITestResult[]> {
        console.log('🔍 Starting API Tests...\n');
        
        const results: APITestResult[] = [];
        
        // Test Gemini Direct (Key 1)
        results.push(await this.testGeminiDirect());
        
        // Test Gemini Direct (Key 2)
        if (GEMINI_API_KEY_2 && GEMINI_API_KEY_2 !== 'your_api_key_here') {
            results.push(await this.testGeminiDirect2());
        }
        
        // Test Groq
        results.push(await this.testGroq());
        
        // Test Hugging Face
        results.push(await this.testHuggingFace());
        
        // Test OpenRouter
        results.push(await this.testOpenRouter());
        
        // Test OpenAI
        results.push(await this.testOpenAI());
        
        // Print summary
        this.printSummary(results);
        
        return results;
    },

    async testGeminiDirect(): Promise<APITestResult> {
        const name = 'Google Gemini Direct';
        console.log(`\n🧪 Testing ${name}...`);
        
        if (!GEMINI_API_KEY || GEMINI_API_KEY === 'your_api_key_here') {
            console.log('❌ Not configured');
            return { name, status: 'not_configured', responseTime: 0, error: 'API key not set' };
        }

        const startTime = Date.now();
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: "Say 'Hello' in one word" }]
                    }]
                })
            });
            
            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                console.log('✅ Success!');
                console.log(`Response: ${data.candidates[0].content.parts[0].text}`);
                console.log(`Time: ${responseTime}ms`);
                return { name, status: 'success', responseTime, response: data };
            } else {
                console.log('❌ Failed');
                console.log(`Status: ${response.status}`);
                console.log(`Error:`, data);
                return { name, status: 'failed', responseTime, error: JSON.stringify(data) };
            }
        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            console.log('❌ Failed');
            console.log(`Error: ${error.message}`);
            return { name, status: 'failed', responseTime, error: error.message };
        }
    },

    async testGeminiDirect2(): Promise<APITestResult> {
        const name = 'Google Gemini Direct (Key 2)';
        console.log(`\n🧪 Testing ${name}...`);
        
        if (!GEMINI_API_KEY_2 || GEMINI_API_KEY_2 === 'your_api_key_here') {
            console.log('❌ Not configured');
            return { name, status: 'not_configured', responseTime: 0, error: 'API key not set' };
        }

        const startTime = Date.now();
        try {
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY_2}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: "Say 'Hello' in one word" }]
                    }]
                })
            });
            
            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                console.log('✅ Success!');
                console.log(`Response: ${data.candidates[0].content.parts[0].text}`);
                console.log(`Time: ${responseTime}ms`);
                return { name, status: 'success', responseTime, response: data };
            } else {
                console.log('❌ Failed');
                console.log(`Status: ${response.status}`);
                console.log(`Error:`, data);
                return { name, status: 'failed', responseTime, error: JSON.stringify(data) };
            }
        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            console.log('❌ Failed');
            console.log(`Error: ${error.message}`);
            return { name, status: 'failed', responseTime, error: error.message };
        }
    },

    async testGroq(): Promise<APITestResult> {
        const name = 'Groq';
        console.log(`\n🧪 Testing ${name}...`);
        
        if (!GROQ_API_KEY || GROQ_API_KEY === 'your_api_key_here') {
            console.log('❌ Not configured');
            return { name, status: 'not_configured', responseTime: 0, error: 'API key not set' };
        }

        const startTime = Date.now();
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: [{ role: "user", content: "Say 'Hello' in one word" }]
                })
            });

            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            if (response.ok && data.choices?.[0]?.message?.content) {
                console.log('✅ Success!');
                console.log(`Response: ${data.choices[0].message.content}`);
                console.log(`Time: ${responseTime}ms`);
                return { name, status: 'success', responseTime, response: data };
            } else {
                console.log('❌ Failed');
                console.log(`Status: ${response.status}`);
                console.log(`Error:`, data);
                return { name, status: 'failed', responseTime, error: JSON.stringify(data) };
            }
        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            console.log('❌ Failed');
            console.log(`Error: ${error.message}`);
            return { name, status: 'failed', responseTime, error: error.message };
        }
    },

    async testHuggingFace(): Promise<APITestResult> {
        const name = 'Hugging Face';
        console.log(`\n🧪 Testing ${name}...`);
        
        if (!HUGGINGFACE_API_KEY || HUGGINGFACE_API_KEY === 'your_api_key_here') {
            console.log('❌ Not configured');
            return { name, status: 'not_configured', responseTime: 0, error: 'API key not set' };
        }

        const startTime = Date.now();
        try {
            const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    inputs: "Say 'Hello' in one word",
                    parameters: { max_new_tokens: 10, temperature: 0.7 }
                })
            });

            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            if (response.ok && data[0]?.generated_text) {
                console.log('✅ Success!');
                console.log(`Response: ${data[0].generated_text}`);
                console.log(`Time: ${responseTime}ms`);
                return { name, status: 'success', responseTime, response: data };
            } else {
                console.log('❌ Failed');
                console.log(`Status: ${response.status}`);
                console.log(`Error:`, data);
                return { name, status: 'failed', responseTime, error: JSON.stringify(data) };
            }
        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            console.log('❌ Failed');
            console.log(`Error: ${error.message}`);
            return { name, status: 'failed', responseTime, error: error.message };
        }
    },

    async testOpenRouter(): Promise<APITestResult> {
        const name = 'OpenRouter';
        console.log(`\n🧪 Testing ${name}...`);
        
        if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'your_openrouter_key_here') {
            console.log('❌ Not configured');
            return { name, status: 'not_configured', responseTime: 0, error: 'API key not set' };
        }

        const startTime = Date.now();
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
                    model: "google/gemini-flash-1.5:free",
                    messages: [{ role: "user", content: "Say 'Hello' in one word" }]
                })
            });

            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            if (response.ok && data.choices?.[0]?.message?.content) {
                console.log('✅ Success!');
                console.log(`Response: ${data.choices[0].message.content}`);
                console.log(`Time: ${responseTime}ms`);
                return { name, status: 'success', responseTime, response: data };
            } else {
                console.log('❌ Failed');
                console.log(`Status: ${response.status}`);
                console.log(`Error:`, data);
                return { name, status: 'failed', responseTime, error: JSON.stringify(data) };
            }
        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            console.log('❌ Failed');
            console.log(`Error: ${error.message}`);
            return { name, status: 'failed', responseTime, error: error.message };
        }
    },

    async testOpenAI(): Promise<APITestResult> {
        const name = 'OpenAI';
        console.log(`\n🧪 Testing ${name}...`);
        
        if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_api_key_here') {
            console.log('❌ Not configured');
            return { name, status: 'not_configured', responseTime: 0, error: 'API key not set' };
        }

        const startTime = Date.now();
        try {
            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENAI_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: "Say 'Hello' in one word" }]
                })
            });

            const responseTime = Date.now() - startTime;
            const data = await response.json();
            
            if (response.ok && data.choices?.[0]?.message?.content) {
                console.log('✅ Success!');
                console.log(`Response: ${data.choices[0].message.content}`);
                console.log(`Time: ${responseTime}ms`);
                return { name, status: 'success', responseTime, response: data };
            } else {
                console.log('❌ Failed');
                console.log(`Status: ${response.status}`);
                console.log(`Error:`, data);
                return { name, status: 'failed', responseTime, error: JSON.stringify(data) };
            }
        } catch (error: any) {
            const responseTime = Date.now() - startTime;
            console.log('❌ Failed');
            console.log(`Error: ${error.message}`);
            return { name, status: 'failed', responseTime, error: error.message };
        }
    },

    printSummary(results: APITestResult[]) {
        console.log('\n\n═══════════════════════════════════════');
        console.log('📊 API TEST SUMMARY');
        console.log('═══════════════════════════════════════\n');
        
        const working = results.filter(r => r.status === 'success');
        const failed = results.filter(r => r.status === 'failed');
        const notConfigured = results.filter(r => r.status === 'not_configured');
        
        console.log(`✅ Working: ${working.length}`);
        working.forEach(r => {
            console.log(`   • ${r.name} (${r.responseTime}ms)`);
        });
        
        if (failed.length > 0) {
            console.log(`\n❌ Failed: ${failed.length}`);
            failed.forEach(r => {
                console.log(`   • ${r.name}`);
                console.log(`     Error: ${r.error?.substring(0, 100)}...`);
            });
        }
        
        if (notConfigured.length > 0) {
            console.log(`\n⚠️ Not Configured: ${notConfigured.length}`);
            notConfigured.forEach(r => {
                console.log(`   • ${r.name}`);
            });
        }
        
        console.log('\n═══════════════════════════════════════\n');
        
        if (working.length === 0) {
            console.log('🚨 WARNING: No APIs are working! Check your API keys and internet connection.');
        } else if (working.length < 3) {
            console.log('⚠️ Only a few APIs are working. Consider checking failed ones for better reliability.');
        } else {
            console.log('✨ Good! Multiple APIs are working. Your app has good fallback coverage.');
        }
    }
};

// Export function to run in browser console
(window as any).testAPIs = () => APITester.testAllAPIs();

console.log('\n💡 To test all APIs, run: testAPIs()');
