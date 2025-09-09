
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you might want to handle this more gracefully.
  // For this example, we'll proceed, and API calls will fail if no key is provided.
  console.warn("API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export async function generateIntroductions(name: string, job: string, interests: string): Promise<Record<string, string> | null> {
    const prompt = `워크숍 참가자를 위한 자기소개를 3가지 스타일(전문가, 친근한, 유머러스)로 생성해줘. 각 스타일은 150자 이내로 작성해줘.
    - 이름: ${name}
    - 직업/소속: ${job}
    - 관심사: ${interests}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        expert: { type: Type.STRING, description: '전문적인 톤의 자기소개' },
                        friendly: { type: Type.STRING, description: '친근한 톤의 자기소개' },
                        humorous: { type: Type.STRING, description: '유머러스한 톤의 자기소개' },
                    },
                    required: ['expert', 'friendly', 'humorous'],
                },
            },
        });
        
        const jsonString = response.text.trim();
        return JSON.parse(jsonString);

    } catch (error) {
        console.error("Error generating introductions:", error);
        // Return mock data if API fails
        return {
            expert: `안녕하세요, ${job} 직무를 맡고 있는 ${name}입니다. ${interests}에 관심이 많으며, 이번 워크숍을 통해 새로운 인사이트를 얻고자 합니다.`,
            friendly: `반가워요! ${name}이라고 해요. 저는 ${job}이고, 요즘 ${interests}에 푹 빠져있답니다! 여러분과 즐겁게 소통하고 싶어요.`,
            humorous: `여러분의 비타민, ${name}입니다! ${job}으로 일하고 있지만, 사실 제 본업은 ${interests} 전문가입니다. 잘 부탁드려요!`,
        };
    }
}

export async function generateTeamNames(keywords: string): Promise<string[]> {
    const prompt = `다음 키워드를 바탕으로 창의적이고 기억하기 쉬운 팀명 5개를 제안해줘. 각 팀명은 3-8글자 사이, 긍정적이고 발음하기 쉬워야 해.
    - 키워드: ${keywords}`;

    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
             config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        teamNames: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['teamNames']
                }
            }
        });
        const jsonString = response.text.trim();
        const parsed = JSON.parse(jsonString);
        return parsed.teamNames || [];
    } catch (error) {
        console.error("Error generating team names:", error);
        return ["알파", "브라보", "찰리", "델타", "에코"];
    }
}

export async function generateMotivation(topic: string): Promise<string> {
    const prompt = `${topic}와(과) 관련된, 워크숍 참가자들에게 영감을 줄 수 있는 짧고 강력한 동기부여 명언을 하나 생성해줘.`;
    try {
        const response: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error("Error generating motivation:", error);
        return "가장 큰 위험은 아무런 위험도 감수하지 않는 것이다.";
    }
}
