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
		iterate79.fnc({}, [
			function(it1){
				// TODO: 編集可能な項目を確認する
				it1.next();
			},
			function(it1){
				const $body = $(templates.editSiteProfile({
					"name": main.pxConfig.name,
					"domain": main.pxConfig.domain,
					"copyright": main.pxConfig.copyright,
				}));
				px2style.modal({
					"title": "Edit Site Profile",
					"body": $body,
					"form": {
						"action": "javascript:void(0);",
						"method": "get",
						"submit": function(){
							// TODO: フォームの編集内容を保存する
							alert('Form has submitted.');
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
				});

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
