# Omniferra

Omniferra is a versatile, AI-powered application built with Next.js that allows you to generate text and audio content, fetch images from Unsplash, and get live cricket score updates. It's a demonstration of integrating various AI and data services into a modern web application.

## ✨ Features

- **Text Generation**: Create high-quality text for various purposes using powerful language models.
- **Image Generation**: Fetch stunning visuals and images from text prompts, powered by the Unsplash API.
- **Audio Generation**: Convert text into natural-sounding speech.
- **Live Cricket Scores**: Get real-time updates from the world of cricket, right within the app.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/)
- **AI/ML**: [Google's Gemini models via Genkit](https://firebase.google.com/docs/genkit)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Image API**: [Unsplash](https://unsplash.com/developers)
- **Cricket Data**: [CricketData.org](https://cricketdata.org/)

## 🚀 Getting Started

To get the application running locally, you'll need to set up your environment variables.

1.  **Clone the repository.**

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Environment Variables**:
    Create a `.env` file in the root of the project and add your API keys. You can obtain them from the respective services.
    ```env
    # For Google AI (Gemini)
    GEMINI_API_KEY="YOUR_GEMINI_API_KEY"

    # For Unsplash Image API
    UNSPLASH_ACCESS_KEY="YOUR_UNSPLASH_ACCESS_KEY"

    # For Cricket Data API
    CRICKET_DATA_API_KEY="YOUR_CRICKET_DATA_API_KEY"
    ```

4.  **Run the Development Server**:
    ```bash
    npm run dev
    ```

    Open [http://localhost:9002](http://localhost:9002) with your browser to see the result.

## 📝 Notes

- The Genkit development server can be run alongside the Next.js dev server for debugging AI flows: `npm run genkit:dev`.
- The application is configured to use free-tier services, but be mindful of rate limits.
