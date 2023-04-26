import { OpenAI } from 'langchain';
import { OpenAIEmbeddings } from 'langchain/embeddings';
await import('dotenv').then((dotenv) => dotenv.config());
const openai = new OpenAI({
	openAIApiKey: process.env.OPENAI_API_KEY,
	cache: true,
});

const embedder = new OpenAIEmbeddings({
	modelName: 'text-embedding-ada-002',
});

export { openai, embedder };
