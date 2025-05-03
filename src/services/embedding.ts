import { CohereClientV2 } from 'cohere-ai';
import { env } from 'process';

const cohere = new CohereClientV2({ token: env.COHERE_API_KEY });

export default cohere