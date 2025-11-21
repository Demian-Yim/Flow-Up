import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { Participant, Role, Introduction, Team, Meal, MealSelection, Feedback, NetworkingInterest, NetworkingMatch, AmbiancePlaylist, AmbianceMood, TeamScore, WorkshopSummary, RestaurantInfo, WorkshopNotice } from '../types';
import { generateNetworkingMatches, generateYouTubePlaylists, generateWorkshopSummaries, generateMenuItems, dbService } from '../services/geminiService';
import { DEFAULT_AMBIANCE_PLAYLIST } from '../constants';

interface AppContextType {
    isLoading: boolean;
    role: Role;
    setRole: (role: Role) => void;
    participants: Participant[];
    addParticipant: (participant: Participant) => void;
    removeParticipant: (participantId: string) => void;
    currentUser: Participant | null;
    setCurrentUser: (participant: Participant | null) => void;
    introductions: Introduction[];
    addIntroduction: (introduction: Introduction) => void;
    teams: Team[];
    setTeams: (teams: Team[]) => void;
    moveParticipantToTeam: (participantId: string, newTeamId: string) => void;
    scores: TeamScore[];
    updateScore: (teamId: string, delta: number) => void;
    restaurantInfo: RestaurantInfo | null;
    meals: Meal[];
    fetchMenu: (restaurantQuery: string) => Promise<void>;
    addMeal: (meal: Omit<Meal, 'id'>) => void;
    updateMeal: (meal: Meal) => void;
    deleteMeal: (mealId: number) => void;
    selections: MealSelection[];
    addSelection: (selection: MealSelection) => void;
    feedback: Feedback[];
    addFeedback: (newFeedback: Omit<Feedback, 'id' | 'timestamp' | 'isAddressed'>) => void;
    toggleFeedbackAddressed: (id: string) => void;
    networkingInterests: NetworkingInterest[];
    networkingMatches: Record<string, NetworkingMatch[]>;
    addNetworkingInterest: (interest: NetworkingInterest) => Promise<void>;
    ambiancePlaylist: AmbiancePlaylist | null;
    generateAmbiancePlaylist: (mood: AmbianceMood) => Promise<void>;
    workshopSummary: WorkshopSummary | null;
    generateWorkshopSummary: () => Promise<void>;
    isAdminAuthenticated: boolean;
    loginAdmin: (password: string) => boolean;
    workshopNotice: WorkshopNotice | null;
    updateWorkshopNotice: (notice: WorkshopNotice) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_NOTICE: WorkshopNotice = {
    title: '<9/15 (월) AI 코칭> “내 일”을 바꾸는 AI 200% 활용법',
    date: '2025년 9월 15일(월) 10:00 - 17:00',
    arrivalInfo: '노트북의 안정적 세팅을 위해, 9:40까지 도착을 추천 드립니다.',
    requirements: '노트북 전원케이블, 마우스, 구글지메일 계정, 챗지피티/제미나이유료계정 로그인',
    surveyLink: 'https://ai200.netlify.app/#/',
    locationName: '구루피플스 강의장',
    locationAddress: '서울 서초구 방배로15길 7 위니드빌딩 2층 (7호선 내방역, 2호선 방배역 5분거리)',
    mapLink: 'https://naver.me/GgWNgrJ69'
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState<Role>(Role.Participant);
    
    // Data States
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currentUser, setCurrentUser] = useState<Participant | null>(null);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [networkingInterests, setNetworkingInterests] = useState<NetworkingInterest[]>([]);
    
