import React, { useState, useEffect } from 'react';
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
import WrapUpView from './features/wrapup/WrapUpView';
import { TOOLS } from './constants';
import { Tool, Role } from './types';
import Header from './components/Header';
import ParticipantNav from './components/ParticipantNav';
import { useAppContext } from './context/AppContext';
import { useParticipantId } from './hooks/useParticipantId';
import Footer from './components/Footer';
import Spinner from './components/Spinner';


const App: React.FC = () => {
    const [activeTool, setActiveTool] = useState<Tool | null>(null);
    const { role, participants, currentUser, setCurrentUser, isLoading } = useAppContext();
    const participantId = useParticipantId();

    useEffect(() => {
        if (role === Role.Participant && !currentUser && participantId && participants.length > 0) {
            const user = participants.find(p => p.id === participantId);
            if (user) {
                setCurrentUser(user);
            }
        }
    }, [role, participants, currentUser, participantId, setCurrentUser]);

    const activeToolIndex = activeTool ? TOOLS.findIndex(t => t.id === activeTool.id) : -1;

    const handleNav = (direction: 'next' | 'prev' | 'home') => {
        if (direction === 'home') {
            setActiveTool(null);
            return;
        }

        const newIndex = direction === 'next' ? activeToolIndex + 1 : activeToolIndex - 1;
        if (newIndex >= 0 && newIndex < TOOLS.length) {
            setActiveTool(TOOLS[newIndex]);
        }
    };

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
            case 'wrapup': return <WrapUpView />;
            default: return <Dashboard onSelectTool={setActiveTool} />;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-center items-center">
                <Spinner />
                <p className="mt-4 text-slate-400">워크숍 데이터를 서버에서 불러오는 중입니다...</p>
            </div>
        );
    }

    const isParticipantNavVisible = role === Role.Participant && activeTool;

    return (
        <div className={`min-h-screen bg-slate-900 text-white ${isParticipantNavVisible ? 'pb-24' : 'pb-16'}`}>
            <Header
                title={activeTool ? activeTool.title : 'Flow~ Link'}
                showBackButton={!!activeTool}
                onBack={() => setActiveTool(null)}
            />
            <main className="p-4 sm:p-6 lg:p-8">
                {renderActiveTool()}
            </main>
            {isParticipantNavVisible ? (
                <ParticipantNav
                    onNav={handleNav}
                    currentIndex={activeToolIndex}
                    totalTools={TOOLS.length}
                />
            ) : (
                <Footer />
            )}
        </div>
    );
};

export default App;