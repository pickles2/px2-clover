import $ from 'jquery';
import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function ConfigMaintenance(props){

	const main = useContext(MainContext);

	const startMaintenanceMode = (e) => {
		e.preventDefault();

		main.px2utils.px2cmd(
			'/?PX=admin.api.start_maintenance_mode',
			{},
			function( res ){
				if( !res.result ){
					console.error('Error:', res);
				}
			}
		);
	}

	const exitMaintenanceMode = (e) => {
		e.preventDefault();

		main.px2utils.px2cmd(
			'/?PX=admin.api.exit_maintenance_mode',
			{},
			function( res ){
				if( !res.result ){
					console.error('Error:', res);
					alert( res.message );
				}
			}
		);
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
					<p><button type="button" className={"px2-btn px2-btn--secondary"} onClick={exitMaintenanceMode}>メンテナンスモードを終了する</button></p>
					<p><Link href="?PX=admin.config">戻る</Link></p>
			</>}
		</>
	);
}
