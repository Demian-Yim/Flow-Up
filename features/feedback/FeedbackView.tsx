
import React, { useState } from 'react';
import { MessageSquareQuote, HelpCircle, Lightbulb, ThumbsUp, Send, CheckCircle } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useParticipantId } from '../../hooks/useParticipantId';
import { FeedbackCategory } from '../../types';

const FeedbackView: React.FC = () => {
    const { role, currentUser, feedback, addFeedback, toggleFeedbackAddressed } = useAppContext();
    const participantId = useParticipantId();

    // Participant state
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState<FeedbackCategory>('Question');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            alert('피드백 내용을 입력해주세요.');
            return;
        }
        addFeedback({
            participantId,
            name: isAnonymous ? '익명' : currentUser?.name || '익명',
            message,
            category,
        });

        setMessage('');
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    const categoryConfig = {
        Question: { icon: HelpCircle, text: '질문 🙋‍♀️', color: 'bg-blue-500/20 text-blue-400', ring: 'ring-blue-500' },
        Suggestion: { icon: Lightbulb, text: '제안 💡', color: 'bg-amber-500/20 text-amber-400', ring: 'ring-amber-500' },
        Praise: { icon: ThumbsUp, text: '칭찬 👍', color: 'bg-emerald-500/20 text-emerald-400', ring: 'ring-emerald-500' },
    };

    if (role === '참가자') {
        if (submitted) {
            return (
                <div className="text-center max-w-md mx-auto bg-slate-800 p-8 rounded-2xl fade-in">
                    <CheckCircle className="w-16 h-16 text-brand-emerald mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">피드백 제출 완료!</h2>
                    <p className="text-xl text-slate-300">소중한 의견 감사합니다.</p>
                </div>
            )
        }

        return (
            <div className="max-w-xl mx-auto bg-slate-800 p-6 rounded-2xl">
                <h2 className="text-2xl font-bold mb-4 text-center">라이브 피드백 📝</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-bold text-slate-300">피드백 종류</label>
                        <div className="grid grid-cols-3 gap-2">
                            {(Object.keys(categoryConfig) as FeedbackCategory[]).map(cat => (
                                <button
                                    type="button"
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`flex items-center justify-center gap-2 p-3 rounded-lg transition-all border-2 ${category === cat ? `${categoryConfig[cat].ring} bg-slate-700` : 'border-transparent bg-slate-700 hover:bg-slate-600'}`}
                                >
                                    {React.createElement(categoryConfig[cat].icon, { className: "w-5 h-5" })}
                                    <span>{categoryConfig[cat].text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="feedback-message" className="block mb-2 font-bold text-slate-300">내용</label>
                        <textarea
                            id="feedback-message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            placeholder="질문, 제안, 칭찬 등 자유롭게 의견을 남겨주세요."
                            className="w-full px-4 py-3 bg-slate-700 text-white border-2 border-slate-600 rounded-lg focus:outline-none focus:border-brand-purple"
                        />
                    </div>
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="anonymous"
                                checked={isAnonymous}
                                onChange={(e) => setIsAnonymous(e.target.checked)}
                                className="h-4 w-4 rounded bg-slate-600 border-slate-500 text-brand-indigo focus:ring-brand-indigo"
                            />
                            <label htmlFor="anonymous" className="text-slate-300">익명으로 제출</label>
                        </div>
                        <button type="submit" className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold py-2 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity">
                            <Send size={18} />
                            <span>보내기</span>
                        </button>
                    </div>
                </form>
            </div>
        );
    }
    
    // Admin View
    return (
        <div className="bg-slate-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">실시간 피드백 현황 ({feedback.length}개)</h2>
            {feedback.length === 0 ? (
                <p className="text-slate-400">아직 제출된 피드백이 없습니다.</p>
            ) : (
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {feedback.map(item => (
                        <div key={item.id} className={`p-4 rounded-lg transition-opacity ${item.isAddressed ? 'bg-slate-900/50 opacity-60' : 'bg-slate-700'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${categoryConfig[item.category].color}`}>
                                            {categoryConfig[item.category].text.split(' ')[0]}
                                        </span>
                                        <span className="font-bold text-white">{item.name}</span>
                                        <span className="text-xs text-slate-400">{new Date(item.timestamp).toLocaleTimeString('ko-KR')}</span>
                                    </div>
                                    <p className="mt-2 text-slate-300">{item.message}</p>
                                </div>
                                <button
                                    onClick={() => toggleFeedbackAddressed(item.id)}
                                    className={`flex items-center gap-2 text-sm py-1 px-3 rounded-full transition-colors ${item.isAddressed ? 'bg-slate-600 text-slate-300' : 'bg-brand-emerald text-white hover:opacity-90'}`}
                                >
                                    <CheckCircle size={16} />
                                    <span>{item.isAddressed ? '확인됨' : '확인'}</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackView;