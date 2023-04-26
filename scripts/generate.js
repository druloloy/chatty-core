import { PDFLoader } from 'langchain/document_loaders';
import Pinecone from './pinecone.js';
import crypto from 'crypto';
import path from 'path';
import { readFileEmbeddings, writeFileEmbeddings } from './filewriter.js';
import { embedder } from './openai.js';
import { recordFailedUpsert, getFailedUpsert } from './upsertcatcher.js';

/**
 * A function that generates embeddings from a PDF file and upserts them to an index.
 * @async
 * @function
 * @param {Object} options - An object containing options for the generation and upserting of embeddings.
 * @param {string} options.filepath - The path to the PDF file to generate embeddings from.
 * @param {string} options.namespace - The namespace of the index to upsert the embeddings to.
 * @param {Object} options.metadata - An object containing metadata to attach to the embeddings.
 * @returns {undefined}
 */
async function generate(
	options = {
		filepath: '',
		namespace: '',
		metadata: {},
	},
) {
	const { filepath, namespace, metadata: mdata } = options;
	const document = await loadPDF(filepath);
	const contents = document.map((doc) => doc.pageContent);
	const upsertOptions = {
		content: contents,
		namespace,
		metadata: mdata,
	};

	// check if there is a failed upsert
	const recentFile = await getFailedUpsert();

	// if there is a failed upsert, load the embeddings from the embeddings file. Otherwise, generate the embeddings
	const method = recentFile ? 'fromEmbeddingsFile' : 'fromRawPDF';
	methods[method](upsertOptions);
}

async function loadPDF(filepath) {
	if (!filepath) {
		throw new Error('Filepath is required');
	}

	const loader = new PDFLoader(path.join(filepath));
	const document = await loader.load();
	return document;
}

async function upsertVectors(
	options = {
		embeddings: [[Number]],
		content: [''],
		metadata: {},
		namespace: '',
	},
) {
	try {
		const { content, embeddings, metadata, namespace } = options;
		const data = [];

		for (let i = 0; i < embeddings.length; i++) {
			const id = generateUUID();
			const mdata = {
				content: content[i] || '',
				index: i,
				...metadata,
			};

			data.push({
				id,
				values: embeddings[i],
				metadata: mdata,
			});
		}
		const pinecone = await Pinecone.getInstance();
		await pinecone.upsert(data, namespace);
	} catch (error) {
		throw new Error(error);
	}
}

async function catchUpsertError(error, embeddingsFileName) {
	console.error({
		error,
		note: `Embeddings file: ${embeddingsFileName}.`,
	});

	await recordFailedUpsert(embeddingsFileName);
}

const methods = {
	/**
	 * A function that extracts embeddings from documents, writes them to a file, and upserts them to an index.
	 * @async
	 * @function
	 * @param {Object} upsertOptions - An object containing options for the upsert process.
	 * @param {string} upsertOptions.contents - The contents of the documents to extract embeddings from.
	 * @returns {undefined}
	 */
	fromRawPDF: async function (upsertOptions) {
		const embeddings = await embedder.embedDocuments(contents);
		const embeddingsFileName = await writeFileEmbeddings(embeddings);
		await upsertVectors({ embeddings, ...upsertOptions })
			.then(async () => {
				await recordFailedUpsert(''); // remove recent failed upsert
				console.log('Upserted embeddings');
			})
			.catch(async (error) => {
				await catchUpsertError(error, embeddingsFileName);
			});
	},
	/**
	 * A function that retrieves embeddings from a recent file, and upserts them to an index.
	 * @async
	 * @function
	 * @param {Object} upsertOptions - An object containing options for the upsert process.
	 * @param {string} upsertOptions.recentFile - The filename of the recent embeddings file.
	 * @returns {undefined}
	 */
	fromEmbeddingsFile: async function (upsertOptions) {
		const embeddings = await readFileEmbeddings(recentFile);
		await upsertVectors({ embeddings, ...upsertOptions }).then(
			async () => {
				await recordFailedUpsert(''); // remove recent failed upsert
				console.log(
					"Upserted recent failed upsert's embeddings",
				);
			},
		);
	},
};

/**
 * The function generates a random UUID using the crypto library in JavaScript.
 * @returns The function `generateUUID()` is returning a randomly generated UUID (Universally Unique
 * Identifier) using the `crypto.randomUUID()` method.
 */
function generateUUID() {
	return crypto.randomUUID();
}

export default generate;
