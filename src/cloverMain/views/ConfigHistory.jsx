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
							<div className="px2-form-input-list">
								<ul className="px2-form-input-list__ul">
									<li className={"px2-form-input-list__li"}>
										<div className="px2-form-input-list__label"><label htmlFor="input-git_remote">Gitリモート</label></div>
										<div className="px2-form-input-list__input"><input type="text" id="input-git_remote" name="git_remote" defaultValue={main.config.history.git_remote} className="px2-input px2-input--block" /></div>
									</li>
									<li className={"px2-form-input-list__li"}>
										<div className="px2-form-input-list__label"><label htmlFor="input-git_param_1">Git ID</label></div>
										<div className="px2-form-input-list__input"><input type="text" id="input-git_param_1" name="git_param_1" defaultValue={main.config.history.git_id} className="px2-input px2-input--block" autoComplete="off" /></div>
									</li>
									<li className={"px2-form-input-list__li"}>
										<div className="px2-form-input-list__label"><label htmlFor="input-git_param_2">Git パスワード</label></div>
										<div className="px2-form-input-list__input">
											<p className="px2-note">パスワードを変更する場合のみ入力してください。</p>
											<input type="password" id="input-git_param_2" name="git_param_2" defaultValue="" className="px2-input px2-input--block" autoComplete="new-password" />
										</div>
									</li>
									<li className={"px2-form-input-list__li"}>
										<div className="px2-form-input-list__label"><label htmlFor="input-auto_commit">自動コミット</label></div>
										<div className="px2-form-input-list__input"><label><input type="checkbox" id="input-auto_commit" name="auto_commit" value="1" defaultChecked={main.config.history.auto_commit ? true : false} className="px2-input" /> 自動コミットを有効にする</label></div>
									</li>
								</ul>
							</div>
						</div>
						<div className="px2-form-submit-area">
							<ul className="px2-form-submit-area__btns">
								<li><button type="submit" className="px2-btn px2-btn--primary">{ main.lb.get('ui_label.save') }</button></li>
							</ul>
							<ul className="px2-form-submit-area__backward-btns">
								<li><Link href="?PX=admin.config">{ main.lb.get('ui_label.cancel') }</Link></li>
							</ul>
						</div>
					</form>
			</>}
		</>
	);
}
