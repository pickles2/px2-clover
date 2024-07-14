import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function ConfigMaintenance(props){

	const main = useContext(MainContext);
	const [ maintenanceModeStatus, updateMaintenanceModeStatus] = useState(false);

	const isMaintenanceModeAuthorized = (main.bootupInfoLoaded && main.bootupInfo.authorization.config);

	function updateStatus(){
		main.px2utils.pxCmd(
			'/?PX=admin.api.maintenance_mode_status',
			{},
			function( res ){
				if( !res.result ){
					console.error('Error:', res);
				}
				updateMaintenanceModeStatus(res);
			}
		);
	}

	const startMaintenanceMode = (e) => {
		e.preventDefault();

		main.px2utils.pxCmd(
			'/?PX=admin.api.start_maintenance_mode',
			{},
			function( res ){
				if( !res.result ){
					console.error('Error:', res);
					alert( res.message );
					return;
				}
				alert( 'メンテナンスモードを開始しました。' );
				updateStatus();
			}
		);
	}

	const exitMaintenanceMode = (e) => {
		e.preventDefault();

		main.px2utils.pxCmd(
			'/?PX=admin.api.exit_maintenance_mode',
			{},
			function( res ){
				if( !res.result ){
					console.error('Error:', res);
					alert( res.message );
					return;
				}
				alert( 'メンテナンスモードを解除しました。' );
				updateStatus();
			}
		);
	}

	useEffect(() => {
		updateStatus();
	}, []);

	if( !isMaintenanceModeAuthorized ){
		return (<p>権限がありません。</p>);
	}

	if( !maintenanceModeStatus ){
		return (<p>...</p>);
	}

	return (
		<>
			<p>メンテナンスモードの切り替えを設定します。</p>
			{(maintenanceModeStatus.start_at && maintenanceModeStatus.exit_at)
				? <>
					<p>現在の設定:</p>
					<dl>
						<dt>開始:</dt><dd>{ maintenanceModeStatus.start_at }</dd>
						<dt>終了:</dt><dd>{ maintenanceModeStatus.exit_at }</dd>
						<dt>メンテナ:</dt><dd>{ maintenanceModeStatus.maintainer }</dd>
					</dl>
					<p>メンテナンスモードを再設定しますか？</p>
					<p><button type="button" className={"px2-btn px2-btn--primary"} onClick={startMaintenanceMode}>メンテナンスモードを再設定する</button></p>
					<p><button type="button" className={"px2-btn px2-btn--secondary"} onClick={exitMaintenanceMode}>メンテナンスモードを終了する</button></p>
				</>
				: <>
					<p>メンテナンスモードを開始しますか？</p>
					<p><button type="button" className={"px2-btn px2-btn--primary"} onClick={startMaintenanceMode}>メンテナンスモードを開始する</button></p>
			</>}
		</>
	);
}
