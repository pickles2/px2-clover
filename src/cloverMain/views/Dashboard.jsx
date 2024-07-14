import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import iterate79 from 'iterate79';

export default function Dashboard(props){

	const main = useContext(MainContext);
	const templates = {
		"editSiteProfile": require('./Dashboard_files/templates/editSiteProfile.twig'),
	};

	/**
	 * サイト設定情報を編集する
	 */
	function editSiteProfile(){
		let parsedConfig = null;

		iterate79.fnc({}, [
			function(it1){
				window.px2utils.pxCmd(
					'/?PX=px2dthelper.config.parse',
					{},
					function( res ){
						parsedConfig = res;
						it1.next();
					}
				);
			},
			function(it1){
				const $body = $(templates.editSiteProfile({
					"parsedConfig": parsedConfig,
					"pxConfig": main.pxConfig,
				}));
				const modalObj = px2style.modal({
					"title": "Edit Site Profile",
					"body": $body,
					"form": {
						"action": "javascript:void(0);",
						"method": "get",
						"submit": function(){
							modalObj.lock();
							const params = {
								"values": {
									"name": $body.find('[name=name]').val(),
									"tagline": $body.find('[name=tagline]').val(),
									"domain": $body.find('[name=domain]').val(),
									"copyright": $body.find('[name=copyright]').val(),
								},
							};

							window.px2utils.pxCmd(
								'/?PX=px2dthelper.config.update',
								{
									"json": JSON.stringify(params),
								},
								function( res ){
									if( !res || !res.result ){
										alert( res.message );
										modalObj.unlock();
										return;
									}

									// NOTE: 変更が反映されるまでにタイムラグが発生するので、2秒のタメを作った。
									// NOTE: [要調査] なぜタイムラグが生まれるのかは不明。
									setTimeout(function(){
										window.location.reload();
									}, 2000);
								}
							);
						},
					},
					'buttons':[
						$('<button type="submit" class="px2-btn px2-btn--primary">')
							.text('保存する')
					],
					'buttonsSecondary': [
						$('<button type="button" class="px2-btn">')
							.text('キャンセル')
							.on('click', function(){
								px2style.closeModal();
							}),
					],
				}, function(){});

				it1.next();
			},
		]);
	}


	/**
	 * Gitリポジトリの初期化を実行する
	 */
	function gitInit(e){
		const $btn = $(e.target);
		$btn.attr('disabled', true);
		px2style.loading();
		iterate79.fnc({}, [
			function(it1){
				window.px2utils.pxCmd(
					'/?PX=admin.api.git_init',
					{},
					function( res ){
						if( !res.result ){
							alert('Gitリポジトリの初期化に失敗しました。'+"\n"+res.message);
							$btn.attr('disabled', false);
							px2style.closeLoading();
							return;
						}

						const $body = $(`<div>
							<p>Gitリポジトリを初期化しました。</p>
							<p>画面を再読み込みしてください。</p>
						</div>`);

						const resultModal = px2style.modal({
							"title": "Gitリポジトリの初期化",
							"body": $body,
							"buttons": [
								$('<button type="button" class="px2-btn px2-btn--primary"></button>')
									.text('再読み込みする')
									.on('click', ()=>{
										// 画面をリロードする
										window.location.href = '?PX=admin';
									}),
							],
						});
						resultModal.closable(false);
						$btn.attr('disabled', false);
						px2style.closeLoading();

					}
				);
			},
		]);
	}

	return (
		<div>
			<p>ようこそ、Pickles 2 Clover CMS へ！</p>
			{(main.bootupInfo && main.bootupInfo.cmd_version)
				?<>
					{(!main.bootupInfo.cmd_version.php)
						?<>
							<div className="px2-notice px2-notice--warning">
								<p>PHPコマンドがインストールされていないか、パスが通っていません。</p>
							</div>
						</>
						:<>
						</>
					}
					{(!main.bootupInfo.cmd_version.git)
						?<>
							<div className="px2-notice px2-notice--warning">
								<p>Gitコマンドがインストールされていないか、パスが通っていません。</p>
							</div>
						</>
						:<>
						</>
					}
					{(main.bootupInfo.cmd_version.git && !main.bootupInfo.git.is_init)
						?<>
							<div className="px2-notice">
								<p>Gitリポジトリを初期化して、編集履歴の管理を開始しましょう。</p>
								<p><button type="button" className="px2-btn px2-btn--primary" onClick={gitInit}>Gitリポジトリを初期化する</button></p>
							</div>
						</>
						:<>
						</>
					}
				</>
				:<>
				</>
			}
			{!main.pxConfig
				?<>
				</>
				:<>
					<h2>Site Profile</h2>
					<div className="px2-p">
						<table className="px2-table px2-table--dl">
							<tbody>
							<tr>
								<th>Site name</th>
								<td>{main.pxConfig.name || '---'}</td>
							</tr>
							<tr>
								<th>Tag line</th>
								<td>{main.pxConfig.tagline || '---'}</td>
							</tr>
							<tr>
								<th>Domain</th>
								<td>{main.pxConfig.domain || '---'}</td>
							</tr>
							<tr>
								<th>Copyright</th>
								<td>{main.pxConfig.copyright ? <>&copy;{main.pxConfig.copyright}, All rights reserved.</> : '---'}</td>
							</tr>
							</tbody>
						</table>
						{main.bootupInfoLoaded && main.bootupInfo.authorization.config
							?<>
						<p className="px2-text-align-right">
							<button type="button" className="px2-btn px2-btn--primary" onClick={editSiteProfile}>編集する</button>
						</p>
							</>
							:<>
							</>}
					</div>
				</>
			}
		</div>
	);
}
