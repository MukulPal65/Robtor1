/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_GROQ_API_KEY: string
    readonly VITE_GROQ_MODEL: string
    readonly VITE_OPENAI_API_KEY: string
    readonly VITE_OPENAI_MODEL: string
    readonly VITE_HUGGINGFACE_API_KEY: string
    readonly VITE_HUGGINGFACE_MODEL: string
    readonly VITE_OPENROUTER_API_KEY: string
    readonly VITE_OPENROUTER_MODEL: string
    readonly VITE_GOOGLE_GEMINI_API_KEY: string
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}
