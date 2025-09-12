import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, HelpCircle, Lightbulb, ThumbsUp, Send, CheckCircle, List, StickyNote, Cloud } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { useParticipantId } from '../../hooks/useParticipantId';
import { Feedback, FeedbackCategory } from '../../types';
import { generateFeedbackReply } from '../../services/geminiService';
import Spinner from '../../components/Spinner';

// Helper function for Word Cloud
const generateWordCloudData = (feedbackItems: Feedback[]): { text: string; value: number }[] => {
    const koreanStopWords = ['이', '그', '저', '것', '수', '등', '때', '한', '제', '저', '것', '들', '의', '에', '가', '로', '과', '와', '은', '는', '을', '를', '도', '만', '으로', '부터', '까지', '입니다', '합니다', '하고', '그리고', '있는', '있는', '대한', '위해', '하는', '정말', '너무', '같은'];
    
    const wordCounts: Record<string, number> = {};
    
    feedbackItems.forEach(f => {
        f.message.split(/\s+/).forEach(word => {
            const cleanWord = word.replace(/[.,!?]/g, '').trim();
            if (cleanWord && isNaN(Number(cleanWord)) && cleanWord.length > 1 && !koreanStopWords.includes(cleanWord)) {
                wordCounts[cleanWord] = (wordCounts[cleanWord] || 0) + 1;
            }
        });
    });

    return Object.entries(wordCounts)
        .map(([text, value]) => ({ text, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 50); // Take top 50 words
};


const categoryConfig = {
    Question: { icon: HelpCircle, text: '질문 🙋‍♀️', color: 'bg-blue-500/20 text-blue-400', ring: 'ring-blue-500', postit: 'bg-blue-200 text-blue-900' },
    Suggestion: { icon: Lightbulb, text: '제안 💡', color: 'bg-amber-500/20 text-amber-400', ring: 'ring-amber-500', postit: 'bg-yellow-200 text-yellow-900' },
    Praise: { icon: ThumbsUp, text: '칭찬 👍', color: 'bg-emerald-500/20 text-emerald-400', ring: 'ring-emerald-500', postit: 'bg-green-200 text-green-900' },
};

// Admin View Components
const ListView: React.FC<{ items: Feedback[], onToggle: (id: string) => void }> = ({ items, onToggle }) => (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
        {items.map(item => (
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
                        onClick={() => onToggle(item.id)}
                        className={`flex items-center gap-2 text-sm py-1 px-3 rounded-full transition-colors ${item.isAddressed ? 'bg-slate-600 text-slate-300' : 'bg-brand-emerald text-white hover:opacity-90'}`}
                    >
                        <CheckCircle size={16} />
                        <span>{item.isAddressed ? '확인됨' : '확인'}</span>
                    </button>
                </div>
            </div>
        ))}
    </div>
);

const PostItView: React.FC<{ items: Feedback[] }> = ({ items }) => (
    <div className="flex flex-wrap justify-center gap-4 p-4 min-h-[50vh] bg-yellow-900/20 rounded-lg bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]">
        {items.map((item, index) => {
            const rotations = ['-rotate-3', 'rotate-2', 'rotate-3', '-rotate-2', 'rotate-1', '-rotate-1'];
            return (
                <div key={item.id} className={`w-64 h-64 p-4 shadow-lg flex flex-col justify-between font-serif ${categoryConfig[item.category].postit} ${rotations[index % rotations.length]} transition-transform hover:scale-125 hover:z-10`}>
                    <p className="text-lg flex-grow overflow-y-auto">{item.message}</p>
                    <p className="text-right font-bold">- {item.name}</p>
                </div>
            );
        })}
    </div>
);

const WordCloudView: React.FC<{ items: Feedback[] }> = ({ items }) => {
    const [wordData, setWordData] = useState<{ text: string, value: number }[]>([]);

    useEffect(() => {
        setWordData(generateWordCloudData(items));
    }, [items]);

    if (wordData.length === 0) {
        return <div className="text-center text-slate-400 p-8 min-h-[50vh] flex items-center justify-center">피드백 데이터가 부족하여 워드 클라우드를 생성할 수 없습니다.</div>
    }

    const maxCount = Math.max(...wordData.map(d => d.value), 1);
    const colors = ['text-brand-indigo', 'text-brand-purple', 'text-brand-emerald', 'text-brand-amber', 'text-white', 'text-blue-400', 'text-teal-300'];
    const rotations = ['-rotate-6', 'rotate-3', 'rotate-6', '-rotate-3'];

    return (
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-3 p-4 min-h-[50vh]">
            {wordData.map((word, index) => {
                const fontSize = 1 + (word.value / maxCount) * 3.5;
                return (
                    <span
                        key={word.text}
                        className={`${colors[index % colors.length]} font-bold transition-all duration-300 inline-block ${rotations[index % rotations.length]}`}
                        style={{ fontSize: `${fontSize}rem`, lineHeight: '1' }}
                    >
                        {word.text}
                    </span>
                );
            })}
        </div>
    );
};


const FeedbackView: React.FC = () => {
    const { role, currentUser, feedback, addFeedback, toggleFeedbackAddressed } = useAppContext();
    const participantId = useParticipantId();

    // Participant state
    const [message, setMessage] = useState('');
    const [category, setCategory] = useState<FeedbackCategory>('Question');
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [isLoadingReply, setIsLoadingReply] = useState(false);
    
    // Admin state
    const [viewMode, setViewMode] = useState<'list' | 'postit' | 'wordcloud'>('list');


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            alert('피드백 내용을 입력해주세요.');
            return;
        }
        
        setIsLoadingReply(true);
        setSubmitted(true);
        
        const reply = await generateFeedbackReply(category);
        setReplyMessage(reply);
        setIsLoadingReply(false);

        addFeedback({
            participantId,
            name: isAnonymous ? '익명' : currentUser?.name || '익명',
            message,
            category,
        });

        setMessage('');
        setTimeout(() => setSubmitted(false), 4000);
    };

    if (role === '참가자') {
        if (submitted) {
            return (
                <div className="text-center max-w-md mx-auto bg-slate-800 p-8 rounded-2xl fade-in">
                    <CheckCircle className="w-16 h-16 text-brand-emerald mx-auto mb-4" />
                    <h2 className="text-3xl font-bold mb-2">피드백 제출 완료!</h2>
                    {isLoadingReply ? <Spinner/> : <p className="text-xl text-slate-300 italic">"{replyMessage}"</p>}
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
    const viewOptions = [
        { id: 'list', icon: List, label: '목록' },
        { id: 'postit', icon: StickyNote, label: '포스트잇' },
        { id: 'wordcloud', icon: Cloud, label: '워드클라우드' },
    ];

    return (
        <div className="bg-slate-800 p-6 rounded-2xl">
            <h2 className="text-2xl font-bold mb-4">실시간 피드백 현황 ({feedback.length}개)</h2>
            
            <div className="flex justify-center items-center gap-2 mb-4 p-1 rounded-full bg-slate-900 w-fit mx-auto">
                {viewOptions.map(opt => (
                     <button
                        key={opt.id}
                        onClick={() => setViewMode(opt.id as 'list' | 'postit' | 'wordcloud')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-colors ${viewMode === opt.id ? 'bg-brand-purple text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                    >
                        <opt.icon size={16} />
                        <span>{opt.label}</span>
                    </button>
                ))}
            </div>

            {feedback.length === 0 ? (
                <p className="text-slate-400 text-center py-8">아직 제출된 피드백이 없습니다.</p>
            ) : (
                <>
                    {viewMode === 'list' && <ListView items={feedback} onToggle={toggleFeedbackAddressed} />}
                    {viewMode === 'postit' && <PostItView items={feedback} />}
                    {viewMode === 'wordcloud' && <WordCloudView items={feedback} />}
                </>
            )}
        </div>
    );
};

export default FeedbackView;