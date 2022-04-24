import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function PageInfo(props){

	const main = useContext(MainContext);

	return (
		<>
			<div>{main.PX}</div>
			<p><Link href="?PX=admin.setting">Setting</Link></p>
			<p><Link href="/hoge/fuga.html?PX=admin.test">Test</Link></p>
			<p><Link href="?PX=admin">Dashboard</Link></p>
		</>
	);
}
