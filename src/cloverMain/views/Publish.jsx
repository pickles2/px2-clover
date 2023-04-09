import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import iterate79 from 'iterate79';
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
	 * パブリッシュダイアログを表示する
	 */
	function publishDialog(){
		var modal;
		iterate79.fnc({}, [
			function(it){
				const $body = $(main.cloverUtils.bindTwig(
					require('-!text-loader!./Publish_files/templates/publishDialog.twig'),
					{
						config: null, // TODO: プリセットを処理するため pickles2 config 情報を渡す
					}
				));
				modal = px2style.modal({
					"title": "パブリッシュ",
					"body": $body,
					"buttons": [
						$('<button type="submit" class="px2-btn px2-btn--primary">').text('パブリッシュを実行する'),
					],
					"buttonsSecondary": [
						$('<button type="button" class="px2-btn px2-btn--secondary">').text('キャンセル')
							.on('click', function(){ px2style.closeModal(); }),
					],
					"form": {
						"submit": function(e){
							const $form = $(this);
							px2style.closeModal();
							let publishOptions = {};

							publish( publishOptions );
						},
					},
				});
				var form = px2style.form($body);
				it.next();
			},
		]);
	}

	/**
	 * パブリッシュを実行する
	 */
	function publish( publishOptions ){
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
					px2style.modal({
						'title': 'パブリッシュ',
						'body': '<p>パブリッシュキュー を登録しました。</p>',
					});
					px2style.closeLoading();
				}
			);
		}else{
			// --------------------------------------
			// スケジューラが利用できない場合
			// 直接実行する
			px2style.loading();

			updateHealthCheckStatus({
				...healthCheckStatus,
				"publish": {
					"is_running": true,
				}
			})

			var progressTotalMessage = "";
			var $publishStdout = $('.cont-publish-stdout pre');
			$publishStdout.text(progressTotalMessage);

			main.px2utils.px2cmd(
				"?PX=publish.run",
				{},
				{
					"timeout": 30 * 60 * 1000, // 30分待つ
					"progress": function(progress){
						console.log('-- progress:', progress);
						progressTotalMessage += progress;
						$publishStdout.text(progressTotalMessage);
						$publishStdout.scrollTop( $publishStdout.get(0).scrollHeight );
					}
				},
				function(data, error){
					console.log('------ publish Response:', data, error);
					if( error ){
						px2style.modal({
							'title': 'パブリッシュ エラー',
							'body': '<p>エラーが発生しました。</p>',
						});
					}else{
						px2style.modal({
							'title': 'パブリッシュ 完了',
							'body': '<p>パブリッシュ が完了しました。</p>',
						});
					}

					updateHealthCheckStatus({
						...healthCheckStatus,
						"publish": {
							"is_running": false,
						}
					})
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
			px2style.modal({
				'title': 'パブリッシュ 中断',
				'body': '<p>パブリッシュは停止しました。</p>',
			});
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
							<p><button type="button" onClick={publishDialog} className="px2-btn px2-btn--primary">パブリッシュ</button></p>
						</>
						:<>
							<p>パブリッシュ中です...</p>
							{(healthCheckStatus.scheduler.is_available)
								?<>
									<p><button type="button" onClick={publishStop} className="px2-btn">パブリッシュを中断</button></p>
								</>
								:<>
								</>}
						</>}
					<div className="cont-publish-stdout">
						<pre></pre>
					</div>
				</>}
		</>
	);
});
