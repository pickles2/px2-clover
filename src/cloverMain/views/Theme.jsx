import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

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
						'lang': window.clover_config.lang,
						'gpiBridge': function(input, callback){
							main.px2utils.px2cmd(
								'/?PX=px2dthelper.px2te.gpi',
								{
									"data": btoa(JSON.stringify(input)),
								},
								function( res ){
									callback(res);
								}
							);
							return;
						},
						'themeLayoutEditor': function(themeId, layoutId){
							alert('themeLayoutEditor: '+themeId+'/'+layoutId);
						},
						'openInFinder': function(path){
							alert('openInFinder: '+path);
						},
						'openInTextEditor': function(path){
							alert('openInTextEditor: '+path);
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
