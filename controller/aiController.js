const Course = require("../model/courseSchema");
const Message = require("../model/messageSchema");
const User = require("../model/userSchema");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = await Message.find({ userId }).sort({createdAt: 1});
    return res
      .status(200)
      .json({ message: "Fetch messages successfully", messages: messages });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Server error", error: err.message });
  }
};
const getRecommendation = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

     if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }
    // const user = User.find(userId)
    const availableCourses = await Course.find(
      {},
      "_id title description price category"
    )
      .limit(10)
      .lean();

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      // Set response_mime_type to ensure we get valid JSON back
      generationConfig: { responseMimeType: "application/json" },
      systemInstruction: `
        You are a helpful LMS Career Counselor. 
        Your goal is to recommend courses from the provided catalog based on user interests.
        
        CATALOG:
        ${JSON.stringify(availableCourses)}

        SCHEMA:
        {
          "chatResponse": "The natural language message to the user",
          "recommendations": [
            { 
          "courseId": "course_id", 
          "title": "course_title", 
          "price": "course_price", 
          "courseImage": "course_image_url", 
          "reason": "why you recommended it" }
          ]
        }
        
        RULES:
        - If a user asks for a recommendation, pick the top 2-3 relevant courses.
        - Explain WHY you recommended them based on their query, but don't make it too long.
        - If no course matches, suggest the closest alternative or ask for more details.
        - Always include the exact Course Title in your response.
      `,
    });

    const historyMessages = await Message.find({ userId })
      .sort({ createdAt: 1 })
      .limit(10);

    const history = historyMessages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({history});
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const JSONResponse = JSON.parse(result.response.text());

    await Message.create({
      userId,
      role: "user",
      content: message,
    });

    await Message.create({
      userId,
      role: "bot",
      content: JSONResponse.chatResponse,
      recommendations: JSONResponse.recommendations,
    });

    res.status(200).json({ reply: response.text(), course: JSONResponse });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Chat service unavailable", error: err.message });
  }
};

module.exports = { getRecommendation, getMessages };
