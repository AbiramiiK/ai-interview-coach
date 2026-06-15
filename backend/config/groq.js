const Groq = require("groq-sdk");

console.log("API KEY LOADED:", process.env.GROQ_API_KEY ? "YES" : "NO");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = { groq };