    // Config States (from single doc)
    const [introductions, setIntroductions] = useState<Introduction[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [scores, setScores] = useState<TeamScore[]>([]);
    const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>({name: '순남시래기 방배점', address: '', mapUrl: ''});
    const [meals, setMeals] = useState<Meal[]>([]);
    const [selections, setSelections] = useState<MealSelection[]>([]);
    const [ambiancePlaylist, setAmbiancePlaylist] = useState<AmbiancePlaylist | null>(DEFAULT_AMBIANCE_PLAYLIST);
    const [workshopSummary, setWorkshopSummary] = useState<WorkshopSummary | null>(null);
    const [workshopNotice, setWorkshopNotice] = useState<WorkshopNotice | null>(DEFAULT_NOTICE);
    
    // Local Derived State
    const [networkingMatches, setNetworkingMatches] = useState<Record<string, NetworkingMatch[]>>({});
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
    
    const ADMIN_PASSWORD = 'inamoment';

    // --- Real-time Listeners for separate collections ---
    useEffect(() => {
        // 1. Participants
        const unsubParticipants = dbService.listenToParticipants((data) => {
            setParticipants(data);
        });

        // 2. Feedback
        const unsubFeedback = dbService.listenToFeedback((data) => {
            setFeedback(data);
        });

        // 3. Networking
        const unsubNetworking = dbService.listenToNetworking((data) => {
            setNetworkingInterests(data);
            if(data.length >= 2) {
                generateNetworkingMatches(data).then(setNetworkingMatches);
            }
        });

        // 4. Global Config (Teams, Scores, Meals, etc.)
        const unsubConfig = dbService.listenToConfig((data) => {
            setIntroductions(data.introductions || []);
            setTeams(data.teams || []);
            setScores(data.scores || []);
            setRestaurantInfo(data.restaurantInfo || {name: '순남시래기 방배점', address: '', mapUrl: ''});
            setMeals(data.meals || []);
            setSelections(data.selections || []);
            setAmbiancePlaylist(data.ambiancePlaylist || DEFAULT_AMBIANCE_PLAYLIST);
            setWorkshopSummary(data.workshopSummary || null);
            setWorkshopNotice(data.workshopNotice || DEFAULT_NOTICE);
            setIsLoading(false);
        });

        return () => {
            unsubParticipants();
            unsubFeedback();
            unsubNetworking();
            unsubConfig();
        };
    }, []);


    // --- Actions that write to DB ---

    const addParticipant = (participant: Participant) => {
        dbService.addParticipant(participant);
        if(role === Role.Participant) {
          setCurrentUser(participant);
        }
    };

    const removeParticipant = (participantId: string) => {
        if (currentUser && currentUser.id === participantId) {
            setCurrentUser(null);
        }
        dbService.removeParticipant(participantId);
        
        // Remove from teams locally to update config
        const updatedTeams = teams.map(team => ({
            ...team,
            members: team.members.filter(member => member.id !== participantId),
        })).filter(team => team.members.length > 0);
        
        // Remove introductions, selections, etc. from Config
        const updatedIntros = introductions.filter(i => i.participantId !== participantId);
        const updatedSelections = selections.filter(s => s.participantId !== participantId);

        dbService.updateConfig({
            teams: updatedTeams,
            introductions: updatedIntros,
            selections: updatedSelections
        });
    };

    const addIntroduction = (introduction: Introduction) => {
        const newIntros = [...introductions];
        const existingIndex = newIntros.findIndex(i => i.participantId === introduction.participantId);
        if (existingIndex > -1) {
            newIntros[existingIndex] = introduction;
        } else {
            newIntros.push(introduction);
        }
        dbService.updateConfig({ introductions: newIntros });
    };

    const updateTeams = useCallback((newTeams: Team[]) => {
        // Logic to sync scores with team structure changes
        const scoresMap = new Map<string, number>();
        scores.forEach(s => scoresMap.set(s.teamId, s.score));

        let updatedScores = newTeams.map(team => ({
            teamId: team.id,
            name: team.name,
            score: scoresMap.get(team.id) || 0,
        }));
        
        // Keep old scores if teams exist in both
        const existingScores = new Set(newTeams.map(t => t.id));
        const oldScores = scores.filter(s => !existingScores.has(s.teamId));
        updatedScores = [...updatedScores, ...oldScores.filter(os => !updatedScores.find(us => us.teamId === os.teamId))];
        updatedScores.sort((a,b) => b.score - a.score);

        dbService.updateConfig({ teams: newTeams, scores: updatedScores });
    }, [scores]);
    
    const moveParticipantToTeam = (participantId: string, newTeamId: string) => {
        let participantToMove: Participant | undefined;
        const teamsWithoutParticipant = teams.map(team => {
            const memberIndex = team.members.findIndex(m => m.id === participantId);
            if (memberIndex > -1) {
                participantToMove = team.members[memberIndex];
                return { ...team, members: team.members.filter(m => m.id !== participantId) };
            }
            return team;
        });

        if (!participantToMove) return;

        const newTeams = teamsWithoutParticipant.map(team => {
            if (team.id === newTeamId) {
                return { ...team, members: [...team.members, participantToMove!].sort((a,b) => a.name.localeCompare(b.name)) };
            }
            return team;
        });

        updateTeams(newTeams.filter(team => team.members.length > 0));
    };

    const updateScore = (teamId: string, delta: number) => {
        const newScores = scores.map(s => 
            s.teamId === teamId ? { ...s, score: Math.min(10000000, Math.max(0, s.score + delta * 10)) } : s
        );
        newScores.sort((a, b) => b.score - a.score);
        dbService.updateConfig({ scores: newScores });
    };

    const fetchMenu = async (restaurantQuery: string) => {
        const menuData = await generateMenuItems(restaurantQuery);
        const newMeals: Meal[] = menuData.menus.map((meal, index) => ({
            ...meal,
            id: Date.now() + index,
            stock: 20,
        }));
        dbService.updateConfig({
            restaurantInfo: menuData.restaurantInfo,
            meals: newMeals,
            selections: []
        });
    };

    const addMeal = (meal: Omit<Meal, 'id'>) => {
        const newMeal: Meal = { ...meal, id: Date.now() };
        dbService.updateConfig({ meals: [...meals, newMeal] });
    };

    const updateMeal = (updatedMeal: Meal) => {
        const updatedMeals = meals.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal);
        dbService.updateConfig({ meals: updatedMeals });
    };

