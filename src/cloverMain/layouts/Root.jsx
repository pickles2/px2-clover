import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';

export default function Root(props){

	const main = useContext(MainContext);
	function goto(e){
		console.log(e.target.href);
		e.preventDefault();
		main.link(e.target.href);
		return false;
	}

	return (
		<>
			<div>Pickles 2 Clover</div>
			<div>Route.jsx - 開発中 {main.PX}</div>
			<p><a href="?PX=admin.setting" onClick={goto}>Setting</a></p>
			<p><a href="?PX=admin" onClick={goto}>Dashboard</a></p>
			<p><a href="?PX=admin.edit_contents">コンテンツを編集する</a></p>
			<p><a href="?">プレビューへ戻る</a></p>
			<p><a href="?PX=admin.logout">ログアウト</a></p>
		</>
	);
}
