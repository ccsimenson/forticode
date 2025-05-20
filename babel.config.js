module.exports = (api) => {
  const isTest = api.env('test');
  
  return {
    presets: [
      ['@babel/preset-env', { 
        targets: isTest ? { node: 'current' } : '> 0.25%, not dead',
        modules: isTest ? 'commonjs' : false,
        useBuiltIns: 'usage',
        corejs: 3,
      }],
      ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
      ['@babel/preset-react', { runtime: 'automatic' }],
    ],
    plugins: [
      isTest ? '@babel/plugin-transform-modules-commonjs' : null,
    ].filter(Boolean),
  };
};
