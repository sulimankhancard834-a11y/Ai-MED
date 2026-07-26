# AI MED Tutor

AI MED Tutor is a comprehensive, live medical education application designed specifically for medical students at the KMU Institute of Health Sciences Swabi. It features a modern, medical-grade "Frosted Glass" interface and leverages the Gemini API to provide interactive tutoring.

## Features

- **Two Distinct AI Modes:**
  - **General Assistant Mode:** Provides broad clinical, physiological, anatomical, and pharmacological medical education guidance.
  - **Echo Specific Mode:** Focuses strictly on echocardiography interpretation, standard views (PLAX, PSAX, Apical 4-Chamber, etc.), cardiovascular clinical case studies, and related hemodynamics.
- **Modern UI:** Built with React and Tailwind CSS, featuring a sleek, frosted glass design.
- **Markdown Support:** Renders rich text, lists, and tables correctly using `react-markdown` and `remark-gfm`.
- **Vercel Ready:** Includes an `/api/chat.ts` endpoint configured for Vercel serverless deployments, alongside an Express server (`server.ts`) for local development and alternative hosting platforms.

## Prerequisites

- Node.js (v18+)
- A Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

## Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Configure your environment variables. Create a `.env` file (based on `.env.example`) or configure it in your hosting provider (e.g., Vercel):
   ```env
   GEMINI_API_KEY="your_actual_api_key_here"
   ```
   *(Note: You can also use `GOOGLE_GENERATIVE_AI_API_KEY` as a fallback)*

## Running Locally

Start the development server (which uses Express + Vite):
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Building for Production

To build the client application and the custom server:
```bash
npm run build
```
Start the production server:
```bash
npm run start
```

## Vercel Deployment

This project is structured to easily deploy on Vercel:
- The React application is built via Vite.
- The `api/chat.ts` file functions as a Serverless API Route.
- Add `GEMINI_API_KEY` to your Vercel project's Environment Variables.

## Disclaimer

This application uses generative AI. It may produce inaccurate information about medical subjects, people, places, or facts. Do not rely solely on this AI for actual clinical decision-making. Always consult standard medical literature.
