import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Participant, Role, Introduction, Team, Meal, MealSelection } from '../types';
import { MEALS } from '../constants';

interface AppContextType {
    role: Role;
    setRole: (role: Role) => void;
    participants: Participant[];
    addParticipant: (participant: Participant) => void;
    currentUser: Participant | null;
    setCurrentUser: (participant: Participant | null) => void;
    introductions: Introduction[];
    addIntroduction: (introduction: Introduction) => void;
    teams: Team[];
    setTeams: (teams: Team[]) => void;
    meals: Meal[];
    selections: MealSelection[];
    addSelection: (selection: MealSelection) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [role, setRole] = useState<Role>(Role.Participant);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [currentUser, setCurrentUser] = useState<Participant | null>(null);
    const [introductions, setIntroductions] = useState<Introduction[]>([]);
    const [teams, setTeams] = useState<Team[]>([]);
    const [meals, setMeals] = useState<Meal[]>(MEALS);
    const [selections, setSelections] = useState<MealSelection[]>([]);

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

    const addIntroduction = (introduction: Introduction) => {
        setIntroductions(prev => {
            const existingIndex = prev.findIndex(i => i.participantId === introduction.participantId);
            if (existingIndex > -1) {
                // FIX: Renamed 'new intros' to 'newIntros' to fix invalid variable name error.
                const newIntros = [...prev];
                newIntros[existingIndex] = introduction;
                return newIntros;
            }
            return [...prev, introduction];
        });
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


    return (
        <AppContext.Provider value={{
            role, setRole,
            participants, addParticipant,
            currentUser, setCurrentUser,
            introductions, addIntroduction,
            teams, setTeams,
            meals, selections, addSelection
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