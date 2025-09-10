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

    const PlaylistGallery = () => (
        <div className="mt-6">
            {ambiancePlaylist && (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 fade-in">
                    {ambiancePlaylist.playlists.map((playlist, index) => (
                        <a 
                            key={index} 
                            href={`https://www.youtube.com/watch?v=${playlist.videoId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-slate-800 rounded-lg overflow-hidden group transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-brand-purple/50"
                        >
                            <img src={playlist.thumbnailUrl} alt={playlist.title} className="w-full h-40 object-cover" />
                            <div className="p-4">
                                <h4 className="font-bold text-white truncate group-hover:text-brand-amber">{playlist.title}</h4>
                                <p className="text-sm text-slate-400 mt-1 h-10 overflow-hidden">{playlist.description}</p>
                            </div>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );

    if (role === '관리자') {
        return (
            <div className="max-w-4xl mx-auto space-y-6">
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
                
                {isLoading && <div className="text-center py-8"><Spinner /><p className="mt-2 text-slate-300">AI가 유튜브에서 플레이리스트를 찾고 있습니다...</p></div>}

                {!isLoading && ambiancePlaylist && <PlaylistGallery />}
            </div>
        );
    }
    
    // Participant View
    if (!ambiancePlaylist) {
        return (
            <div className="text-center py-8">
                <Spinner />
                <p className="mt-2 text-slate-300">플레이리스트를 불러오는 중...</p>
            </div>
        );
    }

    const isDefaultPlaylist = ambiancePlaylist.playlists[0]?.title.includes("Welcome to Flow~ Link!");

    return (
        <div className="max-w-4xl mx-auto text-center fade-in">
            <p className="text-slate-400 mb-2">{isDefaultPlaylist ? "워크숍을 위한 추천 음악" : "현재 분위기"}</p>
            <h2 className={`text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r ${moodConfig[ambiancePlaylist.mood].gradient}`}>
                {isDefaultPlaylist ? "Welcome Playlist" : moodConfig[ambiancePlaylist.mood].text}
            </h2>
            <PlaylistGallery />
        </div>
    );
};

export default AmbianceView;