import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function History(props){

	const main = useContext(MainContext);

	// const [ healthCheckStatus, updateHealthCheckStatus] = useState({"scheduler":{"is_available": null, "elapsed": null}});

	// const pollingUpdateStatus = () => {
	// 	main.px2utils.px2cmd(
	// 		'/?PX=admin.api.health_check',
	// 		{},
	// 		function( res ){
	// 			if( !res.result ){
	// 				console.error('Error:', res);
	// 			}
	// 			updateHealthCheckStatus(res);
	// 		}
	// 	);
	// 	return;
	// }
	// useEffect(() => {
	// 	pollingUpdateStatus();
	// 	let timer = setInterval(() => {
	// 		pollingUpdateStatus();
	// 	}, 5 * 1000);

	// 	return () => {
	// 		clearInterval(timer);
	// 	};
	// }, []);

	useEffect(() => {
		const $contGit = document.querySelector('.cont-git');
		const gitUi79 = new GitUi79(
			$contGit,
			function(cmdAry, callback){
				// var result = [];
				// console.log('=-=-=-=-=-=-= GPI Request:', cmdAry, callback);

				px2style.loading();
				main.px2utils.px2cmd("?PX=admin.api.git", {
					'git': JSON.stringify(cmdAry),
				}, (data)=>{
					callback(data.exitcode, (data.stdout?data.stdout:'')+(data.stderr?data.stderr:''));
					px2style.closeLoading();
				});
			},
			{}
		);
		gitUi79.init(function(){
			console.log('gitUi79: Standby.');
		});

		return () => {
		};
	}, []);


	// /**
	//  * コミットする
	//  */
	// function commit(){
	// 	console.log('--- scheduler available:', healthCheckStatus.scheduler.is_available);

	// 	if( healthCheckStatus.scheduler.is_available ){
	// 		// --------------------------------------
	// 		// スケジューラが利用可能な場合
	// 		// キューを発行する
	// 		px2style.loading();
	// 		main.px2utils.px2cmd(
	// 			"/?PX=admin.api.scheduler_add_queue",
	// 			{
	// 				"service": "git-commit",
	// 				"name": "clover-manual-git-commit",
	// 			},
	// 			(data)=>{
	// 				console.log('------ scheduler_add_queue Response:', data);
	// 					alert('git-commit queue を登録しました。');
	// 					px2style.closeLoading();
	// 			}
	// 		);
	// 	}else{
	// 		// --------------------------------------
	// 		// スケジューラが利用できない場合
	// 		// 直接実行する
	// 		px2style.loading();
	// 		main.px2utils.px2cmd("?PX=admin.api.git_commit", {}, (data)=>{
	// 			console.log('------ git-commit Response:', data);
	// 			alert('git-commit done.');
	// 			px2style.closeLoading();
	// 		});
	// 	}
	// }

	// /**
	//  * 状態を知る
	//  */
	// function status(){
	// 	console.log('--- scheduler available:', healthCheckStatus.scheduler.is_available);
	// 	px2style.loading();
	// 	main.px2utils.px2cmd("?PX=admin.api.git_status", {}, (data)=>{
	// 		console.log('------ git-status Response:', data);
	// 		alert('git-status done.');
	// 		px2style.closeLoading();
	// 	});
	// }

	// /**
	//  * フェッチする
	//  */
	// function fetch(){
	// 	console.log('--- scheduler available:', healthCheckStatus.scheduler.is_available);

	// 	if( healthCheckStatus.scheduler.is_available ){
	// 		// --------------------------------------
	// 		// スケジューラが利用可能な場合
	// 		// キューを発行する
	// 		px2style.loading();
	// 		main.px2utils.px2cmd(
	// 			"/?PX=admin.api.scheduler_add_queue",
	// 			{
	// 				"service": "git-fetch",
	// 				"name": "clover-manual-git-fetch",
	// 			},
	// 			(data)=>{
	// 				console.log('------ scheduler_add_queue Response:', data);
	// 					alert('git-fetch queue を登録しました。');
	// 					px2style.closeLoading();
	// 			}
	// 		);
	// 	}else{
	// 		// --------------------------------------
	// 		// スケジューラが利用できない場合
	// 		// 直接実行する
	// 		px2style.loading();
	// 		main.px2utils.px2cmd("?PX=admin.api.git_fetch", {}, (data)=>{
	// 			console.log('------ git-fetch Response:', data);
	// 			alert('git-fetch done.');
	// 			px2style.closeLoading();
	// 		});
	// 	}
	// }

	// /**
	//  * プルする
	//  */
	// function pull(){
	// 	console.log('--- scheduler available:', healthCheckStatus.scheduler.is_available);

	// 	if( healthCheckStatus.scheduler.is_available ){
	// 		// --------------------------------------
	// 		// スケジューラが利用可能な場合
	// 		// キューを発行する
	// 		px2style.loading();
	// 		main.px2utils.px2cmd(
	// 			"/?PX=admin.api.scheduler_add_queue",
	// 			{
	// 				"service": "git-pull",
	// 				"name": "clover-manual-git-pull",
	// 			},
	// 			(data)=>{
	// 				console.log('------ scheduler_add_queue Response:', data);
	// 					alert('git-pull queue を登録しました。');
	// 					px2style.closeLoading();
	// 			}
	// 		);
	// 	}else{
	// 		// --------------------------------------
	// 		// スケジューラが利用できない場合
	// 		// 直接実行する
	// 		px2style.loading();
	// 		main.px2utils.px2cmd("?PX=admin.api.git_pull", {}, (data)=>{
	// 			console.log('------ git-pull Response:', data);
	// 			alert('git-pull done.');
	// 			px2style.closeLoading();
	// 		});
	// 	}
	// }

	// /**
	//  * プッシュする
	//  */
	// function push(){
	// 	console.log('--- scheduler available:', healthCheckStatus.scheduler.is_available);

	// 	if( healthCheckStatus.scheduler.is_available ){
	// 		// --------------------------------------
	// 		// スケジューラが利用可能な場合
	// 		// キューを発行する
	// 		px2style.loading();
	// 		main.px2utils.px2cmd(
	// 			"/?PX=admin.api.scheduler_add_queue",
	// 			{
	// 				"service": "git-push",
	// 				"name": "clover-manual-git-push",
	// 			},
	// 			(data)=>{
	// 				console.log('------ scheduler_add_queue Response:', data);
	// 					alert('git-push queue を登録しました。');
	// 					px2style.closeLoading();
	// 			}
	// 		);
	// 	}else{
	// 		// --------------------------------------
	// 		// スケジューラが利用できない場合
	// 		// 直接実行する
	// 		px2style.loading();
	// 		main.px2utils.px2cmd("?PX=admin.api.git_push", {}, (data)=>{
	// 			console.log('------ git-push Response:', data);
	// 			alert('git-push done.');
	// 			px2style.closeLoading();
	// 		});
	// 	}
	// }


	return (
		<>
			{/*
			<p>現在の状態を保存するには、「コミットする」ボタンをクリックしてください。</p>
			<p><button type="button" onClick={commit} className="px2-btn">コミットする</button></p>
			<hr />
			<p><button type="button" onClick={status} className="px2-btn">状態を知る</button></p>
			<p><button type="button" onClick={fetch} className="px2-btn">フェッチする</button></p>
			<p><button type="button" onClick={pull} className="px2-btn">プルする</button></p>
			<hr />
			<p><button type="button" onClick={push} className="px2-btn">プッシュする</button></p>
			<hr />
			*/}
			<div className="cont-git"></div>
		</>
	);
});
