import React, { useState } from 'react';
import { PartyPopper, Trophy, Camera, Sparkles, RefreshCw, AlertTriangle, Printer, Music, Users } from 'lucide-react';
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

    const handlePrint = () => {
        window.print();
    };
    
    const SummaryDisplay = () => {
        if (!workshopSummary) {
            return (
                <div className="text-center text-slate-400 bg-slate-800 p-8 rounded-2xl no-print">
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
            <div id="printable-area" className="space-y-6">
                <style>
                    {`
                        @media print {
                            body * {
                                visibility: hidden;
                            }
                            #printable-area, #printable-area * {
                                visibility: visible;
                            }
                            #printable-area {
                                position: absolute;
                                left: 0;
                                top: 0;
                                width: 100%;
                                color: #333 !important;
                            }
                            .no-print {
                                display: none !important;
                            }
                            .print-avoid-break {
                                break-inside: avoid;
                                page-break-inside: avoid;
                            }
                            .print-bg-white {
                                background-color: white !important;
                                border: 1px solid #ddd;
                            }
                            .print-text-gray {
                                color: #555 !important;
                            }
                            .print-text-black {
                                color: #000 !important;
                            }
                            @page {
                                margin: 1in;
                            }
                        }
                    `}
                </style>
                {/* AI Summaries */}
                <div className="bg-slate-800 p-6 rounded-2xl print-avoid-break print-bg-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-300 print-text-black"><Sparkles /> AI가 요약한 워크숍</h3>
                    <div className="space-y-4">
                        <div className="bg-slate-700/50 p-4 rounded-lg print-bg-white">
                            <h4 className="font-bold text-slate-300 mb-1 print-text-gray">피드백 요약</h4>
                            <p className="text-slate-300 whitespace-pre-wrap print-text-black">{workshopSummary.feedbackSummary}</p>
                        </div>
                        <div className="bg-slate-700/50 p-4 rounded-lg print-bg-white">
                            <h4 className="font-bold text-slate-300 mb-1 print-text-gray">네트워킹 관심사 요약</h4>
                             <p className="text-slate-300 whitespace-pre-wrap print-text-black">{workshopSummary.networkingSummary}</p>
                        </div>
                         <div className="bg-slate-700/50 p-4 rounded-lg print-bg-white">
                            <h4 className="font-bold text-slate-300 mb-1 print-text-gray">오늘의 분위기 요약</h4>
                             <p className="text-slate-300 whitespace-pre-wrap print-text-black">{workshopSummary.ambianceSummary}</p>
                        </div>
                         <div className="bg-slate-700/50 p-4 rounded-lg print-bg-white">
                            <h4 className="font-bold text-slate-300 mb-1 print-text-gray">팀 활동 하이라이트</h4>
                             <p className="text-slate-300 whitespace-pre-wrap print-text-black">{workshopSummary.teamDynamicsSummary}</p>
                        </div>
                         <p className="text-xs text-slate-500 text-right print-text-gray">
                            생성 시각: {new Date(workshopSummary.generatedAt).toLocaleString('ko-KR')}
                        </p>
                    </div>
                </div>

                {/* Final Scoreboard */}
                <div className="bg-slate-800 p-6 rounded-2xl print-avoid-break print-bg-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-amber-300 print-text-black"><Trophy /> 최종 스코어보드</h3>
                    <div className="space-y-3">
                        {scores.slice(0, 3).map((teamScore, index) => (
                             <div key={teamScore.teamId} className={`bg-slate-700 p-4 rounded-lg border-l-4 ${rankColors[index] || 'border-slate-600'} print-bg-white`}>
                                <span className="text-slate-400 font-semibold print-text-gray">{index + 1}위</span>
                                <div className="flex justify-between items-baseline">
                                    <span className="font-bold text-lg text-white print-text-black">{teamScore.name}</span>
                                    <span className="font-black text-2xl text-white print-text-black">{teamScore.score}점</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Photo Wall */}
                 <div className="bg-slate-800 p-6 rounded-2xl print-avoid-break print-bg-white">
                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-emerald-300 print-text-black"><Camera /> 오늘의 얼굴들</h3>
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
            </div>
        )
    };
    
    return (
         <div className="max-w-3xl mx-auto space-y-6">
            <div className="text-center no-print">
                <div className="p-4 inline-block rounded-2xl bg-gradient-to-br from-brand-amber to-orange-500 mb-4">
                    <PartyPopper className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-2">오늘의 마무리 🌟</h2>
                <p className="text-slate-400">워크숍의 성과와 추억을 한눈에 확인해보세요!</p>
            </div>
            
            {role === '관리자' && (
                <div className="bg-slate-800 p-6 rounded-2xl no-print">
                    <h3 className="text-xl font-bold mb-4">관리자 도구</h3>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                            {isLoading ? <Spinner /> : <><RefreshCw size={18} /><span>{workshopSummary ? '요약 다시 생성하기' : 'AI 요약 리포트 생성'}</span></>}
                        </button>
                        <button
                            onClick={handlePrint}
                            disabled={!workshopSummary}
                            className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-slate-500 transition-colors disabled:opacity-50"
                        >
                            <Printer size={18} />
                            <span>결과 인쇄하기</span>
                        </button>
                    </div>
                    {error && (
                        <p className="text-red-400 mt-4 flex items-center gap-2"><AlertTriangle size={16} />{error}</p>
                    )}
                </div>
            )}

            {role === '참가자' && !workshopSummary && (
                <div className="text-center bg-slate-800 p-8 rounded-2xl no-print">
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