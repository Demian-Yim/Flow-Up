import React, { useState } from 'react';
import Spinner from '../../components/Spinner';
import { Lightbulb, RefreshCw } from 'lucide-react';
import { generateMotivation } from '../../services/geminiService';

const MotivationView: React.FC = () => {
    const [topic, setTopic] = useState('');
    const [quote, setQuote] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const exampleTopics = ['영화 명대사', '성장에 관한 책 구절', '팀워크 명언', '도전', '리더십'];

    const handleGenerate = async (selectedTopic?: string) => {
        const currentTopic = selectedTopic || topic || '도전과 성장';
        setIsLoading(true);
        const result = await generateMotivation(currentTopic);
        setQuote(result);
        setTopic(currentTopic);
        setIsLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto text-center">
            <div className="p-4 inline-block rounded-2xl bg-gradient-to-br from-brand-amber to-orange-500 mb-4">
                <Lightbulb className="h-12 w-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">에너지 부스터 🔥</h2>
            <p className="text-slate-400 mb-6">워크숍의 흐름에 맞는 동기부여 명언으로 에너지를 충전하세요.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                 <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="주제 (예: 영화 명대사, 팀워크, 책 구절...)"
                    className="flex-grow w-full px-4 py-3 bg-slate-800 text-white border-2 border-slate-700 rounded-lg focus:outline-none focus:border-brand-purple transition-colors"
                />
                <button
                    onClick={() => handleGenerate()}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                    {isLoading ? <Spinner /> : <><RefreshCw size={18} /><span>새 명언 받기</span></>}
                </button>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-8">
                <span className="text-sm text-slate-500 self-center">키워드 예시:</span>
                {exampleTopics.map(exTopic => (
                    <button 
                        key={exTopic}
                        onClick={() => handleGenerate(exTopic)}
                        className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm hover:bg-brand-purple hover:text-white transition-colors"
                    >
                        {exTopic}
                    </button>
                ))}
            </div>


            {quote && (
                <div className="fade-in">
                     <blockquote className="relative p-8 bg-slate-800 rounded-2xl border-l-4 border-brand-amber">
                        <p className="text-2xl italic font-medium text-white">"{quote}"</p>
                    </blockquote>
                </div>
            )}
        </div>
    );
};

export default MotivationView;