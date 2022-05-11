import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';


export default function ConfigScheduler(props){

	const main = useContext(MainContext);
	const [ schedulerHint, updateSchedulerHint] = useState({});
	const [ schedulerStatus, updateSchedulerStatus] = useState({"is_available": null});

	const pollingUpdateStatus = () => {
		main.px2utils.px2cmd(
			'/?PX=admin.api.scheduler_status',
			{},
			function( res ){
				if( !res.result ){
					console.error('Error:', res);
				}
				updateSchedulerStatus(res);
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

	const getSchedulerHint = () => {

		useEffect(() => {
			main.px2utils.px2cmd(
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

		return schedulerHint;
	}
	getSchedulerHint();

	return (
		<>
			<p>タスクスケジュールの実行設定の状態を確認します。</p>
			<div>
				Status: <code>{(schedulerStatus.is_available===null ? '---' : (schedulerStatus.is_available ? 'available' : 'not available'))}</code><br />
				Elapsed: <code>{(schedulerStatus.elapsed)}</code><br />
			</div>
			<div>
				<p>cron での設定例</p>
				<p>ユーザー {schedulerHint.user} で、次のように crontab を設定してください。</p>
				<pre className="code"><code>{(()=>{
					return (<>
						* * * * * {schedulerHint.path_php} {schedulerHint.script_filename} &quot;/?PX=admin.api.scheduler_run&quot; &gt; /dev/null 2&gt;&amp;1
					</>);
				})()}</code></pre>
			</div>
			<p><Link href="?PX=admin.config">戻る</Link></p>
		</>
	);
}
