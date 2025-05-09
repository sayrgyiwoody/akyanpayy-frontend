import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import axios from "axios";

// import { db } from "@/firebase/admin";

// https://sdk.vercel.ai/docs/foundations/overview
export async function POST(request: Request) {
  console.log("Post request is running");
  const { type="behavioral", role, level, techstack, userid } = await request.json();

  try {
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        Ask only at least 2 questions for whole interview and atmost 3 questions
        Please return only the questions, without any additional text.
        The questions are going to be read by a voice assistant so do not use "/" or "*" or any other special characters which might break the voice assistant.
        Return the questions formatted like this:
        ["Question 1", "Question 2", "Question 3"]
        
        Thank you! <3
    `,
    });

    const interview = {
      role: role,
      type: type,
      level: level,
      techstack: techstack.split(","),
      questions: JSON.parse(questions),
      userId: userid,
      finalized: true,
      createdAt: new Date().toISOString(),
    };
    console.log("interview", interview);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/interviews`, interview,{
        headers: {
          "Content-Type": "application/json",
        },
      }); 
      console.log("api",response)
      console.log("api",response.data)

      return response.data;
    } catch (error: any) {
      console.error("Error storing interview:", error.response?.data || error.message);
      throw error;
    }
    
  } catch (error) {
    console.error("Error:", error);
    return Response.json({ success: false, error: error }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ success: true, data: "Thank you!" }, { status: 200 });
}
