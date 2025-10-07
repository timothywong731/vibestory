import React from 'react';
import { initAudio, playClickSound } from '../services/audioService';

interface ChoiceButtonProps {
  text: string;
  onClick: () => void;
  disabled: boolean;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({ text, onClick, disabled }) => {
  const handleClick = () => {
    // initAudio is safe to call multiple times
    initAudio();
    playClickSound();
    onClick();
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-full text-left p-4 bg-white/80 backdrop-blur-sm rounded-lg border border-rose-200 shadow-md hover:bg-rose-100 hover:border-rose-300 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-400 disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed"
    >
      <span className="font-medium text-stone-700">{text}</span>
    </button>
  );
};

export default ChoiceButton;