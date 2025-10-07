import React, { useState, useEffect, useRef } from 'react';
import type { Chat } from '@google/genai';
import { createChatSession, generateStoryAndImage } from './services/geminiService';
import type { StorySegment } from './types';
import ChatMessage from './components/ChatMessage';
import ChoiceButton from './components/ChoiceButton';
import LoadingSpinner from './components/LoadingSpinner';
import { 
  initAudio,
  playStartSound,
  playEndSound,
  playNewSegmentSound,
  playErrorSound
} from './services/audioService';

const promptSuggestions = [
  "A lone lighthouse keeper on a stormy, alien planet.",
  "A detective discovers a magical secret in 1920s New Orleans.",
  "Two rival starship captains are stranded on a lush, unexplored world.",
];

const App: React.FC = () => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [storyHistory, setStoryHistory] = useState<StorySegment[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [storyStarted, setStoryStarted] = useState<boolean>(false);
  const [initialPrompt, setInitialPrompt] = useState<string>('');

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (storyStarted) {
      scrollToBottom();
    }
  }, [storyHistory, isLoading, storyStarted]);

  useEffect(() => {
    // Play sound for new story segments, but not the very first one.
    if (storyHistory.length > 1) {
      playNewSegmentSound();
    }
  }, [storyHistory.length]);

  const resetStory = () => {
    playEndSound();
    setIsLoading(false);
    setError(null);
    setStoryHistory([]);
    setChoices([]);
    setChat(null);
    setStoryStarted(false);
    setInitialPrompt('');
  };
  
  const startStory = async (prompt: string) => {
    if (!prompt.trim()) {
      setError("Please describe an opening scene to begin your story.");
      return;
    }
    
    playStartSound();
    setIsLoading(true);
    setError(null);
    
    try {
      const newChat = createChatSession();
      setChat(newChat);
      const { story, imageUrl } = await generateStoryAndImage(newChat, `Start the story with this scene: ${prompt}`);
      setStoryHistory([{ id: 1, text: story.story, imageUrl }]);
      setChoices(story.choices);
      setStoryStarted(true);
    } catch (err) {
      playErrorSound();
      console.error(err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred while starting your story.";
      setError(errorMessage);
      setStoryStarted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartStory = (e: React.FormEvent) => {
    e.preventDefault();
    initAudio(); // Initialize audio on first user action
    startStory(initialPrompt);
  };

  const handleChoiceClick = async (choice: string) => {
    if (!chat || isLoading) return;

    setIsLoading(true);
    setError(null);
    setChoices([]);

    try {
      const { story, imageUrl } = await generateStoryAndImage(chat, choice);
      setStoryHistory(prev => [...prev, { id: prev.length + 1, text: story.story, imageUrl }]);
      setChoices(story.choices);
    } catch (err) {
      playErrorSound();
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-rose-50 flex flex-col items-center">
      <header className="w-full bg-white/80 backdrop-blur-md sticky top-0 z-10 border-b border-rose-200 shadow-sm">
        <div className="max-w-4xl mx-auto py-4 px-6 grid grid-cols-3 items-center gap-4">
          <div className="col-start-1"></div>
          <div className="text-center col-start-2">
            <h1 className="text-3xl md:text-4xl font-bold text-rose-800 font-serif">AI Story Writer</h1>
            <p className="text-stone-500 mt-1 text-sm md:text-base">Craft your own adventure, one choice at a time.</p>
          </div>
          <div className="col-start-3 flex justify-end">
            {storyStarted && (
              <button
                onClick={resetStory}
                className="bg-white border border-rose-300 text-rose-700 font-semibold py-2 px-4 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap"
                aria-label="Start a new story"
              >
                Start Over
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="w-full max-w-2xl mx-auto p-4 md:p-6 flex-grow flex flex-col">
        {!storyStarted ? (
          <div className="flex-grow flex items-center justify-center">
            <div className="w-full text-center animate-fade-in">
              {isLoading ? (
                <LoadingSpinner />
              ) : (
                <>
                  <h2 className="text-3xl font-serif text-rose-700 mb-4">Describe Your Opening Scene</h2>
                  <p className="text-stone-600 mb-8 max-w-lg mx-auto">What setting should your story begin in? Be as descriptive as you like!</p>
                  <form onSubmit={handleStartStory}>
                    <textarea
                      value={initialPrompt}
                      onChange={(e) => {
                        setInitialPrompt(e.target.value);
                        if (error) setError(null);
                      }}
                      className="w-full h-32 p-4 bg-white/80 border border-rose-200 rounded-lg shadow-sm focus:ring-2 focus:ring-rose-400 focus:outline-none resize-none"
                      placeholder="e.g., A mysterious spaceship docks at a desolate asteroid..."
                      aria-label="Initial story prompt"
                      disabled={isLoading}
                    />
                    
                    <div className="my-6">
                      <p className="text-stone-500 mb-3">Or try one of these ideas:</p>
                      <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
                        {promptSuggestions.map((prompt, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              initAudio(); // Initialize audio on first user action
                              startStory(prompt);
                            }}
                            disabled={isLoading}
                            className="bg-white/80 border border-rose-300 text-rose-700 font-semibold py-2 px-4 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {prompt}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <button
                      type="submit"
                      className="bg-rose-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-rose-600 transition-colors text-lg shadow-md disabled:bg-rose-300"
                      disabled={isLoading || !initialPrompt.trim()}
                    >
                      Weave My Story
                    </button>
                    {error && (
                      <p className="text-red-600 mt-4" role="alert">{error}</p>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="space-y-6">
              {storyHistory.map(segment => (
                <ChatMessage key={segment.id} segment={segment} />
              ))}

              {error && storyHistory.length > 0 && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                  <strong className="font-bold">Oh no! </strong>
                  <span className="block sm:inline">{error}</span>
                </div>
              )}
              
              <div ref={endOfMessagesRef} />
            </div>
          </div>
        )}
      </main>

      <footer className="w-full bg-white/80 backdrop-blur-md sticky bottom-0 z-10 border-t border-rose-200">
        <div className="max-w-2xl mx-auto p-4 md:p-6">
          {storyStarted && isLoading && <LoadingSpinner />}
          {storyStarted && !isLoading && !error && choices.length > 0 && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <h2 className="text-xl text-center font-serif text-rose-700 mb-2">What happens next?</h2>
              {choices.map((choice, index) => (
                <ChoiceButton
                  key={index}
                  text={choice}
                  onClick={() => handleChoiceClick(choice)}
                  disabled={isLoading}
                />
              ))}
            </div>
          )}
           {storyStarted && !isLoading && error && (
            <div className="text-center">
                <button
                    onClick={resetStory}
                    className="bg-rose-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-rose-600 transition-colors"
                >
                    Start a New Story
                </button>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};

export default App;