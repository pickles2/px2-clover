import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function Publish(props){

	const main = useContext(MainContext);
	const [ healthCheckStatus, updateHealthCheckStatus] = useState({"scheduler":{"is_available": null, "elapsed": null}});

	const pollingUpdateStatus = () => {
		main.px2utils.px2cmd(
			'/?PX=admin.api.health_check',
			{},
			function( res ){
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

	/**
	 * パブリッシュを実行する
	 */
	function publish(){
		console.log('--- scheduler available:', healthCheckStatus.scheduler.is_available);

		if( !confirm('パブリッシュを実行しますか？') ){
			return;
		}
		if( healthCheckStatus.scheduler.is_available ){
			// --------------------------------------
			// スケジューラが利用可能な場合
			// キューを発行する
			px2style.loading();
			main.px2utils.px2cmd(
				"/?PX=admin.api.scheduler_add_queue",
				{
					"service": "publish",
					"name": "clover-manual-publish",
				},
				function(data, error){
					console.log('------ scheduler_add_queue Response:', data, error);
					alert('publish queue を登録しました。');
					px2style.closeLoading();
				}
			);
		}else{
			// --------------------------------------
			// スケジューラが利用できない場合
			// 直接実行する
			px2style.loading();
			main.px2utils.px2cmd(
				"?PX=publish.run",
				{},
				{
					"timeout": 30 * 60 * 1000, // 30分待つ
					"progress": function(progress){
						console.log('-- progress:', progress);
					}
				},
				function(data, error){
					console.log('------ publish Response:', data, error);
					if( error ){
						alert('publish error.');
					}else{
						alert('publish done.');
					}
					px2style.closeLoading();
				}
			);
		}
	}

	/**
	 * パブリッシュを中断する
	 */
	function publishStop(){
		if( !confirm('パブリッシュを中断しますか？') ){
			return;
		}
		px2style.loading();
		main.px2utils.px2cmd("?PX=admin.api.publish_stop", {}, function(data, error){
			console.log('------ publish_stop Response:', data, error);
			alert('publish stopped.');
			px2style.closeLoading();
		});
	}

	return (
		<>
			{(healthCheckStatus.scheduler.is_available === null)
				?<>
					<p>...</p>
				</>
				:<>
					{(!healthCheckStatus.publish.is_running)
						?<>
							<p><button type="button" onClick={publish} className="px2-btn px2-btn--primary">パブリッシュ</button></p>
						</>
						:<>
							<p>パブリッシュ中です...</p>
							<p><button type="button" onClick={publishStop} className="px2-btn">パブリッシュを中断</button></p>
						</>}
				</>}
		</>
	);
});
