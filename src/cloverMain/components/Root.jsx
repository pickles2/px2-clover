import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';

export default function Root(props){

	const main = useContext(MainContext);

	return (
		<>
			<div>Pickles 2 Clover</div>
			<div>Route.jsx - 開発中</div>
			<p><a href="?PX=admin.edit_contents">コンテンツを編集する</a></p>
			<p><a href="?">プレビューへ戻る</a></p>
			<p><a href="?PX=admin.logout">ログアウト</a></p>
		</>
	);
}
