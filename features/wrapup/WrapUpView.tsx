import React, { useState } from 'react';
import { PartyPopper, Trophy, Camera, Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import Spinner from '../../components/Spinner';

const WrapUpView: React.FC = () => {
    const { role, workshopSummary, generateWorkshopSummary, participants, scores } = useAppContext();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    
    const handleGenerate = async () => {
        setIsLoading(true);
        setError('');
        try {
            await generateWorkshopSummary();
        } catch (e) {
            console.error(e);
            setError('요약 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const SummaryDisplay = () => {
        if (!workshopSummary) {
            return (
                <div className="text-center text-slate-400 bg-slate-800 p-8 rounded-2xl">
                    <p>아직 요약 리포트가 생성되지 않았습니다.</p>
                </div>
            )
        }
        
        const rankColors = [
            'border-amber-400', // 1st
            'border-slate-400', // 2nd
            'border-orange-400' // 3rd
        ];

        return (
            <div className="space-y-6">
                {/* Final Scoreboard */}
                <div className="bg-slate-800 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-300"><Trophy /> 최종 스코어보드</h3>
                    <div className="space-y-3">
                        {scores.slice(0, 3).map((teamScore, index) => (
                             <div key={teamScore.teamId} className={`bg-slate-700 p-4 rounded-lg border-l-4 ${rankColors[index] || 'border-slate-600'}`}>
                                <span className="text-slate-400 font-semibold">{index + 1}위</span>
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold text-lg text-white">{teamScore.name}</span>
                                    <span className="font-black text-2xl text-white">{teamScore.score}점</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Photo Wall */}
                 <div className="bg-slate-800 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-300"><Camera /> 오늘의 얼굴들</h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {participants.filter(p => p.checkInImage).map(p => (
                            <img 
                                key={p.id} 
                                src={p.checkInImage} 
                                alt={p.name}
                                title={p.name}
                                className="w-16 h-16 rounded-full object-cover border-2 border-slate-600 hover:border-brand-purple transition-all"
                            />
                        ))}
                    </div>
                </div>

                {/* AI Summaries */}
                <div className="bg-slate-800 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-300"><Sparkles /> AI가 요약한 워크숍</h3>
                    <div className="space-y-4">
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <h4 className="font-bold text-slate-300 mb-1">피드백 요약</h4>
                            <p className="text-slate-300 whitespace-pre-wrap">{workshopSummary.feedbackSummary}</p>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-lg">
                            <h4 className="font-bold text-slate-300 mb-1">네트워킹 관심사 요약</h4>
                             <p className="text-slate-300 whitespace-pre-wrap">{workshopSummary.networkingSummary}</p>
                        </div>
                         <p className="text-xs text-slate-500 text-right">
                            생성 시각: {new Date(workshopSummary.generatedAt).toLocaleString('ko-KR')}
                        </p>
                    </div>
                </div>
            </div>
        )
    };
    
    return (
         <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center">
                <div className="p-4 inline-block rounded-2xl bg-gradient-to-br from-brand-amber to-orange-500 mb-4">
                    <PartyPopper className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">오늘의 마무리 🌟</h2>
                <p className="text-slate-400">워크숍의 성과와 추억을 한눈에 확인해보세요!</p>
            </div>
            
            {role === '관리자' && (
                <div className="bg-slate-800 p-6 rounded-2xl">
                    <h3 className="text-xl font-bold mb-4">관리자 도구</h3>
                     <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {isLoading ? <Spinner /> : <><RefreshCw size={18} /><span>{workshopSummary ? '요약 다시 생성하기' : 'AI 요약 리포트 생성'}</span></>}
                    </button>
                    {error && (
                        <p className="text-red-400 mt-4 flex items-center gap-2"><AlertTriangle size={16} />{error}</p>
                    )}
                </div>
            )}

            {role === '참가자' && !workshopSummary && (
                <div className="text-center bg-slate-800 p-8 rounded-2xl">
                    <Spinner />
                    <p className="mt-4 text-slate-400">관리자가 워크숍 요약을 생성하고 있습니다. 잠시만 기다려주세요!</p>
                </div>
            )}
            
            {(role === '참가자' && workshopSummary) && <SummaryDisplay/>}
            {(role === '관리자') && <SummaryDisplay/>}

        </div>
    )
};

export default WrapUpView;