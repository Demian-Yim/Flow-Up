import React from 'react';
import { ChevronLeft, Zap, User, Shield } from 'lucide-react';
import { Role } from '../types';
import { useAppContext } from '../context/AppContext';

interface HeaderProps {
    title: string;
    showBackButton: boolean;
    onBack: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, showBackButton, onBack }) => {
    const { role, setRole, isAdminAuthenticated, loginAdmin } = useAppContext();

    const handleAdminClick = () => {
        if (isAdminAuthenticated) {
            setRole(Role.Admin);
        } else {
            const password = prompt("관리자 비밀번호를 입력하세요:", "");
            if (password !== null) { // User didn't click cancel
                if (loginAdmin(password)) {
                    setRole(Role.Admin);
                } else {
                    alert("비밀번호가 올바르지 않습니다.");
                }
            }
        }
    };

    return (
        <header className="sticky top-0 z-10 bg-gradient-to-r from-brand-indigo via-brand-purple to-purple-500 p-4 shadow-lg text-white flex items-center justify-between">
            <div className="flex items-center gap-4">
                {showBackButton ? (
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                        <ChevronLeft size={24} />
                    </button>
                ) : (
                    <div className="p-2 bg-white/20 rounded-lg">
                        <Zap size={24} />
                    </div>
                )}
                <h1 className="text-xl font-bold truncate">{title}</h1>
            </div>
             <div className="flex items-center space-x-2 p-1 rounded-full bg-black/20">
                <button
                    onClick={() => setRole(Role.Participant)}
                    aria-label="참가자 모드"
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${role === Role.Participant ? 'bg-white text-brand-purple font-bold' : 'text-white'}`}
                >
                    <User size={16} />
                    <span>{Role.Participant}</span>
                </button>
                <button
                    onClick={handleAdminClick}
                    aria-label="관리자 모드"
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${role === Role.Admin ? 'bg-white text-brand-purple font-bold' : 'text-white'}`}
                >
                    <Shield size={16} />
                    <span>{Role.Admin}</span>
                </button>
            </div>
        </header>
    );
};

export default Header;