import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function ConfigMembers(props){

	const main = useContext(MainContext);

	return (
		<>
			<p>
				開発中の機能です。<br />
			</p>
			<p><Link href="?PX=admin.config">戻る</Link></p>
		</>
	);
}
