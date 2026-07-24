# Eva AI Project Documentation

Eva AI is a versatile, AI-powered application built with Next.js that demonstrates the integration of various AI and data services.

## AI Models & Services

### 1. Advanced Text Generation
Generate high-quality text content based on user prompts with specialized modes.
- **Location:** `src/ai/flows/text-generation-from-prompt.ts`
- **Model:** `googleai/gemini-1.5-flash`
- **Modes:**
  - **General:** Standard versatile assistant.
  - **Humanizer:** Rewrites text to sound natural and remove AI patterns.
  - **Academic Helper:** Scholarly tone for school work and research.
  - **Professional Research:** Concise, business-oriented output.

### 2. Image Search
Fetch high-quality images from Unsplash based on user keywords.
- **Location:** `src/ai/flows/image-generation-from-prompt.ts`
- **Provider:** Unsplash API (requires `UNSPLASH_ACCESS_KEY`)

### 3. Audio Generation (TTS)
Convert text into realistic speech using Gemini's specialized TTS capabilities.
- **Location:** `src/ai/flows/audio-generation-from-text.ts`
- **Model:** `googleai/gemini-2.5-flash-preview-tts`

### 4. Live Speech-to-Text
Real-time transcription of voice input using Gemini's multimodal capabilities.
- **Location:** `src/ai/flows/speech-to-text.ts`
- **Model:** `googleai/gemini-1.5-flash`
- **Frontend:** `src/components/voice-recorder.tsx`

### 5. Smart Research Assistant
A complex agent that researches topics via tool-calling and responds in both text and audio.
- **Location:** `src/ai/flows/smart-search-assistant.ts`
- **Models:** `googleai/gemini-1.5-flash` (Reasoning) & `googleai/gemini-2.5-flash-preview-tts` (Audio Output)

### 6. Prompt Generator (Enhancer)
Takes basic user input and transforms it into highly detailed, professional-grade AI prompts.
- **Location:** `src/ai/flows/enhance-prompt.ts`
- **Model:** `googleai/gemini-1.5-flash`

### 7. Cricket Score Updates
Live cricket match updates fetched from `cricketdata.org`.
- **Location:** `src/ai/flows/get-cricket-updates.ts`
- **Provider:** CricketData API (requires `CRICKET_DATA_API_KEY`)

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **AI Framework:** Genkit
- **UI Components:** ShadCN UI (Radix UI)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Environment Variables
The following environment variables are required:
- `GEMINI_API_KEY`: For Google AI services.
- `UNSPLASH_ACCESS_KEY`: For image searching.
- `CRICKET_DATA_API_KEY`: For live cricket scores.
