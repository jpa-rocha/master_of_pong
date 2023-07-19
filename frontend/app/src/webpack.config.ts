

module.exports = {
  target: 'node',  
  resolve: {
      fallback: {
        "stream": false,
        "crypto": false,
        // "stream": require.resolve("stream-browserify"),
        // "crypto": require.resolve('crypto-browserify'),
        // "crypto-browserify": require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify 
      }
    },
}

export default module.exports;