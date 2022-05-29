import $ from 'jquery';
import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function ConfigProfile(props){

	const main = useContext(MainContext);

	const updateProfile = (e) => {
		e.preventDefault();
		var $form = $(e.target);
		// console.log(e.target);
		var newProfile = {
			'id': $form.find('input[name=id]').val(),
			'name': $form.find('input[name=name]').val(),
			'lang': $form.find('select[name=lang]').val(),
		};
		if( $form.find('input[name=pw]').val().length ){
			newProfile.pw = $form.find('input[name=pw]').val();
		}
		main.cloverUtils.updateProfile(
			newProfile,
			(result) => {
				console.log(result);
				if( !result.result ){
					alert('Failed to update profile.');
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
									<li className="px2-form-input-list__li">
										<div className="px2-form-input-list__label"><label htmlFor="input-name">名前</label></div>
										<div className="px2-form-input-list__input"><input type="text" id="input-name" name="name" defaultValue={main.profile.name} className="px2-input" /></div>
									</li>
									<li className="px2-form-input-list__li px2-form-input-list__li--required">
										<div className="px2-form-input-list__label"><label htmlFor="input-id">ID</label></div>
										<div className="px2-form-input-list__input"><input type="text" id="input-id" name="id" defaultValue={main.profile.id} className="px2-input" /></div>
									</li>
									<li className="px2-form-input-list__li">
										<div className="px2-form-input-list__label"><label htmlFor="input-lang">言語</label></div>
										<div className="px2-form-input-list__input">
											<select id="input-lang" name="lang" className="px2-input" defaultValue={main.profile.lang}>
												<option value="en">English</option>
												<option value="ja">Japanese</option>
											</select>
										</div>
									</li>
									<li className="px2-form-input-list__li">
										<div className="px2-form-input-list__label"><label htmlFor="input-pw">パスワード</label></div>
										<div className="px2-form-input-list__input">
											<p className="px2-note">パスワードを変更する場合のみ入力してください。</p>
											<input type="password" id="input-pw" name="pw" defaultValue="" className="px2-input" />
										</div>
									</li>
								</ul>
							</div>
						</div>
						<p><button type="submit" className="px2-btn px2-btn--primary">保存する</button></p>
					</form>
					<p><Link href="?PX=admin.config">キャンセル</Link></p>
			</>}
		</>
	);
}
