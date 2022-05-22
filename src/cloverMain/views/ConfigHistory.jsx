import $ from 'jquery';
import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function ConfigHistory(props){

	const main = useContext(MainContext);

	const updateConfig = (e) => {
		e.preventDefault();
		var $form = $(e.target);
		// console.log(e.target);
		var newConfig = {
			'history->git_remote': $form.find('input[name=git_remote]').val(),
			'history->git_id': $form.find('input[name=git_param_1]').val(),
			'history->auto_commit': ($form.find('input[name=auto_commit]:checked').val() ? "1" : "" ),
		};
		if( $form.find('input[name=git_param_2]').val().length ){
			newConfig['history->git_pw'] = $form.find('input[name=git_param_2]').val();
		}
		main.cloverUtils.updateConfig(
			newConfig,
			(result) => {
				console.log(result);
				if( !result.result ){
					alert('Failed to update history config.');
					return;
				}
				main.setMainState({
					'config': result.config,
					'configLoaded': false,
				});
				alert('history config updated.');
				// main.link('?PX=admin.config');
			}
		);
	}

	return (
		<>
			{(!main.config)
				? <>
					<p>...</p>
				</>
				: <>
					<form onSubmit={updateConfig} method="post" autoComplete="off">
						<div className="px2-p">
						<table className="px2-table" style={{width:"100%"}}>
							<tbody>
								<tr>
									<th>Gitリモート</th>
									<td><input type="text" name="git_remote" defaultValue={main.config.history.git_remote} className="px2-input" /></td>
								</tr>
								<tr>
									<th>Git ID</th>
									<td><input type="text" name="git_param_1" defaultValue={main.config.history.git_id} className="px2-input" autoComplete="off" /></td>
								</tr>
								<tr>
									<th>Git パスワード</th>
									<td><input type="password" name="git_param_2" defaultValue="" className="px2-input" autoComplete="new-password" /></td>
								</tr>
								<tr>
									<th>自動コミット</th>
									<td><label><input type="checkbox" name="auto_commit" value="1" defaultChecked={main.config.history.auto_commit ? true : false} className="px2-input" /> 自動コミットを有効にする</label></td>
								</tr>
							</tbody>
						</table>
						</div>
						<p><button type="submit" className="px2-btn px2-btn--primary">保存する</button></p>
					</form>
					<p><Link href="?PX=admin.config">戻る</Link></p>
			</>}
		</>
	);
}
