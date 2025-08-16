# AI Story Writer

AI Story Writer is a dynamic and interactive web application that allows you to co-create stories with an AI. You provide the opening scene, and the AI takes over, weaving a narrative complete with compelling choices and beautiful, AI-generated images for each step.

## Features

- **Interactive Storytelling**: Guide the narrative by choosing from three distinct paths at the end of each story segment.
- **User-Defined Start**: Kick off the adventure with your own custom opening scene. Your imagination sets the stage!
- **AI-Powered Creativity**: Leverages Google's Gemini API for dynamic story generation (`gemini-2.5-flash`) and rich, atmospheric imagery (`imagen-3.0-generate-002`).
- **Visually Immersive**: Each part of the story is brought to life with a unique, AI-generated image that captures the mood of the scene.
- **Sleek & Responsive UI**: A clean, mobile-first design built with Tailwind CSS ensures a great experience on any device.
- **Start Over Anytime**: Easily discard the current story and begin a new one with a different premise.

## How It Works

1.  **Describe the Scene**: You start by writing a short description of the opening scene for your story.
2.  **Weave the Story**: The app sends your prompt to the Gemini API, which generates the first paragraph of the story, a corresponding image, and three choices for what to do next.
3.  **Make a Choice**: You select one of the three choices.
4.  **Continue the Adventure**: The app sends your choice to the AI, which continues the story based on your decision, generating a new image and new choices. This loop continues as you build your unique narrative.

## Technology Stack

- **Frontend**: React, TypeScript
- **AI**: Google Gemini API (`@google/genai`)
- **Styling**: Tailwind CSS
- **Fonts**: Google Fonts (Playfair Display & Roboto)
- **Module Loading**: ES Modules via `importmap` for a buildless development environment.

## File Structure

The project is organized to separate concerns, making it easy to navigate and maintain.

```
.
├── components/
│   ├── ChoiceButton.tsx     # Button component for user choices
│   ├── ChatMessage.tsx      # Displays a story segment with its image
│   └── LoadingSpinner.tsx   # Spinner shown during AI generation
├── services/
│   └── geminiService.ts     # Handles all communication with the Gemini API
├── App.tsx                  # Main application component, manages state and UI
├── index.html               # The main HTML file
├── index.tsx                # React app entry point
├── metadata.json            # Application metadata
├── README.md                # You are here!
└── types.ts                 # Shared TypeScript type definitions
```

## Setup & Running

This project is designed to run in an environment where the `API_KEY` is provided as an environment variable.

1.  Ensure you have a modern web browser.
2.  Serve the `index.html` file using a local web server. A simple one can be run with Python: `python3 -m http.server`
3.  Make sure the `process.env.API_KEY` environment variable is available to the application during runtime with a valid Google Gemini API key.
