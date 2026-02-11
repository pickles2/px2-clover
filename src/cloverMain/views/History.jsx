import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import iterate79 from 'iterate79';
import $ from 'jquery';

export default React.memo(function History(props){

	const main = useContext(MainContext);

	useEffect(() => {
		const $contGit = document.querySelector('.cont-git');
		if( !$contGit ){
			return () => {};
		}

		if( !main.bootupInfo.git.is_init ){
			// git init されていない場合はここで終了
			return () => {};
		}

		const gitUi79 = new GitUi79(
			$contGit,
			function(cmdAry, callback){
				px2style.loading();
				main.px2utils.pxCmd("?PX=admin.api.git", {
					'git': JSON.stringify(cmdAry),
				}, (data)=>{
					try {
						// レスポンスの妥当性をチェック
						if (!data || typeof data !== 'object') {
							console.error('Invalid response from git API:', data);
							callback(1, '', 'Invalid response from server');
							px2style.closeLoading();
							return;
						}

						// 必要なプロパティの存在確認
						const exitcode = (typeof data.exitcode !== 'undefined') ? data.exitcode : 1;
						let stdout = (typeof data.stdout === 'string') ? data.stdout : '';
						let stderr = (typeof data.stderr === 'string') ? data.stderr : 'Unexpected response format';

						// Base64エンコードされたデータをデコード
						if (data.encoding === 'base64') {
							try {
								// Base64デコードしてUint8Arrayに変換
								const binaryStdout = atob(stdout);
								const binaryStderr = atob(stderr);
								
								// バイナリ文字列をUint8Arrayに変換
								const uint8ArrayStdout = new Uint8Array(binaryStdout.length);
								const uint8ArrayStderr = new Uint8Array(binaryStderr.length);
								
								for (let i = 0; i < binaryStdout.length; i++) {
									uint8ArrayStdout[i] = binaryStdout.charCodeAt(i);
								}
								for (let i = 0; i < binaryStderr.length; i++) {
									uint8ArrayStderr[i] = binaryStderr.charCodeAt(i);
								}
								
								// UTF-8としてデコードを試みる
								try {
									const decoder = new TextDecoder('utf-8', { fatal: true });
									stdout = decoder.decode(uint8ArrayStdout);
									stderr = decoder.decode(uint8ArrayStderr);
								} catch(utf8Error) {
									// UTF-8デコードに失敗した場合、バイナリデータとして扱う
									stdout = binaryStdout;
									stderr = binaryStderr;
								}
							} catch(e) {
								console.error('Base64 decode error:', e);
							}
						}

						callback(exitcode, stdout, stderr);
					} catch (error) {
						// 例外が発生した場合のエラーハンドリング
						console.error('Error processing git API response:', error);
						callback(1, '', 'Error processing response: ' + (error.message || 'Unknown error'));
					} finally {
						px2style.closeLoading();
					}
				});
			},
			{
				"lang": main.lb.getLang(),
				"committer": {
					"name": (main.profile ? main.profile.name : '' ),
					"email": (main.profile ? main.profile.email : ''),
				},
				"getWorkingTreeFile": function(filePath, callback) {
					// ワークツリー内のファイルを取得するコールバック
					// filePath: ワークツリーのルートからの相対パス
					// callback(error, binaryData)
					//   - error: エラーオブジェクト（成功時は null）
					//   - binaryData: Uint8Array 形式のバイナリデータ
					
					main.px2utils.pxCmd("?PX=admin.api.git_get_working_tree_file", {
						'filePath': filePath,
					}, (data)=>{
						if (data.error) {
							callback(new Error(data.message || data.error), null);
							return;
						}
						
						// Base64エンコードされたデータをデコード
						try {
							const binaryString = atob(data.content);
							const uint8Array = new Uint8Array(binaryString.length);
							for (let i = 0; i < binaryString.length; i++) {
								uint8Array[i] = binaryString.charCodeAt(i);
							}
							callback(null, uint8Array);
						} catch(e) {
							callback(e, null);
						}
					}, function(error){
						callback(new Error(error || 'Failed to fetch working tree file'), null);
					});
				}
			}
		);
		gitUi79.init(function(){
			console.log('gitUi79: Standby.');
		});

		return () => {
		};
	}, [main.profile]);


	return (
		<>
			{(!main.bootupInfo.git.is_init) ? <>
				{/* git init されていない場合 */}
				<div className="px2-p">
					<p>{main.lb.get('ui_message.git_not_initialized')}</p>
				</div>
			</>
			: <>{(!main.profile) ? <>
				<p>...</p>
			</>
			: <>
				<div className="cont-git"></div>
			</>
			}</>}

		</>
	);
});
