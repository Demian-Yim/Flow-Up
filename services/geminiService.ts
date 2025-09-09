import { GoogleGenAI, Type } from "@google/genai";

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
