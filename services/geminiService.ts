import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { StoryResponse } from '../types';

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const storyResponseSchema = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.STRING,
      description: "A short paragraph of a story, about 3-4 sentences."
    },
    choices: {
      type: Type.ARRAY,
      description: "Exactly three distinct choices for the user to continue the story.",
      items: { type: Type.STRING }
    }
  },
  required: ['story', 'choices']
};

const systemInstruction = `You are an expert storyteller creating an interactive story. Your task is to narrate a compelling story, and at the end of each narration, you must provide the user with three distinct choices to guide the story's direction.

Rules:
1. Always begin the story in a captivating, unexpected setting based on the user's prompt.
2. Each story segment should be a short paragraph, about 3-4 sentences long.
3. After each story segment, you MUST provide three distinct choices.
4. The choices must be different from each other and lead to meaningful branches in the story.
5. Your entire response MUST be a valid JSON object matching the provided schema. Do not include any text outside of the JSON structure.
`;

export function createChatSession(): Chat {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: storyResponseSchema,
        },
    });
}

async function generateImage(prompt: string): Promise<string> {
    const imagePrompt = `Cinematic, digital painting, detailed illustration, atmospheric. ${prompt}`;
    
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: imagePrompt,
        config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: '16:9',
        },
    });

    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
}

export async function generateStoryAndImage(chat: Chat, message: string): Promise<{ story: StoryResponse; imageUrl: string }> {
    const result = await chat.sendMessage({ message });
    
    let story: StoryResponse;
    try {
        const jsonText = result.text.trim();
        story = JSON.parse(jsonText) as StoryResponse;
    } catch (e) {
        console.error("Failed to parse JSON response:", result.text);
        throw new Error("The AI returned an unexpected story format. Please try again.");
    }

    if (!story.story || !story.choices || story.choices.length !== 3) {
        throw new Error("Invalid story structure received from AI.");
    }
    
    const imageUrl = await generateImage(story.story);

    return { story, imageUrl };
}