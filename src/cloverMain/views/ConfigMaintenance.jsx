import $ from 'jquery';
import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function ConfigMaintenance(props){

	const main = useContext(MainContext);

	const startMaintenanceMode = (e) => {
		e.preventDefault();
		alert('under construction');
	}

	return (
		<>
			{(!main.profile)
				? <>
					<p>...</p>
				</>
				: <>
					<p>メンテナンスモードを開始しますか？</p>
					<p><button type="button" className={"px2-btn px2-btn--primary"} onClick={startMaintenanceMode}>メンテナンスモードを開始する</button></p>
					<p><Link href="?PX=admin.config">戻る</Link></p>
			</>}
		</>
	);
}
