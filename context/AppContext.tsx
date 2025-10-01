import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useRef, useMemo } from 'react';
import { Participant, Role, Introduction, Team, Meal, MealSelection, Feedback, NetworkingInterest, NetworkingMatch, AmbiancePlaylist, AmbianceMood, TeamScore, WorkshopSummary, RestaurantInfo, WorkshopNotice } from '../types';
import { generateNetworkingMatches, generateYouTubePlaylists, generateWorkshopSummaries, generateMenuItems, saveWorkshopData, listenForWorkshopUpdates } from '../services/geminiService';
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

const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    const debounced = (...args: Parameters<F>) => {
        if (timeout !== null) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => func(...args), waitFor);
    };
    return debounced as (...args: Parameters<F>) => void;
};

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

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState<Role>(Role.Participant);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currentUser, setCurrentUser] = useState<Participant | null>(null);
    const [introductions, setIntroductions] = useState<Introduction[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [scores, setScores] = useState<TeamScore[]>([]);
    const [restaurantInfo, setRestaurantInfo] = useState<RestaurantInfo | null>({name: '순남시래기 방배점', address: '', mapUrl: ''});
    const [meals, setMeals] = useState<Meal[]>([]);
    const [selections, setSelections] = useState<MealSelection[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [networkingInterests, setNetworkingInterests] = useState<NetworkingInterest[]>([]);
    const [networkingMatches, setNetworkingMatches] = useState<Record<string, NetworkingMatch[]>>({});
    const [ambiancePlaylist, setAmbiancePlaylist] = useState<AmbiancePlaylist | null>(null);
    const [workshopSummary, setWorkshopSummary] = useState<WorkshopSummary | null>(null);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);
    const [workshopNotice, setWorkshopNotice] = useState<WorkshopNotice | null>(DEFAULT_NOTICE);
    
    const ADMIN_PASSWORD = 'inamoment';

    const updateTeams = useCallback((newTeams: Team[]) => {
        setTeams(newTeams);
        setScores(prevScores => {
            const scoresMap = new Map<string, number>();
            prevScores.forEach(s => scoresMap.set(s.teamId, s.score));
    
            let updatedScores = newTeams.map(team => ({
                teamId: team.id,
                name: team.name,
                score: scoresMap.get(team.id) || 0,
            }));
            
            const existingScores = new Set(newTeams.map(t => t.id));
            const oldScores = prevScores.filter(s => !existingScores.has(s.teamId));

            updatedScores = [...updatedScores, ...oldScores.filter(os => !updatedScores.find(us => us.teamId === os.teamId))];
            
            updatedScores.sort((a,b) => b.score - a.score);
            return updatedScores;
        });
    }, []);

    // Effect for real-time data synchronization with Firestore
    useEffect(() => {
        const unsubscribe = listenForWorkshopUpdates((data) => {
            console.log("Firestore data updated, syncing state...");
            setIsLoading(true);
            setRole(data.role || Role.Participant);
            setParticipants(data.participants || []);
            setIntroductions(data.introductions || []);
            updateTeams(data.teams || []);
            setScores(data.scores || []);
            setRestaurantInfo(data.restaurantInfo || {name: '순남시래기 방배점', address: '', mapUrl: ''});
            setMeals(data.meals || []);
            setSelections(data.selections || []);
            setFeedback(data.feedback || []);
            setNetworkingInterests(data.networkingInterests || []);
            if(data.networkingInterests && data.networkingInterests.length >= 2) {
                generateNetworkingMatches(data.networkingInterests).then(setNetworkingMatches);
            }
            setAmbiancePlaylist(data.ambiancePlaylist || DEFAULT_AMBIANCE_PLAYLIST);
            setWorkshopSummary(data.workshopSummary || null);
            setWorkshopNotice(data.workshopNotice || DEFAULT_NOTICE);
            setIsAdminAuthenticated(data.isAdminAuthenticated || false);
            setIsLoading(false);
        });

        // Cleanup subscription on unmount
        // FIX: Directly return the unsubscribe function for the useEffect cleanup.
        return unsubscribe;
    // Fix: The useEffect for setting up a listener should only run once on mount.
    // The functions it uses are all stable, so an empty dependency array is correct and clearer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stateRef = useRef<any>();
    stateRef.current = {
        role, participants, introductions, teams, scores, restaurantInfo, meals, selections, 
        feedback, networkingInterests, ambiancePlaylist, workshopSummary, isAdminAuthenticated,
        workshopNotice
    };

    const debouncedSave = useMemo(
        () => debounce((dataToSave: any) => {
            if (!isLoading) {
                saveWorkshopData(dataToSave);
            }
        }, 1000),
        [isLoading]
    );

    useEffect(() => {
        if (!isLoading) {
            debouncedSave(stateRef.current);
        }
    }, [role, participants, introductions, teams, scores, restaurantInfo, meals, selections, feedback, networkingInterests, ambiancePlaylist, workshopSummary, isAdminAuthenticated, workshopNotice, debouncedSave, isLoading]);

    const addParticipant = (participant: Participant) => {
        setParticipants(prev => {
            if (prev.find(p => p.id === participant.id)) {
                return prev.map(p => p.id === participant.id ? participant : p);
            }
            return [...prev, participant];
        });
        if(role === Role.Participant) {
          setCurrentUser(participant);
        }
    };

    const removeParticipant = (participantId: string) => {
        if (currentUser && currentUser.id === participantId) {
            setCurrentUser(null);
        }

        setParticipants(prev => prev.filter(p => p.id !== participantId));
        setIntroductions(prev => prev.filter(i => i.participantId !== participantId));
        setSelections(prev => prev.filter(s => s.participantId !== participantId));
        setFeedback(prev => prev.filter(f => f.participantId !== participantId));
        setNetworkingInterests(prev => prev.filter(ni => ni.participantId !== participantId));

        const updatedTeams = teams
            .map(team => ({
                ...team,
                members: team.members.filter(member => member.id !== participantId),
            }))
            .filter(team => team.members.length > 0);
        
        updateTeams(updatedTeams);
    };

    const addIntroduction = (introduction: Introduction) => {
        setIntroductions(prev => {
            const existingIndex = prev.findIndex(i => i.participantId === introduction.participantId);
            if (existingIndex > -1) {
                const newIntros = [...prev];
                newIntros[existingIndex] = introduction;
                return newIntros;
            }
            return [...prev, introduction];
        });
    };
    
    const moveParticipantToTeam = (participantId: string, newTeamId: string) => {
        let participantToMove: Participant | undefined;
        
        const teamsWithoutParticipant = teams.map(team => {
            const memberIndex = team.members.findIndex(m => m.id === participantId);
            if (memberIndex > -1) {
                participantToMove = team.members[memberIndex];
                return {
                    ...team,
                    members: team.members.filter(m => m.id !== participantId),
                };
            }
            return team;
        });

        if (!participantToMove) return;

        const newTeams = teamsWithoutParticipant.map(team => {
            if (team.id === newTeamId) {
                return {
                    ...team,
                    members: [...team.members, participantToMove!].sort((a,b) => a.name.localeCompare(b.name)),
                };
            }
            return team;
        });

        updateTeams(newTeams.filter(team => team.members.length > 0));
    };

    const updateScore = (teamId: string, delta: number) => {
        setScores(prevScores => {
            const newScores = prevScores.map(s => 
                s.teamId === teamId ? { ...s, score: Math.min(10000000, Math.max(0, s.score + delta * 10)) } : s
            );
            newScores.sort((a, b) => b.score - a.score);
            return newScores;
        });
    };

    // Meal management
    const fetchMenu = async (restaurantQuery: string) => {
        const menuData = await generateMenuItems(restaurantQuery);
        const newMeals: Meal[] = menuData.menus.map((meal, index) => ({
            ...meal,
            id: Date.now() + index,
            stock: 20,
        }));
        setRestaurantInfo(menuData.restaurantInfo);
        setMeals(newMeals);
        setSelections([]); // Clear selections when menu changes
    };

    const addMeal = (meal: Omit<Meal, 'id'>) => {
        const newMeal: Meal = { ...meal, id: Date.now() };
        setMeals(prev => [...prev, newMeal]);
    };

    const updateMeal = (updatedMeal: Meal) => {
        setMeals(prev => prev.map(meal => meal.id === updatedMeal.id ? updatedMeal : meal));
    };

    const deleteMeal = (mealId: number) => {
        setMeals(prev => prev.filter(meal => meal.id !== mealId));
    };

    const addSelection = (selection: MealSelection) => {
        setSelections(prev => {
             const existingSelection = prev.find(s => s.participantId === selection.participantId);
             if(existingSelection) {
                return prev.map(s => s.participantId === selection.participantId ? selection : s);
             }
             return [...prev, selection];
        });
    };
    
    const addFeedback = (newFeedback: Omit<Feedback, 'id' | 'timestamp' | 'isAddressed'>) => {
        const feedbackItem: Feedback = {
            ...newFeedback,
            id: `feedback_${Date.now()}`,
            timestamp: Date.now(),
            isAddressed: false,
        };
        setFeedback(prev => [feedbackItem, ...prev]);
    };

    const toggleFeedbackAddressed = (id: string) => {
        setFeedback(prev =>
            prev.map(item =>
                item.id === id ? { ...item, isAddressed: !item.isAddressed } : item
            )
        );
    };

    const addNetworkingInterest = async (interest: NetworkingInterest) => {
        const updatedInterests = networkingInterests.filter(i => i.participantId !== interest.participantId);
        updatedInterests.push(interest);
        setNetworkingInterests(updatedInterests);
        
        if (updatedInterests.length >= 2) {
            const matches = await generateNetworkingMatches(updatedInterests);
            setNetworkingMatches(matches);
        }
    };
    
    const generateAmbiancePlaylist = async (mood: AmbianceMood) => {
        const moodMap = {
            Focus: '일에 집중할 때 듣기 좋은 편안한 연주곡',
            Break: '휴식 시간에 어울리는 잔잔하고 부드러운 음악',
            Brainstorming: '창의적인 아이디어를 자극하는 영감 넘치는 음악',
            HighEnergy: '분위기를 끌어올리는 신나고 에너지 넘치는 음악'
        };
        const playlists = await generateYouTubePlaylists(moodMap[mood]);
        setAmbiancePlaylist({ mood, playlists });
    };

    const generateWorkshopSummary = async () => {
        if (feedback.length === 0 && networkingInterests.length === 0) {
            alert("요약할 데이터가 없습니다. 피드백이나 네트워킹 데이터가 필요합니다.");
            return;
        }
        const summaries = await generateWorkshopSummaries(feedback, networkingInterests, ambiancePlaylist, scores);
        setWorkshopSummary({
            ...summaries,
            generatedAt: new Date().toISOString(),
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
        setWorkshopNotice(notice);
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
