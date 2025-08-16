
import React from 'react';
import type { StorySegment } from '../types';

interface ChatMessageProps {
  segment: StorySegment;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ segment }) => {
  return (
    <div className="mb-8 animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-rose-100">
        <img 
          src={segment.imageUrl} 
          alt="A scene from the love story" 
          className="w-full h-auto object-cover" 
        />
        <div className="p-6">
          <p className="text-stone-700 leading-relaxed text-lg">
            {segment.text}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
