import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function Publish(props){

	const main = useContext(MainContext);
	const [ schedulerStatus, updateSchedulerStatus] = useState({"is_available": null});

	useEffect(() => {
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
		return () => {};
	}, []);

	/**
	 * パブリッシュを実行する
	 */
	function publish(){
		if( !confirm('パブリッシュを実行しますか？') ){
			return;
		}
		if( schedulerStatus.is_available ){
			// --------------------------------------
			// スケジューラが利用可能な場合
			// キューを発行する
			console.log('/?PX=admin.api.scheduler_add_queue');
			px2style.loading();
			main.px2utils.px2cmd(
				"/?PX=admin.api.scheduler_add_queue",
				{
					"service": "publish",
					"name": "publish",
				},
				(data)=>{
					console.log('------ scheduler_add_queue Response:', data);
						alert('publish queue を登録しました。');
						px2style.closeLoading();
				}
			);
		}else{
			// --------------------------------------
			// スケジューラが利用できない場合
			// 直接実行する
			console.log('?PX=publish.run');
			px2style.loading();
			main.px2utils.px2cmd("?PX=publish.run", {}, (data)=>{
				console.log('------ publish Response:', data);
					alert('publish done.');
					px2style.closeLoading();
			});
		}
	}

	return (
		<>
			{(schedulerStatus.is_available === null)
				?<>
					<p>...</p>
				</>
				:<>
					<p><button type="button" onClick={publish} className="px2-btn px2-btn--primary">パブリッシュ</button></p>
				</>}
		</>
	);
});
