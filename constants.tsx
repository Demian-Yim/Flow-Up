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
import { Tool, AmbiancePlaylist } from './types';

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


export const DEFAULT_AMBIANCE_PLAYLIST: AmbiancePlaylist = {
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