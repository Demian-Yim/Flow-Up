import React, { useState } from 'react';
import { Music, BrainCircuit, Coffee, Zap, Activity } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { AmbianceMood } from '../../types';
import Spinner from '../../components/Spinner';

const AmbianceView: React.FC = () => {
    const { role, ambiancePlaylist, generateAmbiancePlaylist } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);

    const moodConfig = {
        Focus: { text: '집중 集中', icon: Activity, color: 'border-blue-500', gradient: 'from-blue-500 to-cyan-400' },
        Break: { text: '휴식 休息', icon: Coffee, color: 'border-emerald-500', gradient: 'from-emerald-500 to-green-400' },
        Brainstorming: { text: '브레인스토밍 🧠', icon: BrainCircuit, color: 'border-purple-500', gradient: 'from-purple-500 to-indigo-500' },
        HighEnergy: { text: '에너지 충전 🔥', icon: Zap, color: 'border-amber-500', gradient: 'from-amber-500 to-orange-500' },
    };

    const handleGenerate = async (mood: AmbianceMood) => {
        setIsLoading(true);
        await generateAmbiancePlaylist(mood);
        setIsLoading(false);
    };

    if (role === '관리자') {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center">
                    <div className="p-4 inline-block rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-purple mb-4">
                        <Music className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">분위기 메이커 🎶</h2>
                    <p className="text-slate-400 mb-6">상황에 맞는 음악으로 워크숍의 분위기를 만들어보세요.</p>
                </div>

                <div className="bg-slate-800 p-6 rounded-2xl">
                    <h3 className="font-bold text-lg mb-4">현재 분위기 선택:</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {(Object.keys(moodConfig) as AmbianceMood[]).map(mood => (
                            <button
                                key={mood}
                                onClick={() => handleGenerate(mood)}
                                disabled={isLoading}
                                className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all h-28 ${
                                    ambiancePlaylist?.mood === mood
                                        ? `${moodConfig[mood].color} bg-slate-700`
                                        : 'border-slate-700 bg-slate-700 hover:border-brand-purple'
                                } disabled:opacity-50`}
                            >
                                {React.createElement(moodConfig[mood].icon, { className: "w-8 h-8" })}
                                <span className="font-semibold">{moodConfig[mood].text}</span>
                            </button>
                        ))}
                    </div>
                </div>
                
                {isLoading && <Spinner />}

                {ambiancePlaylist && !isLoading && (
                    <div className="bg-slate-800 p-6 rounded-2xl fade-in">
                        <h3 className={`text-xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r ${moodConfig[ambiancePlaylist.mood].gradient}`}>
                            AI 추천 플레이리스트 for "{moodConfig[ambiancePlaylist.mood].text}"
                        </h3>
                        <ul className="space-y-3">
                            {ambiancePlaylist.songs.map((song, index) => (
                                <li key={index} className="flex items-center gap-4 bg-slate-700/50 p-3 rounded-lg">
                                    <Music size={18} className="text-slate-400" />
                                    <div>
                                        <p className="font-bold text-white">{song.title}</p>
                                        <p className="text-sm text-slate-400">{song.artist}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    }
    
    // Participant View
    return (
        <div className="max-w-md mx-auto text-center">
            {ambiancePlaylist ? (
                <div className="bg-slate-800 p-8 rounded-2xl fade-in">
                    <p className="text-slate-400 mb-2">현재 분위기</p>
                     <h2 className={`text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${moodConfig[ambiancePlaylist.mood].gradient}`}>
                        {moodConfig[ambiancePlaylist.mood].text}
                    </h2>
                    <div className="space-y-3 text-left">
                        {ambiancePlaylist.songs.map((song, index) => (
                             <div key={index} className="flex items-center gap-4 bg-slate-700/50 p-3 rounded-lg">
                                <Music size={18} className="text-slate-400" />
                                <div>
                                    <p className="font-bold text-white">{song.title}</p>
                                    <p className="text-sm text-slate-400">{song.artist}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="bg-slate-800 p-8 rounded-2xl">
                     <div className="p-4 inline-block rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-purple mb-4">
                        <Music className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">분위기 메이커 🎶</h2>
                    <p className="text-slate-400">관리자가 곧 분위기에 맞는 음악을 선곡할 거예요!</p>
                </div>
            )}
        </div>
    );
};

export default AmbianceView;