import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Participant, Role, Introduction, Team, Meal, MealSelection, Feedback, NetworkingInterest, NetworkingMatch, AmbiancePlaylist, AmbianceMood, TeamScore, WorkshopSummary, RestaurantInfo } from '../types';
import { generateNetworkingMatches, generateYouTubePlaylists, generateWorkshopSummaries, generateMenuItems } from '../services/geminiService';

interface AppContextType {
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'flow-link-app-state';

const DEFAULT_AMBIANCE_PLAYLIST: AmbiancePlaylist = {
    mood: 'Break',
    playlists: [
        {
            title: "Welcome to Flow~ Link! 🎵",
            description: "워크숍의 시작을 위한 환영 플레이리스트입니다. 관리자가 곧 분위기를 바꿀 수 있어요.",
            videoId: "3tmd-ClpJxA",
            thumbnailUrl: "https://i.ytimg.com/vi/3tmd-ClpJxA/hqdefault.jpg"
        },
        {
            title: "편안한 라운지 재즈",
            description: "대화와 휴식에 어울리는 부드러운 재즈 음악.",
            videoId: "s3_e8L_Jq_c",
            thumbnailUrl: "https://i.ytimg.com/vi/s3_e8L_Jq_c/hqdefault.jpg"
        },
        {
            title: "Lo-fi Hip Hop Radio",
            description: "집중하거나 휴식을 취할 때 듣기 좋은 비트.",
            videoId: "5qap5aO4i9A",
            thumbnailUrl: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg"
        },
        {
            title: "Refreshing Pop Songs",
            description: "기분 전환을 위한 상쾌한 팝 음악 모음.",
            videoId: "a_j_3-b-3_g",
            thumbnailUrl: "https://i.ytimg.com/vi/a_j_3-b-3_g/hqdefault.jpg"
        },
        {
            title: "감동적인 영화 OST",
            description: "마음을 움직이는 아름다운 영화 사운드트랙.",
            videoId: "8_4O_12c4uM",
            thumbnailUrl: "https://i.ytimg.com/vi/8_4O_12c4uM/hqdefault.jpg"
        },
        {
            title: "Acoustic Cafe Music",
            description: "어쿠스틱 기타 선율과 함께하는 편안한 시간.",
            videoId: "dQw4w9WgXcQ",
            thumbnailUrl: "https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
        }
    ]
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
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
    
    const ADMIN_PASSWORD = 'inamoment';

    useEffect(() => {
        try {
            const savedStateJSON = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (savedStateJSON) {
                const savedState = JSON.parse(savedStateJSON);
                if (savedState) {
                    setRole(savedState.role || Role.Participant);
                    setParticipants(savedState.participants || []);
                    setIntroductions(savedState.introductions || []);
                    setTeams(savedState.teams || []);
                    setScores(savedState.scores || []);
                    setRestaurantInfo(savedState.restaurantInfo || {name: '순남시래기 방배점', address: '', mapUrl: ''});
                    setMeals(savedState.meals || []);
                    setSelections(savedState.selections || []);
                    setFeedback(savedState.feedback || []);
                    setNetworkingInterests(savedState.networkingInterests || []);
                    setAmbiancePlaylist(savedState.ambiancePlaylist || DEFAULT_AMBIANCE_PLAYLIST);
                    setWorkshopSummary(savedState.workshopSummary || null);
                    setIsAdminAuthenticated(savedState.isAdminAuthenticated || false);
                }
            } else {
                 setAmbiancePlaylist(DEFAULT_AMBIANCE_PLAYLIST);
            }
        } catch (error) {
            console.error("Failed to load state from local storage", error);
            setAmbiancePlaylist(DEFAULT_AMBIANCE_PLAYLIST);
        }
    }, []);

    useEffect(() => {
        try {
            const stateToSave = {
                role,
                participants,
                introductions,
                teams,
                scores,
                restaurantInfo,
                meals,
                selections,
                feedback,
                networkingInterests,
                ambiancePlaylist,
                workshopSummary,
                isAdminAuthenticated,
            };
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
            console.error("Failed to save state to local storage", error);
        }
    }, [role, participants, introductions, teams, scores, restaurantInfo, meals, selections, feedback, networkingInterests, ambiancePlaylist, workshopSummary, isAdminAuthenticated]);

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

    const updateTeams = (newTeams: Team[]) => {
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
        const summaries = await generateWorkshopSummaries(feedback, networkingInterests);
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

    return (
        <AppContext.Provider value={{
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