import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';


export default function ConfigScheduler(props){

	const main = useContext(MainContext);
	const [ schedulerHint, updateSchedulerHint] = useState({});
	const [ healthCheckStatus, updateHealthCheckStatus] = useState({"scheduler":{"is_available": null, "elapsed": null}});

	const isModuleEditorAuthorized = (main.bootupInfoLoaded && main.bootupInfo.authorization.server_side_scripting);

	const pollingUpdateStatus = () => {
		main.px2utils.pxCmd(
			'/?PX=admin.api.health_check',
			{},
			function( res ){
				console.log('-- status:', res);
				if( !res.result ){
					console.error('Error:', res);
				}
				updateHealthCheckStatus(res);
			}
		);
		return;
	}
	useEffect(() => {
		pollingUpdateStatus();
		let timer = setInterval(() => {
			pollingUpdateStatus();
		}, 5 * 1000);

		return () => {
			clearInterval(timer);
		};
	}, []);

	useEffect(() => {
		main.px2utils.pxCmd(
			'/?PX=admin.api.scheduler_setting_hint',
			{},
			function( res ){
				if( !res.result ){
					console.error('Error:', res);
				}
				updateSchedulerHint(res);
			}
		);
	}, []);

	if( !isModuleEditorAuthorized ){
		return (<p>{main.lb.get('ui_message.no_permission')}</p>);
	}

	return (
		<>
			<p>{main.lb.get('ui_message.check_scheduler_status')}</p>
			<div>
				{main.lb.get('ui_label.status')}: <code>{(healthCheckStatus.scheduler.is_available===null ? main.lb.get('ui_label.status_unknown') : (healthCheckStatus.scheduler.is_available ? main.lb.get('ui_label.status_available') : main.lb.get('ui_label.status_not_available')))}</code><br />
				{main.lb.get('ui_label.elapsed')}: <code>{(healthCheckStatus.scheduler.elapsed)}</code><br />
			</div>
			<div>
				<p>{main.lb.get('ui_label.cron_configuration_example')}</p>
				<p>{main.lb.get('ui_message.crontab_instruction')}</p>
				<pre className="code"><code>{(()=>{
					return (<>
						* * * * * {schedulerHint.path_php} {schedulerHint.script_filename} &quot;/?PX=admin.api.scheduler_run&quot; &gt; /dev/null 2&gt;&amp;1
					</>);
				})()}</code></pre>
			</div>
		</>
	);
}
