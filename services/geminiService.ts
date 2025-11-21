import { GoogleGenAI, Type } from "@google/genai";
import { 
    NetworkingInterest, NetworkingMatch, YouTubePlaylist, Feedback, FeedbackCategory, 
    Meal, RestaurantInfo, Role, Participant, Introduction, Team, MealSelection, AmbiancePlaylist,
    TeamScore, WorkshopSummary, WorkshopNotice
} from '../types';
import { DEFAULT_AMBIANCE_PLAYLIST } from "../constants";
import { db } from '../firebaseConfig';

// API 키 존재 여부를 먼저 확인
const API_KEY = process.env.API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Generates six styles of introductions using the Gemini API.
 * If the API key is not available, it returns a fallback response.
 * @param name - The person's name.
 * @param job - The person's job or affiliation.
 * @param interests - The person's interests.
 * @returns A promise that resolves to an array of objects with 'style' and 'text'.
 */
export async function generateIntroductions(name: string, job: string, interests: string): Promise<Array<{ style: string, text: string }>> {
    const fallbackIntroductions = [
        { style: '전문가', text: `${job} 전문가, ${name}입니다. ${interests}에 대한 깊이 있는 대화를 나누고 싶습니다.` },
        { style: '친근한', text: `안녕하세요! ${interests}를 좋아하는 ${name}입니다. 오늘 잘 부탁드려요!` },
        { style: '유머러스', text: `팀의 활력소가 될 ${name}입니다. ${job}도 하고 ${interests}도 즐기는 열정맨이죠!` },
        { style: '열정적인', text: `가슴 뛰는 도전을 즐기는 ${name}입니다! ${interests}에 대해 이야기하며 새로운 영감을 얻고 싶어요.` },
        { style: '진중한', text: `깊이 있는 대화를 통해 성장하고 싶은 ${name}입니다. ${job} 분야와 ${interests}에 대해 함께 탐구하고 싶습니다.` },
        { style: '창의적인', text: `새로운 아이디어를 사랑하는 ${name}입니다. ${interests}를 통해 세상을 다른 시각으로 보는 것을 즐깁니다.` }
    ];

    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for introductions.");
        return fallbackIntroductions;
    }
    try {
        const prompt = `${name}이라는 이름의 사람을 위한 خود소개를 6가지 독창적이고 개성있는 스타일로 작성해줘. 직업은 ${job}이고, 관심사는 ${interests}야. 예를 들어 '열정 넘치는 탐험가', '미래에서 온 전략가', '따뜻한 이야기꾼'처럼 역할이나 성격을 부여해서 만들어줘. 각 자기소개는 100자 이내로 짧고 간결하게 작성해줘.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        introductions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    style: { type: Type.STRING, description: "자기소개 스타일 (예: 열정 넘치는 탐험가)" },
                                    text: { type: Type.STRING, description: "자기소개 내용" },
                                },
                                required: ["style", "text"],
                            }
                        }
                    },
                    required: ["introductions"]
                },
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return Array.isArray(parsed.introductions) ? parsed.introductions : fallbackIntroductions;

    } catch (error) {
        console.error("Error generating introductions:", error);
        return fallbackIntroductions;
    }
}

/**
 * Generates a list of team names based on keywords using the Gemini API.
 * Returns a fallback list if the API key is not available.
 * @param keywords - Keywords describing the team's characteristics.
 * @returns A promise that resolves to an array of suggested team names.
 */
export async function generateTeamNames(keywords: string): Promise<string[]> {
    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for team names.");
        return ["팀 브레이커", "아이디어 팩토리", "챌린지 위너스", "시너지 크루", "퓨처 파이오니어"];
    }
    try {
        const prompt = `워크숍에서 사용할 팀 이름을 5개 추천해줘. 팀의 특징을 나타내는 키워드는 '${keywords}'야. 창의적이고 기억하기 쉬운 이름으로 추천해줘.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        teamNames: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.STRING,
                            },
                            description: "추천된 팀 이름 목록"
                        }
                    },
                    required: ["teamNames"]
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return Array.isArray(parsed.teamNames) ? parsed.teamNames : [];

    } catch (error) {
        console.error("Error generating team names:", error);
        return ["팀 브레이커", "아이디어 팩토리", "챌린지 위너스", "시너지 크루", "퓨처 파이오니어"];
    }
}

