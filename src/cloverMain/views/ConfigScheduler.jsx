import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';


export default function ConfigScheduler(props){

	const main = useContext(MainContext);

	const useSchedulerStatus = () => {
		const [ schedulerStatus, updateSchedulerStatus] = useState({"is_available": null});

		useEffect(() => {
			let timer = setInterval(() => {

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

			}, 5 * 1000);
			return () => {
				clearInterval(timer);
			};
		}, []);

		return schedulerStatus;
	}

	return (
		<>
			<p>タスクスケジュールの実行設定の状態を確認します。</p>
			<div>Status: <code>{(()=>{
				let status = useSchedulerStatus();
				return (<>
					{(status.is_available===null ? '---' : (status.is_available ? 'available' : 'not available'))}
				</>);
			})()}</code></div>
			<p><Link href="?PX=admin.config">戻る</Link></p>
		</>
	);
}
