const path = await import('path');
const fs = await import('fs/promises');

async function writeFileEmbeddings(embeddings) {
	try {
		const filename = `embeddings-${_formatDate()}.txt`;

		if (!checkFolderExists('embeddings')) {
			await fs.mkdir(path.join('embeddings'));
		}

		await fs.writeFile(
			path.join('embeddings', filename),
			JSON.stringify(embeddings),
			(err) => {
				if (err) throw err;
				console.log(filename + ' has been saved!');
			},
		);

		return filename;
	} catch (error) {
		throw new Error(error);
	}
}

async function readFileEmbeddings(filename) {
	try {
		const data = await fs.readFile(
			path.join('embeddings', filename),
			'utf8',
		);
		return JSON.parse(data);
	} catch (error) {
		throw new Error(error);
	}
}

function _formatDate() {
	const date = new Date();
	const formattedDate = date.toISOString().slice(0, 10).replace(/-/g, '');
	const time = String(date.getTime());
	return `${formattedDate}-${time}`;
}

async function checkFolderExists(folderPath) {
	try {
		await fs.access(path.join(folderPath), fs.constants.F_OK);
		return true;
	} catch (error) {
		return false;
	}
}

export { writeFileEmbeddings, readFileEmbeddings };
