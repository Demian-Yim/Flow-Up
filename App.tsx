import React, { useState } from 'react';
import Dashboard from './features/Dashboard';
import AttendanceView from './features/attendance/AttendanceView';
import IntroductionsView from './features/introductions/IntroductionsView';
import TeamBuilderView from './features/teams/TeamBuilderView';
import ScoreboardView from './features/scoreboard/ScoreboardView';
import MotivationView from './features/motivation/MotivationView';
import FeedbackView from './features/feedback/FeedbackView';
import NetworkingView from './features/networking/NetworkingView';
import AmbianceView from './features/ambiance/AmbianceView';
import MealSelectorView from './features/meals/MealSelectorView';
import { TOOLS } from './constants';
import { Tool, Role } from './types';
import Header from './components/Header';
import { useAppContext } from './context/AppContext';


const App: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const { role, setRole } = useAppContext();

    const renderActiveTool = () => {
        if (!activeTool) return <Dashboard onSelectTool={setActiveTool} />;
        
        switch (activeTool.id) {
            case 'attendance': return <AttendanceView />;
            case 'introductions': return <IntroductionsView />;
            case 'teams': return <TeamBuilderView />;
            case 'scoreboard': return <ScoreboardView />;
            case 'motivation': return <MotivationView />;
            case 'feedback': return <FeedbackView />;
            case 'networking': return <NetworkingView />;
            case 'ambiance': return <AmbianceView />;
            case 'meals': return <MealSelectorView />;
            default: return <Dashboard onSelectTool={setActiveTool} />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            <Header
                title={activeTool ? activeTool.title : 'Flow~ Up (플로우~ 업)'}
                showBackButton={!!activeTool}
                onBack={() => setActiveTool(null)}
                currentRole={role}
                onRoleChange={setRole}
            />
            <main className="p-4 sm:p-6 lg:p-8">
                {renderActiveTool()}
            </main>
        </div>
    );
};

export default App;