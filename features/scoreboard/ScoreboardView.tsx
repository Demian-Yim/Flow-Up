import React from 'react';
import { ChevronUp, ChevronDown, Trophy } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

const ScoreboardView: React.FC = () => {
    const { role, teams, scores, updateScore } = useAppContext();

    const handleScoreChange = (teamId: string, delta: number) => {
        updateScore(teamId, delta);
    };
    
    const maxScore = Math.max(10, ...scores.map(s => s.score));

    const rankColors = [
        'bg-amber-400 text-amber-900', // 1st
        'bg-slate-400 text-slate-900', // 2nd
        'bg-orange-400 text-orange-900' // 3rd
    ];
    
    return (
        <div className="max-w-3xl mx-auto bg-slate-800 p-6 rounded-2xl">
             <h2 className="text-2xl font-bold mb-6 text-center">실시간 스코어보드 🏆</h2>
             {teams.length === 0 ? (
                 <p className="text-center text-slate-400">팀이 아직 구성되지 않았습니다. 팀 빌더에서 먼저 팀을 생성해주세요.</p>
             ) : (
                <div className="space-y-3">
                    {scores.map((teamScore, index) => (
                        <div key={teamScore.teamId} className="bg-slate-700 p-4 rounded-lg flex items-center gap-4 transition-all duration-500">
                            <div className={`w-12 h-10 rounded-lg flex items-center justify-center font-bold text-xl ${rankColors[index] || 'bg-slate-600 text-white'}`}>
                                {index < 3 ? <Trophy size={24} /> : <span>{index + 1}</span>}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-lg">{`${index + 1}팀 - ${teamScore.name}`}</span>
                                    <span className="font-black text-2xl text-white">{teamScore.score.toLocaleString()}점</span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-4">
                                     <div 
                                        className="bg-gradient-to-r from-brand-indigo to-brand-purple h-4 rounded-full transition-all duration-500"
                                        style={{width: `${(teamScore.score / maxScore) * 100}%`}}>
                                    </div>
                                </div>
                            </div>
                            {role === '관리자' && (
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleScoreChange(teamScore.teamId, 1)} className="p-2 bg-slate-600 rounded-md hover:bg-brand-emerald transition-colors"><ChevronUp size={16}/></button>
                                    <span className="font-bold text-sm w-8 text-center">10</span>
                                    <button onClick={() => handleScoreChange(teamScore.teamId, -1)} className="p-2 bg-slate-600 rounded-md hover:bg-red-500 transition-colors"><ChevronDown size={16}/></button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
             )}
        </div>
    );
};

export default ScoreboardView;