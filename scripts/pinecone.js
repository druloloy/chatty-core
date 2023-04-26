import { PineconeClient } from '@pinecone-database/pinecone';

/**
 * A singleton class that provides methods for working with the Pinecone service.
 * @namespace Pinecone
 */
const Pinecone = (() => {
	let instance;

	/**
	 * Creates a new instance of the Pinecone class and initializes it with the specified index name.
	 * @memberof Pinecone
	 * @function createInstance
	 * @async
	 * @returns {Promise<Object>} An object with methods for interacting with the Pinecone service.
	 */
	async function createInstance() {
		const pinecone = new PineconeClient();

		await pinecone.init({
			environment: process.env.PINECONE_ENVIRONMENT,
			apiKey: process.env.PINECONE_API_KEY,
		});

		let index = pinecone.Index(process.env.PINECONE_INDEX || undefined);

		/**
		 * Sets the name of the index to use.
		 * @memberof Pinecone.createInstance
		 * @function setIndex
		 * @async
		 * @param {string} indexName - The name of the index to use.
		 */
		async function setIndex(indexName) {
			index = pinecone.Index(indexName);
		}

		/**
		 * Upserts the specified data to the current index.
		 * @memberof Pinecone.createInstance
		 * @function upsert
		 * @async
		 * @param {Vector[]} array - The data to upsert to the index.
		 * @param {string} namespace - The namespace to use for the upsert operation.
		 */
		async function upsert(array, namespace) {
			await index.upsert({
				upsertRequest: {
					namespace,
					vectors: array,
				},
			});
		}

		/**
		 * Performs a query on the current index.
		 * @memberof Pinecone.createInstance
		 * @function query
		 * @async
		 * @param {Object} query - The query to perform on the index.
		 * @returns {Promise<Object>} The response from the index.
		 */
		async function query(query) {
			const response = await index.query(query);
			return response;
		}

		return {
			setIndex,
			upsert,
			query,
			get index() {
				return index;
			},
		};
	}

	return {
		/**
		 * Gets the singleton instance of the Pinecone class, creating it if necessary.
		 * @memberof Pinecone
		 * @function getInstance
		 * @async
		 * @returns {Promise<Object>} An object with methods for interacting with the Pinecone service.
		 */
		getInstance: async () => {
			if (!instance) {
				instance = await createInstance();
			}
			return instance;
		},
	};
})();

export default Pinecone;
