import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function History(props){

	const main = useContext(MainContext);
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

	/**
	 * コミットする
	 */
	function commit(){
		console.log('--- scheduler available:', schedulerStatus.is_available);

		if( schedulerStatus.is_available ){
			// --------------------------------------
			// スケジューラが利用可能な場合
			// キューを発行する
			px2style.loading();
			main.px2utils.px2cmd(
				"/?PX=admin.api.scheduler_add_queue",
				{
					"service": "git-commit",
					"name": "git-commit",
				},
				(data)=>{
					console.log('------ scheduler_add_queue Response:', data);
						alert('git-commit queue を登録しました。');
						px2style.closeLoading();
				}
			);
		}else{
			// --------------------------------------
			// スケジューラが利用できない場合
			// 直接実行する
			px2style.loading();
			main.px2utils.px2cmd("?PX=admin.api.git_commit", {}, (data)=>{
				console.log('------ git-commit Response:', data);
				alert('git-commit done.');
				px2style.closeLoading();
			});
		}
	}

	return (
		<>
			<p><button type="button" onClick={commit} className="px2-btn">コミットする</button></p>
		</>
	);
});
