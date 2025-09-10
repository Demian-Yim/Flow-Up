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
    
    const welcomeTitle = currentUser ? `👋 ${currentUser.name}님, 환영합니다!` : 'Flow~ Link에 오신 것을 환영합니다!';
    const welcomeSubtitle = `물 흐르듯 자연스러운 워크숍을 위해, 아래에서 원하는 기능을 선택해 보아요~`;

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