import React from 'react';

export enum Role {
    Participant = '참가자',
    Admin = '관리자',
}

export interface Tool {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType;
}

export interface Participant {
    id: string;
    name: string;
    checkInTime?: string;
    checkInImage?: string;
    introduction?: string;
}

export interface Introduction {
    participantId: string;
    name: string;
    style: '전문가' | '친근한' | '유머러스';
    text: string;
}

export interface Team {
    id: string;
    name: string;
    members: Participant[];
}

export interface TeamScore {
    teamId: string;
    name: string;
    score: number;
}

export type FeedbackCategory = 'Question' | 'Suggestion' | 'Praise';

export interface Feedback {
    id: string;
    participantId: string;
    name: string; // "익명" if anonymous
    message: string;
    category: FeedbackCategory;
    timestamp: number;
    isAddressed: boolean;
}

export interface Meal {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    stock: number;
    isRecommended?: boolean;
}

export interface MealSelection {
    participantId: string;
    mealId: number;
}

export interface NetworkingInterest {
    participantId: string;
    name: string;
    interests: string;
}

export interface NetworkingMatch {
    matchedParticipantId: string;
    matchedParticipantName: string;
    commonInterests: string;
    conversationStarter: string;
}

export type AmbianceMood = 'Focus' | 'Break' | 'Brainstorming' | 'HighEnergy';

export interface Song {
    title: string;
    artist: string;
}

export interface AmbiancePlaylist {
    mood: AmbianceMood;
    songs: Song[];
}

export interface WorkshopSummary {
    feedbackSummary: string;
    networkingSummary: string;
    generatedAt: string;
}