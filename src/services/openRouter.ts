import { env } from 'process';
import OpenAI from 'openai';

const openRouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: env.OPENROUTER_API_KEY,
});

export default openRouter;
