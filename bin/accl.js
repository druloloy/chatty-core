#!/usr/bin/env node

const { argv } = await import('process');
const { query } = await import('../index.js');

(async () => {
	const q_command = argv.indexOf('-q') || argv.indexOf('--query');
	const i_command = argv.indexOf('-i') || argv.indexOf('--index');
	const n_command = argv.indexOf('-n') || argv.indexOf('--namespace');

	if (q_command > -1 && i_command > -1 && n_command > -1) {
		const q = argv[q_command + 1];
		const i = argv[i_command + 1];
		const n = argv[n_command + 1];
		if (
			typeof q === 'string' &&
			typeof i === 'string' &&
			typeof n === 'string'
		) {
			await query(q, {
				indexName: i,
				namespace: n,
			}).then((res) => {
				const { response } = res;
				console.log(response);
			});
		}
	} else {
		console.log('Invalid arguments');
	}
})();
