# Eva

Eva is an LLM-powered tool for code, image, and audio generation; debugging; and professional & academic research. It includes features to "humanize" generated outputs for more natural, readable results and supports workflows for prototyping, content creation, and research assistance.

Features

- LLM Assistant: Generate, edit, and summarize text with contextual prompts. Useful for drafting emails, reports, literature reviews, and creating human-readable explanations of technical content.

- Code Generation & Debugging: Produce code snippets, refactor, and get inline debugging suggestions for multiple languages and frameworks. Includes test and repro-case generation to help isolate bugs faster.

- Image Generation: Create images from text prompts using configurable models and presets. Includes prompt-enhancement tools, style controls, and image placeholder utilities for UI prototyping.

- Audio Generation & Speech: Generate audio from text (TTS) and transcribe speech to text (STT). Support for multiple voices, formats, and short audio-synthesis workflows for demos or accessibility features.

- Humanizer Mode: Post-processes model outputs to improve fluency, tone, and readability while preserving factual content. Useful for turning terse model answers into natural-sounding copy for end users.

- Research & Summarization: Produce concise summaries, annotated notes, and citation-aware outputs to support academic or professional research workflows. Includes configurable summarization length and highlight extraction.

- Utility Flows & Assistants: Built-in flows for prompt enhancement, smart-search assistant, domain-specific helpers (e.g., cricket updates), and code/image/audio pipelines that you can remix for custom tasks.

- Extensibility & Integration: Modular `src/ai/flows` make it straightforward to add new flows, swap models, or integrate external APIs. Configuration is managed via environment variables and helper utilities in `src/lib`.

- Privacy & Safety: Designed to let teams control data flow — avoid sending sensitive data to remote APIs unless configured. Add policy or moderation layers as needed for production.

Examples & Tips
- Prompt enhancement: Use the prompt enhancer flow to get better image or code outputs from shorter drafts.
- Repro steps for debugging: Provide a minimal failing example to the Code Assistant to get targeted fixes and tests.
- Humanizer usage: Toggle humanizer when you need friendly, consumer-facing copy versus terse, technical output.


Quick start
1. Install dependencies: `npm install` or `pnpm install`
2. Run the development server: `npm run dev`
3. Open http://localhost:3000 and try the generators in the UI

Contributing
- See the source in `src/` for flows, UI components, and helper libraries.
- Open issues or PRs for bugs, feature requests, or documentation improvements.

License
This project is provided as-is. See the repository for license details.