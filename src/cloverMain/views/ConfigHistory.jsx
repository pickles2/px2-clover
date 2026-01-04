import $ from 'jquery';
import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function ConfigHistory(props){

	const main = useContext(MainContext);

	const isHistoryConfigAuthorized = (main.bootupInfoLoaded && main.bootupInfo.authorization.config && main.bootupInfo.authorization.server_side_scripting);

	// 認証方式を判定（既存設定から）
	const defaultAuthType = (main.config && main.config.history && main.config.history.git_auth_type === 'ssh') ? 'ssh' : 'pat';
	const [authType, setAuthType] = useState(defaultAuthType);

	const updateConfig = (e) => {
		e.preventDefault();
		var $form = $(e.target);
		var newConfig = {
			'history->git_remote': $form.find('input[name=git_remote]').val(),
			'history->auto_commit': ($form.find('input[name=auto_commit]:checked').val() ? "1" : "" ),
			'history->git_auth_type': $form.find('input[name=git_auth_type]:checked').val() || 'pat',
		};
		
		if( authType === 'pat' ){
			newConfig['history->git_id'] = $form.find('input[name=git_param_1]').val();
			if( $form.find('input[name=git_param_2]').val().length ){
				newConfig['history->git_pw'] = $form.find('input[name=git_param_2]').val();
			}
		}else if( authType === 'ssh' ){
			if( $form.find('textarea[name=git_ssh_private_key]').val().length ){
				newConfig['history->git_ssh_private_key'] = $form.find('textarea[name=git_ssh_private_key]').val();
			}
		}
		
			main.cloverUtils.updateConfig(
				newConfig,
				(result) => {
					console.log(result);
					if( !result.result ){
						alert(main.lb.get('ui_message.failed_to_update_history_config'));
						return;
					}
					main.setMainState({
						'config': result.config,
						'configLoaded': false,
					});
					alert(main.lb.get('ui_message.history_config_updated'));
					main.link('?PX=admin.config');
				}
			);
	}

	if( !isHistoryConfigAuthorized ){
		return (<p>{main.lb.get('ui_message.no_permission')}</p>);
	}

	if( !main.config ){
		return (<p>...</p>);
	}

	return (
		<>
			<form onSubmit={updateConfig} method="post" autoComplete="off">
				<div className="px2-p">
					<div className="px2-form-input-list">
						<ul className="px2-form-input-list__ul">
							<li className={"px2-form-input-list__li"}>
							<div className="px2-form-input-list__label"><label htmlFor="input-git_remote">{main.lb.get('ui_label.git_remote')}</label></div>
							<div className="px2-form-input-list__input">
								<input type="text" id="input-git_remote" name="git_remote" defaultValue={main.config.history.git_remote} className="px2-input px2-input--block" />
								<p className="px2-note">{main.lb.get('ui_message.git_remote_example')}</p>
								</div>
							</li>
							<li className={"px2-form-input-list__li"}>
								<div className="px2-form-input-list__label"><label>認証方式</label></div>
								<div className="px2-form-input-list__input">
									<label style={{display: 'block', marginBottom: '0.5em'}}>
										<input 
											type="radio" 
											name="git_auth_type" 
											value="pat" 
											checked={authType === 'pat'} 
											onChange={(e) => setAuthType('pat')}
											className="px2-input" 
										/> PAT（Personal Access Token）
									</label>
									<label style={{display: 'block'}}>
										<input 
											type="radio" 
											name="git_auth_type" 
											value="ssh" 
											checked={authType === 'ssh'} 
											onChange={(e) => setAuthType('ssh')}
											className="px2-input" 
										/> SSH鍵
									</label>
								</div>
							</li>
							{authType === 'pat' && (
								<>
									<li className={"px2-form-input-list__li"}>
									<div className="px2-form-input-list__label"><label htmlFor="input-git_param_1">{main.lb.get('ui_label.git_id')}</label></div>
									<div className="px2-form-input-list__input"><input type="text" id="input-git_param_1" name="git_param_1" defaultValue={main.config.history.git_id} className="px2-input px2-input--block" autoComplete="off" /></div>
								</li>
								<li className={"px2-form-input-list__li"}>
									<div className="px2-form-input-list__label"><label htmlFor="input-git_param_2">{main.lb.get('ui_label.git_password_pat')}</label></div>
									<div className="px2-form-input-list__input">
										<p className="px2-note">{main.lb.get('ui_message.enter_password_only_when_changing')}</p>
											<input type="password" id="input-git_param_2" name="git_param_2" defaultValue="" className="px2-input px2-input--block" autoComplete="new-password" />
										</div>
									</li>
								</>
							)}
							{authType === 'ssh' && (
								<li className={"px2-form-input-list__li"}>
								<div className="px2-form-input-list__label"><label htmlFor="input-git_ssh_private_key">{main.lb.get('ui_label.git_ssh_private_key')}</label></div>
								<div className="px2-form-input-list__input">
									<p className="px2-note">{main.lb.get('ui_message.ssh_private_key_instruction')}</p>
										<textarea 
											id="input-git_ssh_private_key" 
											name="git_ssh_private_key" 
											defaultValue="" 
											className="px2-input px2-input--block" 
											rows="8"
											style={{fontFamily: 'monospace', fontSize: '0.9em'}}
										/>
									</div>
								</li>
							)}
							<li className={"px2-form-input-list__li"}>
							<div className="px2-form-input-list__label"><label htmlFor="input-auto_commit">{main.lb.get('ui_label.auto_commit')}</label></div>
							<div className="px2-form-input-list__input"><label><input type="checkbox" id="input-auto_commit" name="auto_commit" value="1" defaultChecked={main.config.history.auto_commit ? true : false} className="px2-input" /> {main.lb.get('ui_label.enable_auto_commit')}</label></div>
							</li>
						</ul>
					</div>
				</div>
				<div className="px2-form-submit-area">
					<div className="px2-form-submit-area__inner">
						<ul className="px2-form-submit-area__btns">
							<li><button type="submit" className="px2-btn px2-btn--primary">{ main.lb.get('ui_label.save') }</button></li>
						</ul>
						<ul className="px2-form-submit-area__backward-btns">
							<li><Link href="?PX=admin.config">{ main.lb.get('ui_label.cancel') }</Link></li>
						</ul>
					</div>
				</div>
			</form>
		</>
	);
}
