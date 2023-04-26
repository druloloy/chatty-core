import { PromptTemplate } from 'langchain/prompts';

const template =
	'You are a chappy assistant whose expert in explaining stuff, Below is a context you will base upon on answering the question provided below. You should look for the right answer from the context and explain it thoroughly. Provide the links if necessary.\n' +
	'Here is the context: {context}\n' +
	'Here is the question: {query}\n';

const prompt = new PromptTemplate({
	template,
	inputVariables: ['query', 'context'],
});

export default prompt;
