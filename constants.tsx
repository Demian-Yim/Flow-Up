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
import { Tool } from './types';

export const TOOLS: Tool[] = [
    { id: 'attendance', title: '오늘의 체크인 🚀', description: '사진으로 출석하고, 모두의 얼굴을 확인해요.', icon: CalendarCheck },
    { id: 'introductions', title: 'AI 아이스브레이킹 💬', description: 'AI가 만들어주는 자기소개로 서로를 알아가요.', icon: Sparkles },
    { id: 'teams', title: '드림팀 빌더 ✨', description: '최적의 팀을 구성하고, AI로 팀 이름을 만들어요.', icon: Users },
    { id: 'scoreboard', title: '실시간 스코어보드 🏆', description: '팀별 점수를 확인하며, 열기를 더해요.', icon: Trophy },
    { id: 'motivation', title: '에너지 부스터 🔥', description: '워크숍의 흐름에 맞는 동기부여 명언을 받아요.', icon: Lightbulb },
    { id: 'feedback', title: '라이브 피드백 📝', description: '실시간으로 소통하며 교육을 함께 만들어요.', icon: MessageSquareQuote },
    { id: 'networking', title: '네트워킹 커넥터 🤝', description: '관심사 기반으로 대화 상대를 추천받아요.', icon: Link },
    { id: 'ambiance', title: '분위기 메이커 🎶', description: '상황에 맞는 음악으로 분위기를 UP 시켜요.', icon: Music },
    { id: 'meals', title: '오늘 뭐 먹지? 🍱', description: 'AI로 실제 맛집 메뉴를 불러와 점심/저녁을 골라요.', icon: UtensilsCrossed },
    { id: 'wrapup', title: '오늘의 마무리 🌟', description: '워크숍의 성과와 추억을 AI 요약으로 확인해요.', icon: PartyPopper },
];
