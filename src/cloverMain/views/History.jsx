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
						const stdout = (typeof data.stdout === 'string') ? data.stdout : '';
						const stderr = (typeof data.stderr === 'string') ? data.stderr : 'Unexpected response format';

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
