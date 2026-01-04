# **App Name**: OmniFreeGen

## Core Features:

- Text Generation: Generate text-based content using Gemini Flash, adhering to free usage limits. The LLM has a tool to decide whether a user request is likely to exceed the limit. This tool prevents such requests from proceeding.
- Image Generation: Create images based on textual prompts using Imagen, making sure that it respects the limitations of the free tier. The LLM has a tool to decide whether a user request is likely to exceed the limit. This tool prevents such requests from proceeding.
- Audio Generation: Produce audio clips from text prompts using Gemini Flash, designed to stay within the boundaries of the free tier. The LLM has a tool to decide whether a user request is likely to exceed the limit. This tool prevents such requests from proceeding.
- Request Counter: Track the number of requests made by the user and stop when the maximum (20) is reached.
- Output Display: Clearly present the generated content (text, image, audio) to the user.

## Style Guidelines:

- Primary color: A vibrant blue (#29ABE2), reflecting intelligence and trustworthiness, ideal for a modern AI application.
- Background color: A light, desaturated blue (#E5F5F9), creating a calm and clean interface.
- Accent color: A bright purple (#A259FF), used for interactive elements and calls to action to draw the user's eye.
- Body and headline font: 'Inter', a grotesque-style sans-serif, for a clean and modern user interface.
- Use minimalist icons that clearly represent different content generation options (text, image, audio).
- A clean, intuitive layout, using a card-based design to present different generated content types.
- Subtle animations when content is generated, giving positive feedback to the user and bringing life to the UI.