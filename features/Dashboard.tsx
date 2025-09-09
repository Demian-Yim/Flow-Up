
import React from 'react';
import { Tool } from '../types';
import { TOOLS } from '../constants';
import ToolCard from '../components/ToolCard';
import { useAppContext } from '../context/AppContext';

interface DashboardProps {
    onSelectTool: (tool: Tool) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
    const { currentUser } = useAppContext();
    
    const welcomeTitle = currentUser ? `${currentUser.name}님, 당신의 아이디어가 빛날 시간이에요! ✨` : '워크숍의 새로운 흐름에 올라탈 준비, 되셨나요?';
    const welcomeSubtitle = currentUser ? '아래 도구들로 잠재력을 깨우고, 워크숍을 레벨업 시켜보세요!' : '탭 한 번으로, 평범한 워크숍이 특별한 경험으로 바뀝니다.';

    return (
        <div className="space-y-8">
            <div className="text-center p-6 rounded-2xl bg-slate-800/50">
                <h1 className="text-4xl font-bold text-white mb-2 fade-in">{welcomeTitle}</h1>
                <p className="text-slate-300 text-lg fade-in" style={{ animationDelay: '0.2s' }}>{welcomeSubtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {TOOLS.map((tool, index) => (
                    <ToolCard
                        key={tool.id}
                        tool={tool}
                        onSelect={onSelectTool}
                        style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Dashboard;
