
import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown, Trophy } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

interface TeamScore {
    name: string;
    score: number;
}

const ScoreboardView: React.FC = () => {
    const { role, teams } = useAppContext();
    const [scores, setScores] = useState<TeamScore[]>([]);

    useEffect(() => {
        setScores(teams.map(team => ({ name: team.name, score: 0 })));
    }, [teams]);

    const handleScoreChange = (index: number, delta: number) => {
        const newScores = [...scores];
        newScores[index].score += delta;
        newScores.sort((a, b) => b.score - a.score);
        setScores(newScores);
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
             {scores.length === 0 ? (
                 <p className="text-center text-slate-400">팀이 아직 구성되지 않았습니다. 팀 빌더에서 먼저 팀을 생성해주세요.</p>
             ) : (
                <div className="space-y-3">
                    {scores.map((team, index) => (
                        <div key={team.name} className="bg-slate-700 p-4 rounded-lg flex items-center gap-4 transition-all duration-500">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xl ${rankColors[index] || 'bg-slate-600 text-white'}`}>
                                {index < 3 ? <Trophy size={24} /> : index + 1}
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="font-bold text-lg">{team.name}</span>
                                    <span className="font-black text-2xl text-white">{team.score}점</span>
                                </div>
                                <div className="w-full bg-slate-600 rounded-full h-4">
                                     <div 
                                        className="bg-gradient-to-r from-brand-indigo to-brand-purple h-4 rounded-full transition-all duration-500"
                                        style={{width: `${(team.score / maxScore) * 100}%`}}>
                                    </div>
                                </div>
                            </div>
                            {role === '관리자' && (
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => handleScoreChange(index, 1)} className="p-2 bg-slate-600 rounded-md hover:bg-brand-emerald transition-colors"><ChevronUp size={16}/></button>
                                    <button onClick={() => handleScoreChange(index, -1)} className="p-2 bg-slate-600 rounded-md hover:bg-red-500 transition-colors"><ChevronDown size={16}/></button>
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
