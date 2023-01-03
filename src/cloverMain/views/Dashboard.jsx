import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import iterate79 from 'iterate79';

export default function Dashboard(props){

	const main = useContext(MainContext);
	const templates = {
		"editSiteProfile": require('./Dashboard_files/templates/editSiteProfile.twig'),
	};

	/**
	 * サイト設定情報を編集する
	 */
	function editSiteProfile(){
		let parsedConfig = null;

		iterate79.fnc({}, [
			function(it1){
				window.px2utils.px2cmd(
					'/?PX=px2dthelper.config.parse',
					{},
					function( res ){
						parsedConfig = res;
						it1.next();
					}
				);
			},
			function(it1){
				const $body = $(templates.editSiteProfile({
					"parsedConfig": parsedConfig,
					"pxConfig": main.pxConfig,
				}));
				const modalObj = px2style.modal({
					"title": "Edit Site Profile",
					"body": $body,
					"form": {
						"action": "javascript:void(0);",
						"method": "get",
						"submit": function(){
							modalObj.lock();
							const params = {
								"values": {
									"name": $body.find('[name=name]').val(),
									"domain": $body.find('[name=domain]').val(),
									"copyright": $body.find('[name=copyright]').val(),
								},
							};

							window.px2utils.px2cmd(
								'/?PX=px2dthelper.config.update',
								{
									"json": JSON.stringify(params),
								},
								function( res ){
									if( !res || !res.result ){
										alert( res.message );
										modalObj.unlock();
										return;
									}

									// NOTE: 変更が反映されるまでにタイムラグが発生するので、2秒のタメを作った。
									// NOTE: [要調査] なぜタイムラグが生まれるのかは不明。
									setTimeout(function(){
										window.location.reload();
									}, 2000);
								}
							);
						},
					},
					'buttons':[
						$('<button type="submit" class="px2-btn px2-btn--primary">')
							.text('保存する')
					],
					'buttonsSecondary': [
						$('<button type="button" class="px2-btn">')
							.text('キャンセル')
							.on('click', function(){
								px2style.closeModal();
							}),
					],
				}, function(){});

				it1.next();
			},
		]);
	}


	return (
		<>
			<p>ようこそ、Pickles 2 Clover CMS へ！</p>
			{!main.pxConfig
				?<></>
				:<>
					<h2>Site Profile</h2>
					<table className="px2-table">
						<colgroup>
							<col width="30%" />
							<col width="70%" />
						</colgroup>
						<tbody>
						<tr>
							<th>Site Name</th>
							<td>{main.pxConfig.name || '---'}</td>
						</tr>
						<tr>
							<th>Domain</th>
							<td>{main.pxConfig.domain || '---'}</td>
						</tr>
						<tr>
							<th>Copyright</th>
							<td>{main.pxConfig.copyright ? <>&copy;{main.pxConfig.copyright}, All rights reserved.</> : '---'}</td>
						</tr>
						</tbody>
					</table>
					<p>
						<button type="button" className="px2-btn px2-btn--primary" onClick={editSiteProfile}>編集する</button>
					</p>
				</>
			}
		</>
	);
}
