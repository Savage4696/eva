# Omniferra Project Documentation

Omniferra is a versatile, AI-powered application built with Next.js that demonstrates the integration of various AI and data services.

## Features

### 1. Text Generation
Generate high-quality text content based on user prompts using the Gemini 1.5 Flash model.
- **Location:** `src/ai/flows/text-generation-from-prompt.ts`
- **Model:** `googleai/gemini-1.5-flash`

### 2. Image Search (Unsplash)
Fetch high-quality images from the Unsplash API based on user keywords.
- **Location:** `src/ai/flows/image-generation-from-prompt.ts`
- **Provider:** Unsplash API

### 3. Audio Generation (TTS)
Convert text into realistic speech using Gemini's Text-to-Speech capabilities.
- **Location:** `src/ai/flows/audio-generation-from-text.ts`
- **Model:** `googleai/gemini-2.5-flash-preview-tts`

### 4. Live Speech-to-Text
Real-time transcription of voice input using Gemini's multimodal capabilities.
- **Location:** `src/ai/flows/speech-to-text.ts`
- **Model:** `googleai/gemini-1.5-flash`
- **Frontend:** `src/components/voice-recorder.tsx`

### 5. Cricket Score Updates
Live cricket match updates fetched from `cricketdata.org`.
- **Location:** `src/ai/flows/get-cricket-updates.ts`
- **Provider:** CricketData API

## Tech Stack
- **Framework:** Next.js (App Router)
- **AI Framework:** Genkit
- **UI Components:** ShadCN UI (Radix UI)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React

## Environment Variables
The following environment variables are required:
- `GEMINI_API_KEY`: For Google AI services.
- `UNSPLASH_ACCESS_KEY`: For image searching.
- `CRICKET_DATA_API_KEY`: For live cricket scores.