/**
 * Generates a motivational message based on a topic using the Gemini API.
 * Returns a fallback quote if the API key is missing.
 * @param topic - The topic for the motivational message.
 * @returns A promise that resolves to a motivational message string.
 */
export async function generateMotivation(topic: string): Promise<string> {
    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for motivation.");
        return "가장 큰 위험은 아무런 위험도 감수하지 않는 것이다. - 마크 주커버그";
    }
    try {
        const prompt = `'${topic}' 주제와 관련하여, 워크숍 참가자들에게 영감을 줄 수 있는 메시지를 생성해줘. 영화나 드라마의 명대사, 책의 감명 깊은 구절, 유명인의 명언, 또는 창의적인 응원 메시지 등 형식에 구애받지 말고, 듣는 이의 마음에 와닿을 수 있는 인상적인 문장으로 작성해줘.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        console.error("Error generating motivation:", error);
        return "가장 큰 위험은 아무런 위험도 감수하지 않는 것이다. - 마크 주커버그";
    }
}

/**
 * Generates networking matches for participants based on their interests.
 * @param interests - An array of participant interests.
 * @returns A promise that resolves to a record of matches for each participant.
 */
export async function generateNetworkingMatches(interests: NetworkingInterest[]): Promise<Record<string, NetworkingMatch[]>> {
    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for networking.");
        if (interests.length < 2) return {};
        const p1 = interests[0];
        const p2 = interests[1];
        return {
            [p1.participantId]: [{
                matchedParticipantId: p2.participantId,
                matchedParticipantName: p2.name,
                commonInterests: "관심사가 비슷해 보여요!",
                conversationStarter: `${p2.name}님과 ${p1.interests}에 대해 이야기해보는 건 어떠세요?`
            }],
            [p2.participantId]: [{
                matchedParticipantId: p1.participantId,
                matchedParticipantName: p1.name,
                commonInterests: "흥미로운 대화를 나눌 수 있을 거예요.",
                conversationStarter: `${p1.name}님과 ${p2.interests}에 대해 이야기 나눠보세요!`
            }]
        };
    }
    
    try {
        const participantData = interests.map(p => ({ id: p.participantId, name: p.name, interests: p.interests }));
        const prompt = `워크숍 참가자들의 네트워킹을 도와주는 AI입니다. 아래 참가자 목록과 각자의 관심사를 기반으로, 각 참가자별로 대화하기 좋은 상대를 최대 3명까지 자동으로 추천해주세요. 각 추천마다 연결 이유와 자연스러운 대화 시작 질문을 함께 제공해야 합니다. 자기 자신을 추천해서는 안 됩니다.

참가자 목록:
${JSON.stringify(participantData)}

결과는 아래 JSON 스키마를 따르는 JSON 배열 형태로 반환해주세요. 각 객체는 한 참가자의 추천 목록을 담고 있어야 합니다.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    description: "각 참가자에 대한 추천 매칭 목록입니다.",
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            participantId: {
                                type: Type.STRING,
                                description: "추천을 받는 참가자의 ID"
                            },
                            matches: {
                                type: Type.ARRAY,
                                description: "해당 참가자에게 추천되는 상대방 목록",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        matchedParticipantId: { type: Type.STRING, description: "추천된 상대방의 ID" },
                                        matchedParticipantName: { type: Type.STRING, description: "추천된 상대방의 이름" },
                                        commonInterests: { type: Type.STRING, description: "두 사람을 연결하는 공통 관심사 또는 이유" },
                                        conversationStarter: { type: Type.STRING, description: "대화를 시작할 수 있는 자연스러운 질문" }
                                    },
                                    required: ["matchedParticipantId", "matchedParticipantName", "commonInterests", "conversationStarter"]
                                }
                            }
                        },
                        required: ["participantId", "matches"]
                    }
                }
            }
        });

        const jsonText = response.text.trim();
        const resultArray: { participantId: string; matches: NetworkingMatch[] }[] = JSON.parse(jsonText);

        const matchesRecord: Record<string, NetworkingMatch[]> = {};
        for (const item of resultArray) {
            matchesRecord[item.participantId] = item.matches;
        }
        return matchesRecord;

    } catch (error) {
        console.error("Error generating networking matches:", error);
        return {};
    }
}


