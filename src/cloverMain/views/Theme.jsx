import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';
import utils79 from 'utils79';

export default React.memo(function Theme(props){

	const main = useContext(MainContext);
	const path_client_resources = window.clover_config.paths.path_client_resources;

	/**
	 * 画面を初期化するする
	 */
	function initialize( callback ){
		callback = callback || function(){};
		$('.cont-px2-clover__px2te-resources').remove();
		main.px2utils.px2cmd(
			'/?PX=px2dthelper.px2te.client_resources',
			{},
			function( res ){
				for(var index in res.css){
					var $linkElement = $('<link />');
					$linkElement.attr({
						'rel': 'stylesheet',
						'href': path_client_resources + '__px2te/' + res.css[index],
						'class': 'cont-px2-clover__px2te-resources',
					});
					$('head').append( $linkElement );
				}
				for(var index in res.js){
					var $scriptElement = $('<script />');
					$scriptElement.attr({
						'src': path_client_resources + '__px2te/' + res.js[index],
						'class': 'cont-px2-clover__px2te-resources',
					});
					$('head').append( $scriptElement );
				}

				var pickles2ThemeEditor = new Pickles2ThemeEditor();
				pickles2ThemeEditor.init(
					{
						'elmCanvas': document.getElementById('cont-px2te-canvas'),
						'lang': (window.clover_config.lang ? window.clover_config.lang : 'ja'),
						'gpiBridge': function(input, callback){
							var data = utils79.base64_encode(JSON.stringify(input));
							main.px2utils.px2cmd(
								'/?PX=px2dthelper.px2te.gpi',
								{
									"data": data,
								},
								function( res ){
									callback(res);
								}
							);
							return;
						},
						'themeLayoutEditor': function(themeId, layoutId){
							var href = main.px2utils.href('/'+themeId+'/'+layoutId+'.html');
							window.open(href+'?PX=admin.edit_theme_layout&theme_id='+encodeURIComponent(themeId)+'&layout_id='+encodeURIComponent(layoutId));
						},
						'openInFinder': function(path){
							alert('開発中の機能です。 (openInFinder: '+path+')');
						},
						'openInTextEditor': function(path){
							alert('開発中の機能です。 (openInTextEditor: '+path+')');
						}
					},
					function(){
						// スタンバイ完了したら呼び出されるコールバックメソッドです。
						console.info('standby!!');
					}
				);

				return;
			}
		);
	}
	useEffect(() => {
		initialize();
		return () => {
			$('.cont-px2-clover__px2te-resources').remove();
		};
	}, []);

	return (
		<>
			<div id="cont-px2te-canvas"></div>
		</>
	);
});
