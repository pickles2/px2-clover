import $ from 'jquery';
import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function ConfigProfile(props){

	const main = useContext(MainContext);
	const [validationErrors, setValidationErrors] = useState({});

	const updateProfile = (e) => {
		e.preventDefault();
		var $form = $(e.target);
		// console.log(e.target);
		var newProfile = {
			'current_pw': $form.find('input[name=current_pw]').val(),
			'id': $form.find('input[name=id]').val(),
			'name': $form.find('input[name=name]').val(),
			'lang': $form.find('select[name=lang]').val(),
			'email': $form.find('input[name=email]').val(),
		};
		if( $form.find('input[name=pw]').val().length || $form.find('input[name=pw_retype]').val().length ){
			newProfile.pw = $form.find('input[name=pw]').val();
			newProfile.pw_retype = $form.find('input[name=pw_retype]').val();
		}
		main.cloverUtils.updateProfile(
			newProfile,
			(result) => {
				if( !result.result ){
					// alert('Failed to update profile.');
					setValidationErrors(result.errors);
					return;
				}
				main.setMainState({
					'profile': result.profile,
					'profileLoaded': false,
				});
				alert('Your profile updated.');
				window.location.href = '?PX=admin.config';
			}
		);
	}

	/**
	 * 項目別に入力エラーがあったか確認する
	 */
	function hasValidationError(key){
		if( validationErrors && validationErrors[key] ){
			return true;
		}
		return false;
	}

	return (
		<>
			{(!main.profile)
				? <>
					<p>...</p>
				</>
				: <>
					<form onSubmit={updateProfile} method="post">
						<div className="px2-p">
							<div className="px2-form-input-list">
								<ul className="px2-form-input-list__ul">
									<li className={"px2-form-input-list__li"+(hasValidationError('current_pw') ? ' px2-form-input-list__li--error' : '')}>
										<div className="px2-form-input-list__label"><label htmlFor="input-current_pw">{main.lb.get('ui_label.user_pw')}</label></div>
										<div className="px2-form-input-list__input">
											<input type="password" id="input-current_pw" name="current_pw" defaultValue="" className={"px2-input px2-input--block"+(hasValidationError('pw') ? ' px2-input--error' : '')} />
											{(hasValidationError('current_pw'))
												? <>
													{validationErrors.current_pw.map((errorText, index) => {
														return <p key={index} className={"px2-error"}>{errorText}</p>;
													})}
												</>
												: <>
											</>}
										</div>
									</li>
									<li className={"px2-form-input-list__li px2-form-input-list__li--required"+(hasValidationError('name') ? ' px2-form-input-list__li--error' : '')}>
										<div className="px2-form-input-list__label"><label htmlFor="input-name">{main.lb.get('ui_label.user_name')}</label></div>
										<div className="px2-form-input-list__input">
											<input type="text" id="input-name" name="name" defaultValue={main.profile.name} className={"px2-input px2-input--block"+(hasValidationError('name') ? ' px2-input--error' : '')} />
											{(hasValidationError('name'))
												? <>
													{validationErrors.name.map((errorText, index) => {
														return <p key={index} className={"px2-error"}>{errorText}</p>;
													})}
												</>
												: <>
											</>}
										</div>
									</li>
									<li className={"px2-form-input-list__li px2-form-input-list__li--required"+(hasValidationError('id') ? ' px2-form-input-list__li--error' : '')}>
										<div className="px2-form-input-list__label"><label htmlFor="input-id">{main.lb.get('ui_label.user_id')}</label></div>
										<div className="px2-form-input-list__input">
											<input type="text" id="input-id" name="id" defaultValue={main.profile.id} className={"px2-input px2-input--block"+(hasValidationError('id') ? ' px2-input--error' : '')} />
											{(hasValidationError('id'))
												? <>
													{validationErrors.id.map((errorText, index) => {
														return <p key={index} className={"px2-error"}>{errorText}</p>;
													})}
												</>
												: <>
											</>}
										</div>
									</li>
									<li className={"px2-form-input-list__li"+(hasValidationError('pw')||hasValidationError('pw_retype') ? ' px2-form-input-list__li--error' : '')}>
										<div className="px2-form-input-list__label"><label htmlFor="input-pw">{main.lb.get('ui_label.user_pw')}</label></div>
										<div className="px2-form-input-list__input">
											<p className="px2-note">{main.lb.get('ui_message.enter_only_when_changing_the_password')}</p>
											<input type="password" id="input-pw" name="pw" defaultValue="" className={"px2-input px2-input--block"+(hasValidationError('pw') ? ' px2-input--error' : '')} />
											{(hasValidationError('pw'))
												? <>
													{validationErrors.pw.map((errorText, index) => {
														return <p key={index} className={"px2-error"}>{errorText}</p>;
													})}
												</>
												: <>
											</>}
											<p className="px2-note">確認のため、もう一度入力してください。</p>
											<input type="password" id="input-pw_retype" name="pw_retype" defaultValue="" className={"px2-input px2-input--block"+(hasValidationError('pw_retype') ? ' px2-input--error' : '')} />
											{(hasValidationError('pw_retype'))
												? <>
													{validationErrors.pw_retype.map((errorText, index) => {
														return <p key={index} className={"px2-error"}>{errorText}</p>;
													})}
												</>
												: <>
											</>}
										</div>
									</li>
									<li className={"px2-form-input-list__li"+(hasValidationError('lang') ? ' px2-form-input-list__li--error' : '')}>
										<div className="px2-form-input-list__label"><label htmlFor="input-lang">Language</label></div>
										<div className="px2-form-input-list__input">
											<select id="input-lang" name="lang" className={"px2-input"+(hasValidationError('lang') ? ' px2-input--error' : '')} defaultValue={main.profile.lang}>
												<option value="en">English</option>
												<option value="ja">Japanese</option>
											</select>
											{(hasValidationError('lang'))
												? <>
													{validationErrors.lang.map((errorText, index) => {
														return <p key={index} className={"px2-error"}>{errorText}</p>;
													})}
												</>
												: <>
											</>}
										</div>
									</li>
									<li className={"px2-form-input-list__li"+(hasValidationError('email') ? ' px2-form-input-list__li--error' : '')}>
										<div className="px2-form-input-list__label"><label htmlFor="input-email">{main.lb.get('ui_label.user_email')}</label></div>
										<div className="px2-form-input-list__input">
											<input type="text" id="input-email" name="email" defaultValue={main.profile.email} className={"px2-input px2-input--block"+(hasValidationError('email') ? ' px2-input--error' : '')} />
											{(hasValidationError('email'))
												? <>
													{validationErrors.email.map((errorText, index) => {
														return <p key={index} className={"px2-error"}>{errorText}</p>;
													})}
												</>
												: <>
											</>}
										</div>
									</li>
									<li className={"px2-form-input-list__li"}>
										<div className="px2-form-input-list__label"><label htmlFor="input-role">{main.lb.get('ui_label.user_role')}</label></div>
										<div className="px2-form-input-list__input">
											{main.profile.role}
										</div>
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
