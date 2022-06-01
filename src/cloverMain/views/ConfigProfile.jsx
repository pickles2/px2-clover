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
			'id': $form.find('input[name=id]').val(),
			'name': $form.find('input[name=name]').val(),
			'lang': $form.find('select[name=lang]').val(),
			'email': $form.find('input[name=email]').val(),
			'role': $form.find('select[name=role]').val(),
		};
		if( $form.find('input[name=pw]').val().length ){
			newProfile.pw = $form.find('input[name=pw]').val();
		}
		main.cloverUtils.updateProfile(
			newProfile,
			(result) => {
				// console.log(result);
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
		if( validationErrors[key] ){
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
									<li className={"px2-form-input-list__li px2-form-input-list__li--required"+(hasValidationError('name') ? ' px2-form-input-list__li--error' : '')}>
										<div className="px2-form-input-list__label"><label htmlFor="input-name">名前</label></div>
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
										<div className="px2-form-input-list__label"><label htmlFor="input-id">ID</label></div>
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
									<li className={"px2-form-input-list__li"+(hasValidationError('pw') ? ' px2-form-input-list__li--error' : '')}>
										<div className="px2-form-input-list__label"><label htmlFor="input-pw">パスワード</label></div>
										<div className="px2-form-input-list__input">
											<p className="px2-note">パスワードを変更する場合のみ入力してください。</p>
											<input type="password" id="input-pw" name="pw" defaultValue="" className={"px2-input px2-input--block"+(hasValidationError('pw') ? ' px2-input--error' : '')} />
											{(hasValidationError('pw'))
												? <>
													{validationErrors.pw.map((errorText, index) => {
														return <p key={index} className={"px2-error"}>{errorText}</p>;
													})}
												</>
												: <>
											</>}
										</div>
									</li>
									<li className={"px2-form-input-list__li"+(hasValidationError('lang') ? ' px2-form-input-list__li--error' : '')}>
										<div className="px2-form-input-list__label"><label htmlFor="input-lang">言語</label></div>
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
										<div className="px2-form-input-list__label"><label htmlFor="input-email">メールアドレス</label></div>
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
									<li className={"px2-form-input-list__li"+(hasValidationError('role') ? ' px2-form-input-list__li--error' : '')}>
										<div className="px2-form-input-list__label"><label htmlFor="input-role">ロール</label></div>
										<div className="px2-form-input-list__input">
											<select id="input-role" name="role" className={"px2-input"+(hasValidationError('role') ? ' px2-input--error' : '')} defaultValue={main.profile.role}>
												<option value="admin">Admin</option>
											</select>
											{(hasValidationError('role'))
												? <>
													{validationErrors.role.map((errorText, index) => {
														return <p key={index} className={"px2-error"}>{errorText}</p>;
													})}
												</>
												: <>
											</>}
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
