/**
 * A class representing an upsert request for a Pinecone index.
 * @class
 * @property {function} addVector - A function that adds a vector to the upsert request.
 * @property {function} setNamespace - A function that sets the namespace for the upsert request.
 * @property {function} getRequest - A function that gets the upsert request object.
 * @property {Array} vectors - An array of vectors in the upsert request.
 * @property {string} namespace - The namespace for the upsert request.
 */
const UpsertRequest = (() => {
	let instance;

	function createInstance() {
		const vectors = [];
		let namespace;

		function addVector({ id = '', values = [], metadata = {} }) {
			vectors.push({
				id,
				values,
				metadata,
			});
		}

		function setNamespace(value) {
			namespace = value;
		}

		function getRequest() {
			return {
				namespace,
				vectors,
			};
		}

		return {
			get vectors() {
				return vectors;
			},
			get namespace() {
				return namespace;
			},
			addVector,
			setNamespace,
			getRequest,
		};
	}

	return {
		getInstance: () => {
			if (!instance) {
				instance = createInstance();
			}
			return instance;
		},
	};
})();

export default UpsertRequest;
