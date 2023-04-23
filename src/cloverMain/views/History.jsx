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
				main.px2utils.px2cmd("?PX=admin.api.git", {
					'git': JSON.stringify(cmdAry),
				}, (data)=>{
					callback(data.exitcode, (data.stdout?data.stdout:'')+(data.stderr?data.stderr:''));
					px2style.closeLoading();
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
					<p>git環境が初期化されていません。</p>
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
