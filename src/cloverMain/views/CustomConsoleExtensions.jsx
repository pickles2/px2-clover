import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import iterate79 from 'iterate79';

export default function CustomConsoleExtensions(props){

	const main = useContext(MainContext);
	const path_client_resources = window.clover_config.paths.path_client_resources;
	const [customConsoleExtensionsList, setCustomConsoleExtensionsList] = useState(null);

	useEffect(() => {
		main.px2utils.px2cmd(
			'/?PX=px2dthelper.custom_console_extensions',
			{},
			function( res ){
				console.log('-- CCE:', res);
				if( !res.result ){
					console.error('Error:', res);
				}
				setCustomConsoleExtensionsList(res);
			}
		);
	}, []);

	const currentCceId = (function(){
		let pxcAry = main.PX.split('.');
		if( pxcAry.length > 2 ){
			return pxcAry[2];
		}
		return null;
	})();

	const currentCce = (()=>{
		if( customConsoleExtensionsList === null ){
			return null;
		}
		if( typeof(currentCceId) !== typeof('string') ){
			return null;
		}
		return customConsoleExtensionsList.list[currentCceId];
	})();

	/**
	 * CCEを初期化する
	 */
	function initializeCce(){
		let cceAgent;

		iterate79.fnc({}, [
			function(it1){
				if( main.title != currentCce.label ){
					main.setMainState({
						title: currentCce.label,
					});
					return;
				}
				it1.next();
			},
			function(it1){
				main.px2utils.px2cmd(
					`/?PX=px2dthelper.custom_console_extensions.${currentCceId}.client_resources`,
					{},
					function( res ){
						if( !res.result ){
							alert('Undefined Extension. ' + res.message);
							return;
						}
						var resources = res.resources;

						iterate79.ary(
							resources.css,
							function(it2, row, idx){
								var link = document.createElement('link');
								link.addEventListener('load', function(){
									it2.next();
								});
								$('.cont-custom-console-extensions__resources').append(link);
								link.rel = 'stylesheet';
								link.href = res.path_base+row;
							},
							function(){
								iterate79.ary(
									resources.js,
									function(it3, row, idx){
										var script = document.createElement('script');
										script.addEventListener('load', function(){
											it3.next();
										});
										$('.cont-custom-console-extensions__resources').append(script);
										script.src = res.path_base+row;
									},
									function(){
										it1.next();
									}
								);
							}
						);

					}
				);
			},
			function(it1){
				cceAgent = new window.Px2dthelperCceAgent({
					'elm': $('.cont-custom-console-extensions__main').get(0),
					'lang': main.lb.getLang(),
					'appMode': 'web',
					'gpiBridge': function(input, callback){
						// GPI(General Purpose Interface) Bridge

						main.px2utils.px2cmd(
							'/?PX=px2dthelper.custom_console_extensions.'+currentCceId+'.gpi'
								+'&request='+encodeURIComponent( JSON.stringify(input) ),
							{},
							function( rtn ){
								callback( rtn );
							}
						);
						return;
					},
					'onEditContent': function(target){
						window.open(target+'?PX=admin.edit_content&backto=close');
					},
					'onEditThemeLayout': function(target){
						// TODO: テーマレイアウト編集画面を開く実装を追加する↓
						// window.open(target+'?PX=admin.edit_theme_layout&theme_id='+encodeURIComponent(themeId)+'&layout_id='+encodeURIComponent(layoutId));
						console.info('開発中の機能です。');
					},
				});

				it1.next();
			},
			function(it1){
				// --------------------------------------
				// Custom Console Extension の初期化を実行する
				eval(currentCce.client_initialize_function+'(cceAgent);');
				it1.next();
			},
			function(){
			},
		]);
		return;
	}


	return (
		<>
			{(customConsoleExtensionsList === null)
				? <>
					...
				</>
				: <>
					{currentCceId === null
						? <>
							{Object.keys(customConsoleExtensionsList.list).length
								? <>
									<div className="px2-linklist">
										<ul>
											{(Object.keys(customConsoleExtensionsList.list).map((cceKey, index) => {
												const listItem = customConsoleExtensionsList.list[cceKey];
												return <li key={index}>
													<Link href={`?PX=admin.cce.${listItem.id}`}>{ listItem.label }</Link>
												</li>;
											}))}
										</ul>
									</div>
								</>
								: <>
									<p>拡張機能は登録されていません。</p>
								</>
							}
							<div className="px2-p">
								<Link href="?PX=admin.config">戻る</Link>
							</div>
						</>
						: <>
							<div className="cont-custom-console-extensions">
								<div className="cont-custom-console-extensions__main"></div>
								<div className="cont-custom-console-extensions__resources"></div>
							</div>
							<div className="px2-p">
								<Link href="?PX=admin.cce">戻る</Link>
							</div>
							{(()=>{
								initializeCce();
								return <></>;
							})()}
						</>
					}
				</>
			}
		</>
	);
}
