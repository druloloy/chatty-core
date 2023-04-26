import { openai } from './openai.js';
import { VectorDBQAChain } from 'langchain/chains';
import { OpenAIEmbeddings } from 'langchain/embeddings';
import { PineconeStore } from 'langchain/vectorstores';
import prompt from './prompt.js';
import Pinecone from './pinecone.js';

/**
 * Perform a similarity search against an index using Pinecone and return a response.
 * @async
 * @function
 * @param {string} query - The query to search for in the index.
 * @param {Object} [options={}] - An object containing optional parameters for the function.
 * @param {string} [options.indexName=''] - The name of the index to search.
 * @param {string} [options.namespace=''] - The namespace of the index to search.
 * @returns {Object} - The response object returned from the search.
 */
async function query(query, options = { indexName: '', namespace: '' }) {
	const { namespace, indexName } = options;

	// Get a Pinecone instance and set the current index
	const pinecone = await Pinecone.getInstance();
	await pinecone.setIndex(indexName);

	// Create a vector store from an existing Pinecone index
	const vectorStore = await PineconeStore.fromExistingIndex(
		new OpenAIEmbeddings(),
		{ pineconeIndex: pinecone.index, namespace },
	);

	// Perform a similarity search and create a response object
	const result = await vectorStore.similaritySearch(query, 3);

	const response = await createResponse(query, result);

	// Return the response object
	return response;
}

async function createResponse(query, result) {
	const metadata = result.map((r) => r.metadata);
	const context = metadata
		.map((m) => m.content.replaceAll('\n', ''))
		.join('\n\n');
	const index = metadata.map((m) => m.index);

	const finalPrompt = await prompt.format({
		query,
		context,
	});

	const response = await openai.call(finalPrompt);

	return {
		response,
		index,
	};
}

export default query;
