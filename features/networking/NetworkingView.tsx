import React, { useState } from 'react';
import { Link, Users, Sparkles, Send } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useParticipantId } from '../../hooks/useParticipantId';
import Spinner from '../../components/Spinner';

const NetworkingView: React.FC = () => {
    const { role, currentUser, networkingInterests, networkingMatches, addNetworkingInterest } = useAppContext();
    const participantId = useParticipantId();
    
    const [interests, setInterests] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const myInterest = networkingInterests.find(i => i.participantId === participantId);
    const myMatches = networkingMatches[participantId] || [];
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!interests.trim() || !currentUser) {
            alert('관심사를 입력해주세요.');
            return;
        }
        setIsLoading(true);
        await addNetworkingInterest({
            participantId,
            name: currentUser.name,
            interests,
        });
        setIsLoading(false);
    };
    
    // Participant View
    if (role === '참가자') {
        if (!currentUser) {
             return (
                <div className="text-center max-w-md mx-auto bg-slate-800 p-8 rounded-2xl">
                    <p className="text-slate-400">먼저 '오늘의 체크인'을 완료해주세요.</p>
                </div>
            );
        }

        if (isLoading) {
             return (
                <div className="text-center max-w-md mx-auto bg-slate-800 p-8 rounded-2xl">
                    <Spinner />
                    <h2 className="text-2xl font-bold mt-4">최적의 대화 상대를 찾고 있어요...</h2>
                    <p className="text-slate-400">AI가 여러분의 관심사를 분석 중입니다. 잠시만 기다려주세요!</p>
                </div>
            );
        }
        
        if (myInterest) {
            return (
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8 bg-slate-800 p-6 rounded-2xl">
                         <h2 className="text-3xl font-bold mb-2">🤝 {currentUser.name}님을 위한 추천 대화 상대</h2>
                         <p className="text-slate-400">AI가 {currentUser.name}님의 관심사(<span className="font-bold text-brand-amber">{myInterest.interests}</span>)를 바탕으로 추천했어요.</p>
                    </div>
                    {networkingInterests.length < 2 ? (
                         <div className="text-center bg-slate-800 p-8 rounded-2xl">
                            <Users className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                            <p className="text-lg">다른 참가자들이 관심사를 입력하기를 기다리고 있습니다.</p>
                        </div>
                    ) : myMatches.length > 0 ? (
                        <div className="space-y-4">
                            {myMatches.map(match => (
                                <div key={match.matchedParticipantId} className="bg-slate-800 p-6 rounded-2xl border-l-4 border-brand-purple fade-in">
                                    <h3 className="text-2xl font-bold text-white">{match.matchedParticipantName}</h3>
                                    <p className="text-brand-amber font-semibold mt-1 mb-3">{match.commonInterests}</p>
                                    <div className="bg-slate-700/50 p-4 rounded-lg flex items-start gap-3">
                                        <Sparkles className="w-5 h-5 text-brand-amber flex-shrink-0 mt-1" />
                                        <div>
                                            <p className="font-bold text-slate-300">대화 시작 제안:</p>
                                            <p className="text-slate-300 italic">"{match.conversationStarter}"</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                         <div className="text-center bg-slate-800 p-8 rounded-2xl">
                             <Spinner />
                             <p className="text-lg mt-4">매칭 정보를 계산 중입니다. 잠시 후 새로고침 됩니다.</p>
                         </div>
                    )}
                </div>
            )
        }

        return (
            <div className="max-w-xl mx-auto bg-slate-800 p-8 rounded-2xl">
                 <div className="text-center">
                    <div className="p-4 inline-block rounded-2xl bg-gradient-to-br from-brand-indigo to-brand-purple mb-4">
                        <Link className="h-12 w-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">네트워킹 커넥터 🤝</h2>
                    <p className="text-slate-400 mb-6">함께 이야기 나누고 싶은 주제나 관심사를 알려주세요. AI가 좋은 대화 상대를 찾아드릴게요!</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <textarea
                        value={interests}
                        onChange={(e) => setInterests(e.target.value)}
                        rows={3}
                        placeholder="예: 리액트 최신 기능, 효율적인 상태 관리, 사이드 프로젝트 아이디어, 주말 등산..."
                        className="w-full px-4 py-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:border-brand-purple"
                    />
                    <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                        <Send size={18} />
                        <span>제출하고 추천받기</span>
                    </button>
                </form>
            </div>
        );
    }
    
    // Admin View
    return (
        <div className="bg-slate-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">네트워킹 현황 ({networkingInterests.length}명 제출)</h2>
            {networkingInterests.length === 0 ? (
                 <p className="text-slate-400">아직 관심사를 제출한 참가자가 없습니다.</p>
            ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {networkingInterests.map(interest => (
                         <div key={interest.participantId} className="bg-slate-700 p-4 rounded-lg">
                            <p className="font-bold text-lg text-white">{interest.name}</p>
                            <p className="text-slate-300 mt-1">
                                <span className="font-semibold text-slate-400">관심사: </span>
                                {interest.interests}
                            </p>
                            <div className="mt-3 border-t border-slate-600 pt-3">
                                <h4 className="font-semibold text-slate-400 mb-2">AI 추천 매칭:</h4>
                                {networkingMatches[interest.participantId] && networkingMatches[interest.participantId].length > 0 ? (
                                    <ul className="list-disc list-inside text-slate-300 space-y-1">
                                        {networkingMatches[interest.participantId].map(match => (
                                            <li key={match.matchedParticipantId}>
                                                <span className="font-bold text-brand-amber">{match.matchedParticipantName}</span>
                                                <span className="text-sm"> ({match.commonInterests})</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-sm text-slate-500">매칭 대기 중...</p>
                                )}
                            </div>
                         </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NetworkingView;