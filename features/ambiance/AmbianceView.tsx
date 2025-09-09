
import React from 'react';
import { Music } from 'lucide-react';

const AmbianceView: React.FC = () => {
    return (
        <div className="text-center max-w-md mx-auto bg-slate-800 p-8 rounded-2xl">
            <div className="p-4 inline-block rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-purple mb-4">
                <Music className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">분위기 메이커 🎶</h2>
            <p className="text-slate-400">이 기능은 현재 준비 중입니다. 곧 멋진 모습으로 찾아올게요!</p>
        </div>
    );
};

export default AmbianceView;
