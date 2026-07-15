import dotenv from "dotenv";
dotenv.config();

import { askGemini } from "./services/geminiService.js";

const answer = await askGemini("Introduce yourself in one sentence.");

console.log(answer);