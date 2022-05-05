import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function Config(props){

	const main = useContext(MainContext);

	return (
		<>
			<ul>
				<li><Link href="?PX=admin.config.profile">プロフィールを編集する</Link></li>
				<li><Link href="?PX=admin.config.scheduler">タスクスケジュール設定</Link></li>
			</ul>
		</>
	);
}
