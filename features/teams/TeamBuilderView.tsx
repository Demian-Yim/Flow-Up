
import React, { useState } from 'react';
import { Users, Shuffle, Sparkles, Wand2 } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Team } from '../../types';
import { generateTeamNames } from '../../services/geminiService';
import Spinner from '../../components/Spinner';

const TeamBuilderView: React.FC = () => {
    const { role, participants, teams, setTeams, currentUser } = useAppContext();
    const [teamSize, setTeamSize] = useState(4);
    const [keywords, setKeywords] = useState('');
    const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
    const [isLoadingNames, setIsLoadingNames] = useState(false);

    const handleCreateTeams = () => {
        if (participants.length === 0) {
            alert('참가자가 없습니다.');
            return;
        }
        const shuffled = [...participants].sort(() => 0.5 - Math.random());
        const numTeams = Math.ceil(shuffled.length / teamSize);
        const newTeams: Team[] = Array.from({ length: numTeams }, (_, i) => ({
            id: `team_${Date.now()}_${i}`,
            name: `팀 ${i + 1}`,
            members: shuffled.slice(i * teamSize, (i + 1) * teamSize),
        }));
        setTeams(newTeams);
        setSuggestedNames([]);
    };

    const handleGenerateNames = async () => {
        if (!keywords.trim()) {
            alert('팀명 생성을 위한 키워드를 입력해주세요.');
            return;
        }
        setIsLoadingNames(true);
        const names = await generateTeamNames(keywords);
        setSuggestedNames(names);
        setIsLoadingNames(false);
    };

    const applyTeamName = (name: string, index: number) => {
        const newTeams = [...teams];
        newTeams[index].name = name;
        setTeams(newTeams);
    };

    const myTeam = teams.find(team => team.members.some(member => member.id === currentUser?.id));

    if (role === '참가자') {
        return (
            <div className="max-w-md mx-auto bg-slate-800 p-8 rounded-2xl text-center">
                 <h2 className="text-2xl font-bold mb-4">나의 팀 ✨</h2>
                 {myTeam ? (
                     <div className="bg-gradient-to-br from-brand-indigo to-brand-purple p-6 rounded-xl shadow-lg">
                        <h3 className="text-3xl font-bold mb-4">{myTeam.name}</h3>
                        <ul className="space-y-2">
                            {myTeam.members.map(member => (
                                <li key={member.id} className="text-lg bg-white/10 px-4 py-2 rounded-md">{member.name}</li>
                            ))}
                        </ul>
                     </div>
                 ) : (
                    <div className="text-slate-400">
                        <Users className="w-16 h-16 mx-auto mb-4" />
                        <p>아직 팀이 배정되지 않았습니다.</p>
                        <p>관리자가 팀 구성을 완료할 때까지 잠시만 기다려주세요.</p>
                    </div>
                 )}
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-2xl">
                 <h2 className="text-2xl font-bold mb-4">팀 구성하기</h2>
                 <div className="flex flex-wrap items-center gap-4">
                     <label htmlFor="team-size">팀당 인원:</label>
                     <input
                        id="team-size"
                        type="number"
                        value={teamSize}
                        onChange={(e) => setTeamSize(Number(e.target.value))}
                        className="w-20 bg-slate-700 text-white px-3 py-2 rounded-lg border-2 border-slate-600 focus:outline-none focus:border-brand-purple"
                        min="2"
                     />
                     <button onClick={handleCreateTeams} className="flex items-center gap-2 bg-gradient-to-r from-brand-indigo to-brand-purple text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:opacity-90 transition-opacity">
                         <Shuffle size={18} />
                         <span>팀 자동 생성</span>
                     </button>
                 </div>
            </div>

            {teams.length > 0 && (
                <div className="bg-slate-800 p-6 rounded-2xl">
                     <h2 className="text-2xl font-bold mb-4">AI 팀명 생성</h2>
                     <div className="flex flex-wrap items-center gap-4">
                         <input
                            type="text"
                            value={keywords}
                            onChange={(e) => setKeywords(e.target.value)}
                            placeholder="팀 특징 키워드 입력 (예: 혁신, 열정, 도전)"
                            className="flex-grow bg-slate-700 text-white px-3 py-2 rounded-lg border-2 border-slate-600 focus:outline-none focus:border-brand-purple"
                         />
                         <button onClick={handleGenerateNames} disabled={isLoadingNames} className="flex items-center gap-2 bg-gradient-to-r from-brand-emerald to-teal-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50">
                            {isLoadingNames ? <Spinner /> : <><Sparkles size={18} /> <span>팀명 추천받기</span></>}
                         </button>
                     </div>
                      {suggestedNames.length > 0 && (
                        <div className="mt-4">
                            <h3 className="font-bold mb-2">추천 팀명:</h3>
                            <div className="flex flex-wrap gap-2">
                                {suggestedNames.map(name => (
                                    <span key={name} className="bg-slate-700 px-3 py-1 rounded-full text-sm">{name}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teams.map((team, index) => (
                    <div key={team.id} className="bg-slate-800 p-4 rounded-xl space-y-3">
                         <div className="flex justify-between items-center">
                            <input 
                                type="text"
                                value={team.name}
                                onChange={(e) => applyTeamName(e.target.value, index)}
                                className="text-xl font-bold bg-transparent border-b-2 border-slate-700 focus:outline-none focus:border-brand-purple"
                            />
                            {suggestedNames.length > 0 && (
                               <button onClick={() => applyTeamName(suggestedNames[index % suggestedNames.length], index)} title="추천 이름 적용" className="text-slate-400 hover:text-brand-amber">
                                   <Wand2 size={18} />
                               </button>
                            )}
                         </div>
                         <ul className="space-y-2">
                             {team.members.map(member => (
                                 <li key={member.id} className="bg-slate-700 px-3 py-2 rounded-md">{member.name}</li>
                             ))}
                         </ul>
                    </div>
                ))}
            </div>
        </div>
    )
};

export default TeamBuilderView;