
import React from 'react';
import { Tool } from '../types';

interface ToolCardProps {
    tool: Tool;
    onSelect: (tool: Tool) => void;
    style: React.CSSProperties;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect, style }) => {
    const Icon = tool.icon;
    return (
        <div
            className="bg-slate-800 p-6 rounded-2xl shadow-lg hover:shadow-brand-purple/50 transition-all duration-300 transform hover:-translate-y-2 cursor-pointer fade-in"
            onClick={() => onSelect(tool)}
            style={style}
        >
            <div className="mb-4 inline-block p-3 rounded-xl bg-gradient-to-br from-brand-indigo to-brand-purple">
                <Icon className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{tool.title}</h3>
            <p className="text-slate-400">{tool.description}</p>
        </div>
    );
};

export default ToolCard;