/**
 * Generates a list of YouTube playlists based on a mood using the Gemini API.
 * @param mood - The mood or theme for the playlist.
 * @returns A promise that resolves to an array of YouTubePlaylist objects.
 */
export async function generateYouTubePlaylists(mood: string): Promise<YouTubePlaylist[]> {
    const fallbackPlaylist: YouTubePlaylist[] = [
        { title: "[Playlist] 로맨틱한 재즈 선율과 함께하는 달콤한 휴식", description: "감미로운 재즈 음악으로 마음의 안정을 찾아보세요.", videoId: "m_h_RY1iKzI", thumbnailUrl: "https://i.ytimg.com/vi/m_h_RY1iKzI/hqdefault.jpg" },
        { title: "일할 때 듣기 좋은 Lo-fi hip hop", description: "집중력을 높여주는 편안한 로파이 음악 컬렉션입니다.", videoId: "5qap5aO4i9A", thumbnailUrl: "https://i.ytimg.com/vi/5qap5aO4i9A/hqdefault.jpg" },
        { title: "신나는 K-Pop 아이돌 음악", description: "에너지가 필요할 때! 기분을 UP 시켜주는 K-Pop 히트곡 모음.", videoId: "3tmd-ClpJxA", thumbnailUrl: "https://i.ytimg.com/vi/3tmd-ClpJxA/hqdefault.jpg" },
        { title: "영화처럼, 감동적인 영화음악 OST", description: "영화의 감동을 다시 한번! 웅장하고 아름다운 OST.", videoId: "s3_e8L_Jq_c", thumbnailUrl: "https://i.ytimg.com/vi/s3_e8L_Jq_c/hqdefault.jpg" },
        { title: "비 오는 날 듣기 좋은 감성 발라드", description: "센치한 날, 마음을 울리는 감성 발라드 플레이리스트.", videoId: "8_4O_12c4uM", thumbnailUrl: "https://i.ytimg.com/vi/8_4O_12c4uM/hqdefault.jpg" },
        { title: "상쾌한 아침을 여는 팝송", description: "기분 좋은 하루의 시작을 위한 상큼한 팝송 모음입니다.", videoId: "a_j_3-b-3_g", thumbnailUrl: "https://i.ytimg.com/vi/a_j_3-b-3_g/hqdefault.jpg" },
    ];

    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for playlist.");
        return fallbackPlaylist;
    }

    try {
        const prompt = `당신은 워크숍 분위기를 위한 음악 큐레이터입니다. '${mood}' 분위기에 어울리는 유튜브 플레이리스트나 음악 영상 6개를 추천해주세요. 다양한 장르(가요, 팝, 재즈, 사운드트랙, 인스트루멘탈 등)를 포함해주세요. 각 추천 항목은 실제 음악을 감상할 수 있고, 저작권 문제가 없는 유효한 유튜브 영상이어야 합니다.

각 추천 항목은 아래 JSON 스키마를 따르는 객체여야 합니다.
- title: 영상 또는 플레이리스트의 제목
- description: 추천 이유나 영상에 대한 간략한 설명 (50자 내외)
- videoId: 실제 존재하는 유효한 유튜브 영상 ID (예: '5qap5aO4i9A' 형식의 11자리 영문/숫자 조합)
- thumbnailUrl: 'https://i.ytimg.com/vi/[videoId]/hqdefault.jpg' 형식의 썸네일 URL. [videoId] 부분은 생성한 videoId로 대체해주세요.

결과는 6개의 객체를 포함하는 JSON 배열 형태로만 반환해주세요.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                         playlists: {
                            type: Type.ARRAY,
                            description: "추천된 유튜브 플레이리스트 목록",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "영상 제목" },
                                    description: { type: Type.STRING, description: "영상 설명" },
                                    videoId: { type: Type.STRING, description: "유튜브 비디오 ID" },
                                    thumbnailUrl: { type: Type.STRING, description: "유튜브 썸네일 URL" },
                                },
                                required: ["title", "description", "videoId", "thumbnailUrl"],
                            },
                        },
                    },
                    required: ["playlists"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return Array.isArray(parsed.playlists) ? parsed.playlists : fallbackPlaylist;

    } catch (error) {
        console.error("Error generating playlist:", error);
        return fallbackPlaylist;
    }
}


/**
 * Generates summaries for workshop feedback and networking interests.
 * @param feedback - An array of feedback items.
 * @param interests - An array of networking interests.
 * @param ambiance - The current ambiance playlist.
 * @param scores - The current team scores.
 * @returns A promise that resolves to an object with summaries.
 */
export async function generateWorkshopSummaries(
    feedback: Feedback[], 
    interests: NetworkingInterest[],
    ambiance: AmbiancePlaylist | null,
    scores: TeamScore[]
): Promise<Omit<WorkshopSummary, 'generatedAt'>> {
    const fallbackSummary = {
        feedbackSummary: "워크숍 동안 다양한 질문과 제안, 칭찬이 오갔습니다. 활발한 참여에 감사드립니다!",
        networkingSummary: "기술, 취미, 커리어 등 다채로운 주제에 대한 관심사가 공유되었습니다. 이를 바탕으로 의미 있는 네트워킹이 이루어졌기를 바랍니다.",
        ambianceSummary: "워크숍 내내 활기차고 긍정적인 분위기가 이어졌습니다. 음악과 함께 즐거운 시간을 보내셨기를 바랍니다.",
        teamDynamicsSummary: "모든 팀이 열정적으로 참여하며 선의의 경쟁을 펼쳤습니다. 팀원들과의 협력을 통해 좋은 결과를 만들어낸 것을 축하합니다!",
    };

    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for summaries.");
        return fallbackSummary;
    }
    
    try {
        const prompt = `워크숍 활동 종합 요약 AI입니다. 아래에 제공된 네 가지 데이터를 분석하여, 각 항목에 대한 긍정적이고 통찰력 있는 요약문을 한국어로 생성해주세요.

### 분석 데이터 ###

1.  **피드백 목록**:
    ${JSON.stringify(feedback.map(f => ({ category: f.category, message: f.message })))}

2.  **네트워킹 관심사**:
    ${JSON.stringify(interests.map(i => i.interests))}
    
3.  **오늘의 분위기**:
    현재 설정된 음악 플레이리스트의 무드는 '${ambiance?.mood || '알 수 없음'}' 입니다.

4.  **팀별 스코어**:
    ${JSON.stringify(scores)}

### 요약문 생성 가이드 ###

-   **feedbackSummary**: 전반적인 피드백의 경향을 요약합니다. 어떤 종류(질문, 제안, 칭찬)의 피드백이 많았는지, 핵심 키워드는 무엇이었는지 언급해주세요.
-   **networkingSummary**: 참가자들이 주로 어떤 주제에 관심을 보였는지 요약합니다. 가장 많이 언급된 인기 주제나 키워드를 2~3개 짚어주세요.
-   **ambianceSummary**: 설정된 음악 무드를 바탕으로 워크숍의 전반적인 분위기를 묘사해주세요. (예: '집중' 무드였다면, '차분하고 몰입도 높은 분위기 속에서 진행되었습니다.')
-   **teamDynamicsSummary**: 팀별 스코어를 참고하여 워크숍의 열기와 팀 활동 양상을 요약해주세요. 1등 팀을 언급하며 축하하고, 전반적인 참여와 협력의 분위기를 긍정적으로 평가해주세요.
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        feedbackSummary: { type: Type.STRING, description: "피드백 요약문" },
                        networkingSummary: { type: Type.STRING, description: "네트워킹 관심사 요약문" },
                        ambianceSummary: { type: Type.STRING, description: "분위기 요약문" },
                        teamDynamicsSummary: { type: Type.STRING, description: "팀 활동 및 스코어 요약문" },
                    },
                    required: ["feedbackSummary", "networkingSummary", "ambianceSummary", "teamDynamicsSummary"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating workshop summaries:", error);
        return fallbackSummary;
    }
}


