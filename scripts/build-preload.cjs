const path = require('path');
const { build } = require('esbuild');

const buildPreload = async () => {
  try {
    await build({
      entryPoints: [path.join(__dirname, '../src/main/preload.ts')],
      outfile: path.join(__dirname, '../dist/main/preload.js'),
      platform: 'node',
      target: 'node16',
      bundle: true,
      minify: true,
      format: 'cjs',
      external: ['electron']
    });
    console.log('Preload script built successfully');
  } catch (error) {
    console.error('Failed to build preload script:', error);
    process.exit(1);
  }
};

buildPreload();
