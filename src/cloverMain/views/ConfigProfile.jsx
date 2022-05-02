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
			'lang': $form.find('input[name=lang]').val(),
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
				main.link('?PX=admin.config');
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
						<table className="px2-table" style={{width:"100%"}}>
							<tbody>
								<tr>
									<th>名前</th>
									<td><input type="text" name="name" defaultValue={main.profile.name} className="px2-input" /></td>
								</tr>
								<tr>
									<th>ID</th>
									<td><input type="text" name="id" defaultValue={main.profile.id} className="px2-input" /></td>
								</tr>
								<tr>
									<th>言語</th>
									<td><input type="text" name="lang" defaultValue={main.profile.lang} className="px2-input" /></td>
								</tr>
								<tr>
									<th>パスワード</th>
									<td><input type="password" name="pw" defaultValue="" className="px2-input" /></td>
								</tr>
							</tbody>
						</table>
						</div>
						<p><button type="submit" className="px2-btn px2-btn--primary">保存する</button></p>
					</form>
					<p><Link href="?PX=admin.config">キャンセル</Link></p>
			</>}
		</>
	);
}
