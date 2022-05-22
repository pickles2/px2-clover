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
	// cloverCommon Script
	.js('src/cloverCommon/cloverCommon.js', 'public/resources/cloverCommon/')
	.sass('src/cloverCommon/cloverCommon.scss', 'public/resources/cloverCommon/')

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
	.copyDirectory('vendor/pickles2/px2style/dist', 'public/resources/px2style')
	.copyDirectory('vendor/pickles2/px2style/dist', 'templates/layouts/auth_files/px2style')
	.copyDirectory('public/resources/jquery-3.6.0.min.js', 'templates/layouts/auth_files/jquery-3.6.0.min.js')
	.copyDirectory('node_modules/gitui79/dist', 'public/resources/gitui79')
;
