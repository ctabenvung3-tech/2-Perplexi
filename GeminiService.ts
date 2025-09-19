
import { GoogleGenAI, Type } from "@google/genai";
import { Survey, QuestionType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const surveySchema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: 'Tiêu đề chính của biểu mẫu khảo sát.'
    },
    description: {
      type: Type.STRING,
      description: 'Mô tả ngắn gọn về mục đích của khảo sát.'
    },
    questions: {
      type: Type.ARRAY,
      description: 'Danh sách các câu hỏi trong khảo sát.',
      items: {
        type: Type.OBJECT,
        properties: {
          title: {
            type: Type.STRING,
            description: 'Nội dung của câu hỏi.'
          },
          questionType: {
            type: Type.STRING,
            enum: Object.values(QuestionType),
            description: 'Loại câu hỏi.'
          },
          options: {
            type: Type.ARRAY,
            description: 'Danh sách các lựa chọn cho câu hỏi trắc nghiệm, hộp kiểm, hoặc thả xuống. Rỗng cho các loại khác.',
            items: {
              type: Type.STRING
            }
          },
          isRequired: {
            type: Type.BOOLEAN,
            description: 'Câu hỏi này có bắt buộc trả lời không.'
          }
        },
        required: ['title', 'questionType', 'isRequired']
      }
    }
  },
  required: ['title', 'description', 'questions']
};

export const generateSurveyFromPrompt = async (prompt: string): Promise<Survey> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Dựa trên yêu cầu sau, hãy tạo một biểu mẫu khảo sát chi tiết. Yêu cầu: "${prompt}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: surveySchema,
      },
    });

    const jsonText = response.text.trim();
    const generatedSurvey = JSON.parse(jsonText);
    
    // Add unique IDs to each question
    const surveyWithIds: Survey = {
      ...generatedSurvey,
      questions: generatedSurvey.questions.map((q: any) => ({
        ...q,
        id: crypto.randomUUID(),
        options: q.options || [] // Ensure options is always an array
      }))
    };
    
    return surveyWithIds;

  } catch (error) {
    console.error("Error generating survey:", error);
    throw new Error("Không thể tạo khảo sát từ AI. Vui lòng thử lại.");
  }
};
   