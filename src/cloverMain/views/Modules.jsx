import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';
import utils79 from 'utils79';

export default React.memo(function Modules(props){

	const main = useContext(MainContext);
	const path_client_resources = window.clover_config.paths.path_client_resources;

	const isModuleEditorAuthorized = (main.bootupInfoLoaded && main.bootupInfo.authorization.server_side_scripting);

	/**
	 * 画面を初期化するする
	 */
	function initialize( callback ){
		callback = callback || function(){};
		$('.cont-px2-clover__px2me-resources').remove();
		main.px2utils.pxCmd(
			'/?PX=px2dthelper.px2me.client_resources',
			{},
			function( res ){
				for(var index in res.css){
					var $linkElement = $('<link />');
					$linkElement.attr({
						'rel': 'stylesheet',
						'href': res.path_base + res.css[index],
						'class': 'cont-px2-clover__px2me-resources',
					});
					$('head').append( $linkElement );
				}
				for(var index in res.js){
					var $scriptElement = $('<script />');
					$scriptElement.attr({
						'src': res.path_base + res.js[index],
						'class': 'cont-px2-clover__px2me-resources',
					});
					$('head').append( $scriptElement );
				}

				var pickles2ModuleEditor = new Pickles2ModuleEditor();
				pickles2ModuleEditor.init(
					{
						'elmCanvas': document.getElementById('cont-px2me-canvas'),
						'lang': window.clover_config.lang,
						'preview':{
							'origin': window.location.origin,
						},
						'gpiBridge': function(input, callback){
							var data = utils79.base64_encode(JSON.stringify(input));
							main.px2utils.pxCmd(
								'/?PX=px2dthelper.px2me.gpi',
								{
									"data": data,
								},
								function( res ){
									callback(res);
								}
							);
							return;
						},
						'complete': function(){
							alert('完了しました。');
						},
						'onMessage': function( message ){
							// ユーザーへ知らせるメッセージを表示する
							console.info('message: '+message);
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
			$('.cont-px2-clover__px2me-resources').remove();
		};
	}, []);

	if( !isModuleEditorAuthorized ){
		return (<p>権限がありません。</p>);
	}

	return (
		<>
			<div id="cont-px2me-canvas"></div>
		</>
	);
});
