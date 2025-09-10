import { GoogleGenAI, Type } from "@google/genai";
import { NetworkingInterest, NetworkingMatch, Song, Feedback, FeedbackCategory } from '../types';

// API 키 존재 여부를 먼저 확인
const API_KEY = process.env.API_KEY;
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

/**
 * Generates three styles of introductions using the Gemini API.
 * If the API key is not available, it returns a fallback response.
 * @param name - The person's name.
 * @param job - The person's job or affiliation.
 * @param interests - The person's interests.
 * @returns A promise that resolves to an object with 'expert', 'friendly', and 'humorous' introductions.
 */
export async function generateIntroductions(name: string, job: string, interests: string): Promise<Record<string, string>> {
    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for introductions.");
        return {
            expert: `${job} 전문가, ${name}입니다. ${interests}에 대한 깊이 있는 대화를 나누고 싶습니다.`,
            friendly: `안녕하세요! ${interests}를 좋아하는 ${name}입니다. 오늘 잘 부탁드려요!`,
            humorous: `팀의 활력소가 될 ${name}입니다. ${job}도 하고 ${interests}도 즐기는 열정맨이죠!`
        };
    }
    try {
        const prompt = `${name}이라는 이름의 사람을 위한 자기소개를 3가지 스타일로 작성해줘. 직업은 ${job}이고, 관심사는 ${interests}야. 각 스타일은 전문가(expert), 친근한(friendly), 유머러스(humorous) 스타일이야. 각 자기소개는 100자 이내로 짧고 간결하게 작성해줘.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        expert: {
                            type: Type.STRING,
                            description: "전문가 스타일의 자기소개"
                        },
                        friendly: {
                            type: Type.STRING,
                            description: "친근한 스타일의 자기소개"
                        },
                        humorous: {
                            type: Type.STRING,
                            description: "유머러스한 스타일의 자기소개"
                        }
                    },
                    required: ["expert", "friendly", "humorous"]
                },
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText);

    } catch (error) {
        console.error("Error generating introductions:", error);
        return {
            expert: "전문가 스타일 자기소개를 생성하는 데 실패했습니다.",
            friendly: "친근한 스타일 자기소개를 생성하는 데 실패했습니다.",
            humorous: "유머러스한 스타일 자기소개를 생성하는 데 실패했습니다."
        };
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
 * Generates a motivational quote based on a topic using the Gemini API.
 * Returns a fallback quote if the API key is missing.
 * @param topic - The topic for the motivational quote.
 * @returns A promise that resolves to a motivational quote string.
 */
export async function generateMotivation(topic: string): Promise<string> {
    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for motivation.");
        return "가장 큰 위험은 아무런 위험도 감수하지 않는 것이다. - 마크 주커버그";
    }
    try {
        const prompt = `워크숍 참가자들에게 동기부여가 될 만한 짧은 명언을 하나 만들어줘. 주제는 '${topic}'이야. 긍정적이고 힘이 되는 메시지로 작성해줘.`;

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
        const prompt = `워크숍 참가자들의 네트워킹을 도와주는 AI입니다. 아래 참가자 목록과 각자의 관심사를 기반으로, 각 참가자별로 대화하기 좋은 상대를 최대 3명까지 추천해주세요. 각 추천마다 연결 이유와 자연스러운 대화 시작 질문을 함께 제공해야 합니다. 자기 자신을 추천해서는 안 됩니다.

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
 * Generates a playlist based on a mood using the Gemini API.
 * @param mood - The mood or theme for the playlist.
 * @returns A promise that resolves to an array of Song objects.
 */
export async function generatePlaylist(mood: string): Promise<Song[]> {
    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for playlist.");
        return [
            { title: "Mockingbird", artist: "Eminem" },
            { title: "Coffee", artist: "Beabadoobee" },
            { title: "Sunday Morning", artist: "Maroon 5" },
            { title: "Good Days", artist: "SZA" },
            { title: "Daylight", artist: "David Kushner" },
        ];
    }
    try {
        const prompt = `'${mood}' 테마에 어울리는 노래 5곡을 추천해줘. 각 노래는 제목과 아티스트를 포함해야 해.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        playlist: {
                            type: Type.ARRAY,
                            description: "추천된 노래 목록",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING, description: "노래 제목" },
                                    artist: { type: Type.STRING, description: "아티스트 이름" },
                                },
                                required: ["title", "artist"],
                            },
                        },
                    },
                    required: ["playlist"],
                },
            },
        });
        
        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return Array.isArray(parsed.playlist) ? parsed.playlist : [];

    } catch (error) {
        console.error("Error generating playlist:", error);
        return [{ title: "플레이리스트 생성 실패", artist: "오류가 발생했습니다." }];
    }
}

/**
 * Generates summaries for workshop feedback and networking interests.
 * @param feedback - An array of feedback items.
 * @param interests - An array of networking interests.
 * @returns A promise that resolves to an object with summaries.
 */
export async function generateWorkshopSummaries(feedback: Feedback[], interests: NetworkingInterest[]): Promise<{ feedbackSummary: string; networkingSummary: string; }> {
    const fallbackSummary = {
        feedbackSummary: "워크숍 동안 다양한 질문과 제안, 칭찬이 오갔습니다. 활발한 참여에 감사드립니다!",
        networkingSummary: "기술, 취미, 커리어 등 다채로운 주제에 대한 관심사가 공유되었습니다. 이를 바탕으로 의미 있는 네트워킹이 이루어졌기를 바랍니다.",
    };

    if (!ai) {
        console.warn("Gemini API key not found. Returning mock data for summaries.");
        return fallbackSummary;
    }
    
    try {
        const prompt = `워크숍 활동 요약 AI입니다. 아래에 제공된 피드백 목록과 네트워킹 관심사 목록을 분석하여, 각 항목에 대한 긍정적이고 간결한 요약문을 한국어로 생성해주세요.

데이터:
피드백 목록: ${JSON.stringify(feedback.map(f => ({ category: f.category, message: f.message })))}
네트워킹 관심사: ${JSON.stringify(interests.map(i => i.interests))}

요약문은 아래 JSON 스키마를 따라 생성해야 합니다.
- feedbackSummary: 전반적인 피드백의 경향을 요약합니다. 어떤 질문이 많았는지, 주요 제안은 무엇이었는지, 긍정적인 칭찬 내용은 무엇이었는지 등을 포함해주세요.
- networkingSummary: 참가자들이 주로 어떤 주제에 관심을 보였는지 요약합니다. 가장 많이 언급된 인기 주제나 키워드를 포함해주세요.
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
                    },
                    required: ["feedbackSummary", "networkingSummary"],
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