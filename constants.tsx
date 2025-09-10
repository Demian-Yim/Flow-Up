
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


export const MEALS: Meal[] = [
    { id: 1, name: '프리미엄 한식 도시락', description: '정갈한 반찬과 따뜻한 밥, 그리고 메인 요리', price: 15000, image: 'https://images.unsplash.com/photo-1582576163524-7188d3855a0a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 20, isRecommended: true },
    { id: 2, name: '클래식 클럽 샌드위치', description: '신선한 채소와 햄, 치즈가 듬뿍 들어간 샌드위치', price: 12000, image: 'https://images.unsplash.com/photo-1592415486689-125c9287573d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 30 },
    { id: 3, name: '매콤한 낙지덮밥', description: '스트레스를 날려줄 화끈한 매운 맛의 낙지덮밥', price: 13000, image: 'https://images.unsplash.com/photo-1593560708633-2a7f35a43f87?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 15 },
    { id: 4, name: '든든한 비프 부리또', description: '소고기, 밥, 콩, 채소가 가득 들어간 멕시칸 부리또', price: 11000, image: 'https://images.unsplash.com/photo-1625141041434-6e8284102b4d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 25 },
    { id: 5, name: '신선한 리코타치즈 샐러드', description: '상큼한 드레싱과 신선한 채소, 고소한 리코타치즈', price: 10000, image: 'https://images.unsplash.com/photo-1551248429-40974011e723?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 10 },
    { id: 6, name: '품절된 메뉴', description: '이 메뉴는 현재 선택할 수 없습니다.', price: 99999, image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=60', stock: 0 },
];