/**
 * Generates a personalized welcome message for a participant.
 * @param name - The participant's name.
 * @returns A promise that resolves to a welcome message.
 */
export async function generateWelcomeMessage(name: string): Promise<string> {
    const fallback = `${name}님, 환영합니다! 오늘 워크숍에서 멋진 시간을 보내세요!`;
    if (!ai) return fallback;

    try {
        const prompt = `워크숍에 방금 체크인한 '${name}' 님을 위한, 짧고 창의적이며 에너지가 넘치는 환영 메시지를 한 문장으로 생성해줘.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        console.error("Error generating welcome message:", error);
        return fallback;
    }
}

/**
 * Generates a dynamic reply to submitted feedback.
 * @param category - The category of the feedback.
 * @returns A promise that resolves to a reply message.
 */
export async function generateFeedbackReply(category: FeedbackCategory): Promise<string> {
    const fallbacks = {
        Question: "좋은 질문 감사합니다! 담당자가 확인 후 답변 드릴 예정입니다.",
        Suggestion: "소중한 제안 감사합니다. 워크숍 개선에 큰 도움이 될 거예요!",
        Praise: "따뜻한 칭찬 감사합니다! 덕분에 힘이 나네요!",
    };
    if (!ai) return fallbacks[category];

    try {
        const topic = {
            Question: "질문",
            Suggestion: "제안",
            Praise: "칭찬",
        }[category];

        const prompt = `워크숍 참가자가 방금 '${topic}' 종류의 피드백을 제출했습니다. 제출 완료 화면에 보여줄, 짧고 긍정적이며 재치있는 확인 메시지를 한 문장으로 생성해줘.`;
         const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        console.error("Error generating feedback reply:", error);
        return fallbacks[category];
    }
}

/**
 * Generates a fun reaction to a meal selection.
 * @param mealName - The name of the selected meal.
 * @returns A promise that resolves to a reaction message.
 */
export async function generateMealReaction(mealName: string): Promise<string> {
    const fallback = `${mealName}, 탁월한 선택이에요!`;
    if (!ai) return fallback;

    try {
        const prompt = `워크숍 참가자가 점심 메뉴로 '${mealName}'을 선택했습니다. 이 선택에 대해, 짧고 재치있으며 긍정적인 반응 메시지를 한 문장으로 생성해줘.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });
        return response.text.trim().replace(/"/g, '');
    } catch (error) {
        console.error("Error generating meal reaction:", error);
        return fallback;
    }
}

