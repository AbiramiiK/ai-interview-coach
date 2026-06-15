require("dotenv").config();

const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

async function test() {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "Generate 3 React interview questions",
        },
      ],
      model: "llama-3.3-70b-versatile",
    });

    console.log("\nAI RESPONSE:\n");
    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error("ERROR:");
    console.error(error);
  }
}

test();