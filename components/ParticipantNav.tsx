import React from 'react';
import { ArrowLeft, ArrowRight, Home } from 'lucide-react';

interface ParticipantNavProps {
    onNav: (direction: 'next' | 'prev' | 'home') => void;
    currentIndex: number;
    totalTools: number;
}

const ParticipantNav: React.FC<ParticipantNavProps> = ({ onNav, currentIndex, totalTools }) => {
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalTools - 1;

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/80 backdrop-blur-sm shadow-lg p-3 z-20">
            <div className="max-w-md mx-auto flex justify-between items-center">
                <button
                    onClick={() => onNav('prev')}
                    disabled={isFirst}
                    className="flex flex-col items-center gap-1 text-slate-300 hover:text-white disabled:opacity-50 disabled:hover:text-slate-300 transition-colors px-4 py-1"
                >
                    <ArrowLeft size={20} />
                    <span className="text-xs">이전</span>
                </button>
                <button
                    onClick={() => onNav('home')}
                    className="flex flex-col items-center gap-1 text-slate-300 hover:text-white transition-colors px-4 py-1"
                >
                    <Home size={20} />
                    <span className="text-xs">홈</span>
                </button>
                <button
                    onClick={() => onNav('next')}
                    disabled={isLast}
                    className="flex flex-col items-center gap-1 text-slate-300 hover:text-white disabled:opacity-50 disabled:hover:text-slate-300 transition-colors px-4 py-1"
                >
                    <ArrowRight size={20} />
                    <span className="text-xs">다음</span>
                </button>
            </div>
        </nav>
    );
};

export default ParticipantNav;
