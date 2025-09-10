import {
    CalendarCheck,
    Sparkles,
    Users,
    Trophy,
    Lightbulb,
    MessageSquareQuote,
    Link,
    Music,
    UtensilsCrossed,
    PartyPopper,
} from 'lucide-react';
import { Tool, Meal } from './types';

export const TOOLS: Tool[] = [
    { id: 'attendance', title: '오늘의 체크인 🚀', description: '사진으로 출석하고, 모두의 얼굴을 확인해요.', icon: CalendarCheck },
    { id: 'introductions', title: 'AI 아이스브레이킹 💬', description: 'AI가 만들어주는 자기소개로 서로를 알아가요.', icon: Sparkles },
    { id: 'teams', title: '드림팀 빌더 ✨', description: '최적의 팀을 구성하고, AI로 팀 이름을 만들어요.', icon: Users },
    { id: 'scoreboard', title: '실시간 스코어보드 🏆', description: '팀별 점수를 확인하며, 열기를 더해요.', icon: Trophy },
    { id: 'motivation', title: '에너지 부스터 🔥', description: '워크숍의 흐름에 맞는 동기부여 명언을 받아요.', icon: Lightbulb },
    { id: 'feedback', title: '라이브 피드백 📝', description: '실시간으로 소통하며 교육을 함께 만들어요.', icon: MessageSquareQuote },
    { id: 'networking', title: '네트워킹 커넥터 🤝', description: '관심사 기반으로 대화 상대를 추천받아요.', icon: Link },
    { id: 'ambiance', title: '분위기 메이커 🎶', description: '상황에 맞는 음악으로 분위기를 UP 시켜요.', icon: Music },
    { id: 'meals', title: '점심 뭐 먹지? 🍱', description: '다양한 메뉴를 보고, 다함께 점심을 골라요.', icon: UtensilsCrossed },
    { id: 'wrapup', title: '오늘의 마무리 🌟', description: '워크숍의 성과와 추억을 AI 요약으로 확인해요.', icon: PartyPopper },
];


export const INITIAL_MEALS: Meal[] = [
    { id: 1, name: '시래기국', description: '들깨가루로 고소함을 더한 전통 방식의 대표 메뉴', price: 9000, image: 'https://images.unsplash.com/photo-1544026312-34a5a5b2bf5e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 30, isRecommended: true },
    { id: 2, name: '도마수육 정식', description: '야들야들하게 삶아낸 수육과 명이나물이 함께 제공되는 든든한 정식', price: 14000, image: 'https://images.unsplash.com/photo-1606525433842-61674415e18f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 20, isRecommended: true },
    { id: 3, name: '쑥떡 떡갈비 정식', description: '향긋한 쑥떡과 육즙 가득한 떡갈비의 환상적인 조화', price: 13000, image: 'https://images.unsplash.com/photo-1599028204639-9d5870295325?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 15 },
    { id: 4, name: '얼큰 시래기국', description: '스트레스를 날려줄 칼칼하고 시원한 맛의 매운 시래기국', price: 10000, image: 'https://images.unsplash.com/photo-1572695914217-1594d75474a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 20 },
    { id: 5, name: '옛날 불고기', description: '달콤짭짤한 양념에 재운 소불고기를 자작하게 끓여먹는 추억의 맛', price: 15000, image: 'https://images.unsplash.com/photo-1628294777977-227844a49901?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 15 },
    { id: 6, name: '해물파전', description: '오징어와 새우가 듬뿍 들어간 바삭하고 고소한 해물파전', price: 18000, image: 'https://images.unsplash.com/photo-1632770743688-632832964b0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 10 },
];