    const deleteMeal = (mealId: number) => {
        const updatedMeals = meals.filter(meal => meal.id !== mealId);
        dbService.updateConfig({ meals: updatedMeals });
    };

    const addSelection = (selection: MealSelection) => {
        const newSelections = selections.filter(s => s.participantId !== selection.participantId);
        newSelections.push(selection);
        dbService.updateConfig({ selections: newSelections });
    };
    
    const addFeedback = (newFeedback: Omit<Feedback, 'id' | 'timestamp' | 'isAddressed'>) => {
        const feedbackItem: Feedback = {
            ...newFeedback,
            id: `feedback_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            timestamp: Date.now(),
            isAddressed: false,
        };
        dbService.addFeedback(feedbackItem);
    };

    const toggleFeedbackAddressed = (id: string) => {
        const item = feedback.find(f => f.id === id);
        if(item) {
            dbService.toggleFeedbackAddressed(id, !item.isAddressed);
        }
    };

    const addNetworkingInterest = async (interest: NetworkingInterest) => {
        dbService.addNetworkingInterest(interest);
    };
    
    const generateAmbiancePlaylist = async (mood: AmbianceMood) => {
        const moodMap = {
            Focus: '일에 집중할 때 듣기 좋은 편안한 연주곡',
            Break: '휴식 시간에 어울리는 잔잔하고 부드러운 음악',
            Brainstorming: '창의적인 아이디어를 자극하는 영감 넘치는 음악',
            HighEnergy: '분위기를 끌어올리는 신나고 에너지 넘치는 음악'
        };
        const playlists = await generateYouTubePlaylists(moodMap[mood]);
        dbService.updateConfig({ ambiancePlaylist: { mood, playlists } });
    };

    const generateWorkshopSummary = async () => {
        const summaries = await generateWorkshopSummaries(feedback, networkingInterests, ambiancePlaylist, scores);
        dbService.updateConfig({ 
            workshopSummary: { ...summaries, generatedAt: new Date().toISOString() } 
        });
    };

    const loginAdmin = (password: string): boolean => {
        if (password === ADMIN_PASSWORD) {
            setIsAdminAuthenticated(true);
            return true;
        }
        return false;
    };
    
    const updateWorkshopNotice = (notice: WorkshopNotice) => {
        dbService.updateConfig({ workshopNotice: notice });
    };

    return (
        <AppContext.Provider value={{
            isLoading,
            role, setRole,
            participants, addParticipant, removeParticipant,
            currentUser, setCurrentUser,
            introductions, addIntroduction,
            teams, setTeams: updateTeams, moveParticipantToTeam,
            scores, updateScore,
            restaurantInfo, meals, fetchMenu, addMeal, updateMeal, deleteMeal, 
            selections, addSelection,
            feedback, addFeedback, toggleFeedbackAddressed,
            networkingInterests, networkingMatches, addNetworkingInterest,
            ambiancePlaylist, generateAmbiancePlaylist,
            workshopSummary, generateWorkshopSummary,
            isAdminAuthenticated, loginAdmin,
            workshopNotice, updateWorkshopNotice
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};