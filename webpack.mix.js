const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix
	.webpackConfig({
		module: {
			rules:[
				{
					test:/\.twig$/,
					use:['twig-loader']
				},
				{
					test: /\.jsx$/,
					exclude: /(node_modules|bower_components)/,
					use: [{
						loader: 'babel-loader',
						options: {
							presets: [
								'@babel/preset-react',
								'@babel/preset-env'
							]
						}
					}]
				}
			]
		},
		resolve: {
			fallback: {
				"fs": false,
				"path": false,
				"crypto": false
			}
		}
	})


	// --------------------------------------
	// cloverMain Script
	.js('src/cloverMain/cloverMain.jsx', 'public/resources/cloverMain/')
	.sass('src/cloverMain/cloverMain.scss', 'public/resources/cloverMain/')

	// --------------------------------------
	// previewFooter Script
	.js('src/previewFooter/previewFooter.js', 'public/resources/previewFooter/')
	.sass('src/previewFooter/previewFooter.scss', 'public/resources/previewFooter/')


	// --------------------------------------
	// Static Frontend Libraries
	.copyDirectory('vendor/pickles2/px2style/dist', 'public/resources/px2style/dist')
;
