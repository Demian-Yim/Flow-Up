
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
    name: string;
    members: Participant[];
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
