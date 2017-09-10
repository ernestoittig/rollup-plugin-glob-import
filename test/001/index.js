async function test(run) {

	const assert = require('assert');
	const path = require('path');
	const vm = require('vm');
	const {rollup} = require('rollup');
	const globImport = require('../..');

	const input = path.join(__dirname, 'src', 'index.js');
	const params = {};

	await run('bundle', async () => {
		params.bundle = await rollup({
			input,
			plugins: [
				{
					transform(source, id) {
						return source.split('__dirname').join(path.dirname(id));
					}
				},
				globImport({debug: true})
			]
		});
	});

	await run('generate code', async () => {
		params.code = (await params.bundle.generate({format: 'es'})).code;
	});

	await run('run code', () => {
		params.result = {};
		vm.runInNewContext(params.code, {result: params.result});
	});

	await run('test the result', async () => {
		const expected = {
			a: 'a',
			b: 'b',
			c: 'c',
			d: 'd',
		};
		assert.deepEqual(params.result, expected);
	});

}

module.exports = test;
