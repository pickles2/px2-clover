import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import PageInfo from '../views/PageInfo';
import Link from '../components/Link';
import $ from 'jquery';

export default function Root(props){

	const main = useContext(MainContext);

	function clearcache(){
		px2style.loading();
		$.ajax({
			"url": "?PX=clearcache",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('------ clearcache Response Error:', typeof(error), error);
			},
			"success": function(data){
				console.log('------ clearcache Response:', typeof(data), data);
			},
			"complete": function(){
				alert('clearcache done.');
				px2style.closeLoading();
			},
		});
	}

	function publish(){
		px2style.loading();
		$.ajax({
			"url": "?PX=publish.run",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('------ publish Response Error:', typeof(error), error);
			},
			"success": function(data){
				console.log('------ publish Response:', typeof(data), data);
			},
			"complete": function(){
				alert('publish done.');
				px2style.closeLoading();
			},
		});
	}

	return (
		<>
			<div>Pickles 2 Clover</div>
			<hr />
			<PageInfo />
			<hr />
			<p><Link href="?PX=admin.setting">Setting</Link></p>
			<p><Link href="?PX=admin">Dashboard</Link></p>
			<p><a href="?PX=admin.edit_contents">コンテンツを編集する</a></p>
			<hr />
			<ul>
				<li><button type="button" onClick={publish}>パブリッシュ</button></li>
				<li><button type="button" onClick={clearcache}>キャッシュを消去</button></li>
			</ul>
			<hr />
			<p><a href="?">プレビューへ戻る</a></p>
			<p><a href="?PX=admin.logout">ログアウト</a></p>
		</>
	);
}
