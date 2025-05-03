
import OpenAI from 'openai';

const openRouter = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || '',
  dangerouslyAllowBrowser: true
});

export default openRouter;
