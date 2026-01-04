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
				alert( main.lb.get('ui_message.maintenance_mode_started') );
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
				alert( main.lb.get('ui_message.maintenance_mode_exited') );
				updateStatus();
			}
		);
	}

	useEffect(() => {
		updateStatus();
	}, []);

	if( !isMaintenanceModeAuthorized ){
		return (<p>{main.lb.get('ui_message.no_permission')}</p>);
	}

	if( !maintenanceModeStatus ){
		return (<p>...</p>);
	}

	return (
		<>
			<p>{main.lb.get('ui_message.configure_maintenance_mode')}</p>
			{(maintenanceModeStatus.start_at && maintenanceModeStatus.exit_at)
				? <>
					<p>{main.lb.get('ui_label.current_settings')}</p>
					<dl>
						<dt>{main.lb.get('ui_label.start')}:</dt><dd>{ maintenanceModeStatus.start_at }</dd>
						<dt>{main.lb.get('ui_label.end')}:</dt><dd>{ maintenanceModeStatus.exit_at }</dd>
						<dt>{main.lb.get('ui_label.maintenance')}:</dt><dd>{ maintenanceModeStatus.maintainer }</dd>
					</dl>
					<p>{main.lb.get('ui_message.reconfigure_maintenance_mode')}</p>
					<p><button type="button" className={"px2-btn px2-btn--primary"} onClick={startMaintenanceMode}>{main.lb.get('ui_label.reconfigure_maintenance_mode')}</button></p>
					<p><button type="button" className={"px2-btn px2-btn--secondary"} onClick={exitMaintenanceMode}>{main.lb.get('ui_label.exit_maintenance_mode')}</button></p>
				</>
				: <>
					<p>{main.lb.get('ui_message.start_maintenance_mode_confirm')}</p>
					<p><button type="button" className={"px2-btn px2-btn--primary"} onClick={startMaintenanceMode}>{main.lb.get('ui_label.start_maintenance_mode')}</button></p>
			</>}
		</>
	);
}
