import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function Config(props){

	const main = useContext(MainContext);

	return (
		<>
			<p>この機能は開発中です。</p>
			{/* <div>{main.PX}</div>
			<p><Link href="?PX=admin.config">Config</Link></p>
			<p><Link href="?PX=admin">Dashboard</Link></p> */}
		</>
	);
}