/**
 * Generates a list of menu items for a given restaurant using the Gemini API.
 * @param restaurantQuery - The name and location of the restaurant.
 * @returns A promise that resolves to an object containing restaurant info and menu items.
 */
export async function generateMenuItems(restaurantQuery: string): Promise<{ restaurantInfo: RestaurantInfo, menus: Omit<Meal, 'id' | 'stock'>[] }> {
    const fallbackData = {
        restaurantInfo: {
            name: restaurantQuery,
            address: "주소 정보 (예시)",
            mapUrl: "https://map.naver.com/"
        },
        menus: [
            { name: '시래기국', description: '고소한 들깨가루가 일품인 대표 메뉴', price: 9000, emoji: '🍲', isRecommended: true },
            { name: '도마수육 정식', description: '명이나물과 함께 즐기는 야들야들한 수육', price: 14000, emoji: '🍖', isRecommended: true },
        ]
    };
    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for menu items.");
        return fallbackData;
    }
    
    try {
        const prompt = `당신은 대한민국 맛집 메뉴판 전문가입니다. '${restaurantQuery}' 식당의 최신 네이버 지도 정보를 검색하여, 대표 '음식' 메뉴 5-7개와 식당 정보를 찾아 아래 JSON 스키마에 맞춰 응답해주세요.

**매우 중요한 규칙:**
- **주류(소주, 맥주, 막걸리 등)와 음료수(콜라, 사이다 등)는 반드시 제외해주세요.**
- 오직 음식 메뉴만 포함해야 합니다.
- 메뉴 설명은 실제 메뉴판처럼 간결하고 매력적으로 작성해주세요.
- 가격은 숫자만 포함해야 합니다 (예: 12000).
- 메뉴별로 가장 어울리는 음식 이모지(emoji)를 하나씩 포함해주세요.
- 식당의 정확한 이름, 주소, 그리고 네이버 지도 URL을 반드시 찾아주세요.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        restaurantInfo: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING, description: "식당 이름" },
                                address: { type: Type.STRING, description: "식당 주소" },
                                mapUrl: { type: Type.STRING, description: "네이버 지도 URL" }
                            },
                             required: ["name", "address", "mapUrl"]
                        },
                        menus: {
                            type: Type.ARRAY,
                            description: "식당 메뉴 목록",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING, description: "메뉴 이름" },
                                    description: { type: Type.STRING, description: "메뉴 설명" },
                                    price: { type: Type.NUMBER, description: "메뉴 가격 (숫자)" },
                                    emoji: { type: Type.STRING, description: "메뉴에 어울리는 이모지" },
                                    isRecommended: { type: Type.BOOLEAN, description: "추천 메뉴 여부 (선택 사항)" },
                                },
                                required: ["name", "description", "price", "emoji"]
                            }
                        }
                    },
                    required: ["restaurantInfo", "menus"]
                }
            }
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed;

    } catch (error) {
        console.error("Error generating menu items:", error);
        return fallbackData;
    }
}


// --- DB Service with Firebase ---

const WORKSHOP_DOC_ID = 'main_workshop_data'; // Using a single document for the entire workshop state

interface DbState {
    participants: Participant[];
    introductions: Introduction[];
    teams: Team[];
    scores: TeamScore[];
    restaurantInfo: RestaurantInfo | null;
    meals: Meal[];
    selections: MealSelection[];
    feedback: Feedback[];
    networkingInterests: NetworkingInterest[];
    ambiancePlaylist: AmbiancePlaylist | null;
    workshopSummary: WorkshopSummary | null;
    workshopNotice: WorkshopNotice | null;
}

function getInitialState(): DbState {
    return {
        participants: [],
        introductions: [],
        teams: [],
        scores: [],
        restaurantInfo: {name: '순남시래기 방배점', address: '', mapUrl: ''},
        meals: [],
        selections: [],
        feedback: [],
        networkingInterests: [],
        ambiancePlaylist: DEFAULT_AMBIANCE_PLAYLIST,
        workshopSummary: null,
        workshopNotice: null,
    };
}

/**
 * Saves the entire workshop data to Firestore.
 * @param data - The complete state of the workshop.
 */
export async function saveWorkshopData(data: DbState): Promise<{ success: boolean }> {
    if (!db) {
        console.error("Firebase is not initialized.");
        return { success: false };
    }
    try {
        // Corrected: Use namespaced (v8/compat) API
        const workshopDocRef = db.collection('workshops').doc(WORKSHOP_DOC_ID);
        // Corrected: Use namespaced (v8/compat) API
        await workshopDocRef.set(data, { merge: true }); // Use merge to avoid overwriting with partial data
        return { success: true };
    } catch (error) {
        console.error("Failed to save data to Firestore", error);
        return { success: false };
    }
}

/**
 * Listens for real-time updates from Firestore and calls the callback function.
 * @param callback - A function to be called with the updated data.
 * @returns An unsubscribe function to stop listening to updates.
 */
export function listenForWorkshopUpdates(callback: (data: DbState) => void): () => void {
    if (!db) {
        console.error("Firebase is not initialized.");
        return () => {}; // Return a no-op unsubscribe function
    }
    // Use namespaced (v8/compat) API
    const workshopDocRef = db.collection('workshops').doc(WORKSHOP_DOC_ID);
    
    // Use namespaced (v8/compat) API
    const unsubscribe = workshopDocRef.onSnapshot((docSnap) => {
        // With the Firebase v8 compat API, `exists` is a boolean property.
        if (docSnap.exists) {
            const data = docSnap.data();
            callback({ ...getInitialState(), ...data } as DbState);
        } else {
            // Document doesn't exist, create it with initial state
            console.log("No workshop document found, creating one with initial state.");
            const initialState = getInitialState();
            saveWorkshopData(initialState).then(() => {
                callback(initialState);
            });
        }
    }, (error) => {
        console.error("Error listening to workshop updates:", error);
    });

    return unsubscribe;
}
