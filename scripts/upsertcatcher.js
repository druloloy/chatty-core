import fs from 'fs/promises';
import path from 'path';
async function recordFailedUpsert(filename) {
	const data = {
		recent: filename,
	};
	await fs.writeFile(
		path.join('embeddings', 'embeddings.log'),
		JSON.stringify(data),
	);
}

async function getFailedUpsert() {
	const data = await fs.readFile(path.join('embeddings', 'embeddings.log'));
	const recent = JSON.parse(data)?.recent;
	if (!recent) return null;
	return recent;
}
export { recordFailedUpsert, getFailedUpsert };
