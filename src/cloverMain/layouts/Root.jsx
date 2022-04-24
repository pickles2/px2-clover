import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import PageInfo from '../views/PageInfo';
import Link from '../components/Link';

export default function Root(props){

	const main = useContext(MainContext);

	return (
		<>
			<div>Pickles 2 Clover</div>
			<hr />
			<PageInfo />
			<hr />
			<p><Link href="?PX=admin.setting">Setting</Link></p>
			<p><Link href="?PX=admin">Dashboard</Link></p>
			<p><a href="?PX=admin.edit_contents">コンテンツを編集する</a></p>
			<p><a href="?">プレビューへ戻る</a></p>
			<p><a href="?PX=admin.logout">ログアウト</a></p>
		</>
	);
}
