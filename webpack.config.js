const path = require('path')
// const webpack = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
module.exports = env => {

  const isProduction = !!env&&env.production
  // const isDevelopment = !!env&&env.development
  // const isStaging = !!env&&env.staging
  const mode = isProduction?'production':'development'

  return {
    mode
    ,entry: './src/js/index.js'
    ,output: {
      filename: 'js/index.js'
      ,path: path.resolve(__dirname,'dist')
    }
    ,devServer: {
      static: {
        directory: path.join(__dirname, 'dist'),
      },
      compress: true,
      port: 6969,
    }
    ,devtool: 'source-map'
    ,module: {
      rules: [{
        test: /\.js$/
        ,exclude: /node_modules/
        ,use: {
          loader: 'babel-loader'
          ,options: { babelrc: true }
        }
      }]
    }
    ,plugins: [
      new CopyWebpackPlugin({patterns:[
          { from: 'src/index.html', to: './'}
          ,{ from: 'node_modules/pdfjs-dist/build/pdf.worker.js', to: './js'}
      ]})
    ]
  }
}
