
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getAttendanceInsights = async (attendanceData: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following employee attendance data and provide 3 key insights or anomalies for the HR manager. Focus on trends like frequent lateness or absenteeism. Data: ${JSON.stringify(attendanceData)}`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("AI Insights Error:", error);
    return "Could not generate AI insights at this time.";
  }
};

export const suggestShiftSchedule = async (teamSize: number, shiftRules: any) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate an optimal 24/7 weekly shift schedule for a team of ${teamSize} employees. Rules: ${JSON.stringify(shiftRules)}. Return as a structured list of recommendations.`,
    });
    return response.text;
  } catch (error) {
    return "Shift suggestion failed.";
  }
};
