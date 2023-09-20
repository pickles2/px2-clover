import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import iterate79 from 'iterate79';

export default function ConfigMembers(props){

	const main = useContext(MainContext);
	const [memberList, setMemberList] = useState(false);

	useEffect(() => {
		reloadMemberList();
		return () => {
		};
	}, []);

	function reloadMemberList(){
		main.px2utils.px2cmd(
			'/?PX=admin.api.get_members',
			{},
			function( res, error ){
				setMemberList(res);
				return;
			}
		);
	}

	/**
	 * 新規メンバー情報を追加する
	 */
	function createNewMember(e){
		e.preventDefault();
		var modal;
		var newMemberInfo = {};
		iterate79.fnc({}, [
			(it1) => {
				var $body = $('<div>')
					.append( main.cloverUtils.bindTwig(
						require('-!text-loader!./ConfigMembers_files/templates/edit.twig'),
						{
							"main": main,
							"values": {
								'current_pw': '',
								'name': '',
								'id': '',
								'pw': '',
								'pw_retype': '',
								'email': '',
								'lang': '',
								'role': '',
							},
						}
					) );

				modal = px2style.modal({
					'title': "メンバーを追加する",
					'body': $body,
					'width': '680px',
					'buttons':[
						$('<button type="submit" class="px2-btn px2-btn--primary">')
							.text('保存する')
					],
					'buttonsSecondary': [
						$('<button type="button" class="px2-btn">')
							.text('キャンセル')
							.on('click', function(){
								px2style.closeModal();
							}),
					],
					'form': {
						'action': 'javascript:;',
						'method': 'post',
						'submit': function(e){
							e.preventDefault();
							modal.lock();

							iterate79.fnc({}, [
								function(it2){
									if( modal.$modal.find('[name=current_pw]').length ){
										it2.next({
											"current_pw": modal.$modal.find('[name=current_pw]').val(),
										});
										return;
									}

									var $body = $( main.cloverUtils.bindTwig(
										require('-!text-loader!./ConfigMembers_files/templates/currentPassword.twig'),
										{
											main: main,
										}
									) );
									px2style.modal({
										"title": "パスワード",
										"body": $body,
										"form": {
											"submit": function(){
												it2.next({
													"current_pw": $body.find('input[name=current_pw]').val(),
												});
											}
										},
									}, function(){
									});
								},
								function(it2, data){
									newMemberInfo.current_pw = data.current_pw;
									newMemberInfo.name = modal.$modal.find('[name=name]').val();
									newMemberInfo.id = modal.$modal.find('[name=id]').val();
									newMemberInfo.email = modal.$modal.find('[name=email]').val();
									newMemberInfo.lang = modal.$modal.find('select[name=lang]').val();
									newMemberInfo.role = modal.$modal.find('select[name=role]').val();

									var params = {
										'current_pw': newMemberInfo.current_pw,
										'name': newMemberInfo.name,
										'id': newMemberInfo.id,
										'email': newMemberInfo.email,
										'lang': newMemberInfo.lang,
										'role': newMemberInfo.role,
									};
									if( modal.$modal.find('[name=pw]').val().length || modal.$modal.find('[name=pw_retype]').val().length ){
										params.pw = modal.$modal.find('[name=pw]').val();
										params.pw_retype = modal.$modal.find('[name=pw_retype]').val();
									}
									main.px2utils.px2cmd(
										'/?PX=admin.api.create_new_member',
										params,
										function( res, error ){
											if( !res.result || error ){
												console.error('Error:', res);
												modal.replaceBody( main.cloverUtils.bindTwig(
													require('-!text-loader!./ConfigMembers_files/templates/edit.twig'),
													{
														"main": main,
														"values": params,
														"errors": res.errors,
													}
												) );

												modal.unlock();
												return;
											}
											modal.unlock();
											it2.next();
										}
									);
								},
								function(){
									it1.next();
								},
							]);

						}
					},
				});
			},
			(it1) => {
				reloadMemberList();
				px2style.closeModal();

				main.link('?PX=admin.config.members');
				it1.next();
			},
		]);
	}

	/**
	 * メンバー情報を変更する
	 */
	function editMember(e, memberInfo){
		e.preventDefault();
		var modal;
		var targetId = memberInfo.id;
		var newMemberInfo = {};
		iterate79.fnc({}, [
			(it1) => {
				var $body = $('<div>')
					.append( main.cloverUtils.bindTwig(
						require('-!text-loader!./ConfigMembers_files/templates/edit.twig'),
						{
							"main": main,
							"values": memberInfo,
						}
					) );

				modal = px2style.modal({
					'title': "メンバーを追加する",
					'body': $body,
					'width': '680px',
					'buttons':[
						$('<button type="submit" class="px2-btn px2-btn--primary">')
							.text('保存する')
					],
					'buttonsSecondary': [
						$('<button type="button" class="px2-btn">')
							.text('キャンセル')
							.on('click', function(){
								px2style.closeModal();
							}),
					],
					'form': {
						'action': 'javascript:;',
						'method': 'post',
						'submit': function(e){
							e.preventDefault();
							modal.lock();

							iterate79.fnc({}, [
								function(it2){
									if( modal.$modal.find('[name=current_pw]').length ){
										it2.next({
											"current_pw": modal.$modal.find('[name=current_pw]').val(),
										});
										return;
									}

									var $body = $( main.cloverUtils.bindTwig(
										require('-!text-loader!./ConfigMembers_files/templates/currentPassword.twig'),
										{
											main: main,
										}
									) );
									px2style.modal({
										"title": "パスワード",
										"body": $body,
										"form": {
											"submit": function(){
												it2.next({
													"current_pw": $body.find('input[name=current_pw]').val(),
												});
											}
										},
									}, function(){
									});
								},
								function(it2, data){
									newMemberInfo.current_pw = data.current_pw;
									newMemberInfo.name = modal.$modal.find('[name=name]').val();
									newMemberInfo.id = modal.$modal.find('[name=id]').val();
									newMemberInfo.email = modal.$modal.find('[name=email]').val();
									newMemberInfo.lang = modal.$modal.find('select[name=lang]').val();
									newMemberInfo.role = modal.$modal.find('select[name=role]').val();

									var params = {
										'target_id': targetId,
										'current_pw': newMemberInfo.current_pw,
										'name': newMemberInfo.name,
										'id': newMemberInfo.id,
										'email': newMemberInfo.email,
										'lang': newMemberInfo.lang,
										'role': newMemberInfo.role,
									};
									if( modal.$modal.find('[name=pw]').val().length || modal.$modal.find('[name=pw_retype]').val().length ){
										params.pw = modal.$modal.find('[name=pw]').val();
										params.pw_retype = modal.$modal.find('[name=pw_retype]').val();
									}

									main.px2utils.px2cmd(
										'/?PX=admin.api.update_member',
										params,
										function( res, error ){
											if( !res.result || error ){
												modal.replaceBody( main.cloverUtils.bindTwig(
													require('-!text-loader!./ConfigMembers_files/templates/edit.twig'),
													{
														"main": main,
														"values": params,
														"errors": res.errors,
													}
												) );

												modal.unlock();
												return;
											}
											modal.unlock();
											it2.next();
										}
									);
								},
								function(){
									it1.next();
								},
							]);

						}
					},
				});
			},
			(it1) => {
				reloadMemberList();
				px2style.closeModal();

				main.link('?PX=admin.config.members');
				it1.next();
			},
		]);
	}

	/**
	 * メンバー情報を削除する
	 */
	function deleteMember(e, memberInfo){
		e.preventDefault();
		var modal;
		var targetId = memberInfo.id;
		iterate79.fnc({}, [
			(it1) => {
				var $body = $('<div>')
					.append( main.cloverUtils.bindTwig(
						require('-!text-loader!./ConfigMembers_files/templates/delete.twig'),
						{
							"main": main,
							"values": memberInfo,
						}
					) )
				;
				modal = px2style.modal({
					'title': "メンバーを削除する",
					'body': $body,
					'width': '680px',
					'buttons':[
						$('<button type="submit" class="px2-btn px2-btn--danger">')
							.text('削除する')
					],
					'buttonsSecondary': [
						$('<button type="button" class="px2-btn">')
							.text('キャンセル')
							.on('click', function(){
								px2style.closeModal();
							}),
					],
					'form': {
						'action': 'javascript:;',
						'method': 'post',
						'submit': function(e){
							e.preventDefault();
							modal.lock();

							var params = {
								'target_id': targetId,
								'current_pw': modal.$modal.find('[name=current_pw]').val(),
							};

							main.px2utils.px2cmd(
								'/?PX=admin.api.delete_member',
								params,
								function( res, error ){
									if( error || !res.result ){
										console.error('Error:', res);

										modal.replaceBody( main.cloverUtils.bindTwig(
											require('-!text-loader!./ConfigMembers_files/templates/delete.twig'),
											{
												"main": main,
												"values": params,
												"errors": res.errors,
											}
										) );

										modal.unlock();
										return;
									}
									reloadMemberList();
									modal.unlock();
									px2style.closeModal();

									main.link('?PX=admin.config.members');
								}
							);
						}
					},
				});
				it1.next();
			},
		]);
	}

	let memberListAry = [];
	if( memberList && memberList.list ){
		const roleScore = {
			"member": 0,
			"specialist": 50,
			"admin": 100,
		};
		memberListAry = JSON.parse(JSON.stringify(memberList.list));
		memberListAry.sort(function(a, b){
			if(roleScore[a.role] > roleScore[b.role]){
				return -1;
			}else if(roleScore[a.role] < roleScore[b.role]){
				return 1;
			}
			return 0;
		});
	}

	if(!memberList || !main.profile){
		return (<p>...</p>);
	}

	if(main.bootupInfoLoaded && !main.bootupInfo.authorization.members){
		return (<p>権限がありません。</p>);
	}

	return (
		<>
			<p className="px2-text-align-right">
				<button type="button" className="px2-btn px2-btn--primary" onClick={createNewMember}>新規メンバーを登録する</button>
			</p>
			{(memberListAry && memberListAry.length)
				?<>
					<div className="px2-responsive">
						<table className="px2-table">
							<thead>
								<tr>
									<th>{main.lb.get('ui_label.user_id')}</th>
									<th>{main.lb.get('ui_label.user_name')}</th>
									<th>{main.lb.get('ui_label.user_email')}</th>
									<th>{main.lb.get('ui_label.user_role')}</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
							{memberListAry.map((memberInfo, index) => {
								return <tr key={index}>
									<td>{ memberInfo.id }</td>
									<td>{ memberInfo.name }</td>
									<td>{ memberInfo.email }</td>
									<td>{ main.lb.get(`role.${memberInfo.role}`) }</td>
									{ memberInfo.id == main.profile.id ? <>
										<td>(You)</td>
									</> : <>
										<td>
											<button type="button" className="px2-btn px2-btn--primary" onClick={(e)=>{editMember(e, memberInfo)}}>編集</button>
											<button type="button" className="px2-btn px2-btn--danger" onClick={(e)=>{deleteMember(e, memberInfo)}}>削除</button>
										</td>
									</> }
								</tr>;
							})}
							</tbody>
						</table>
					</div>
				</>
				:<>
					<p>
						メンバー情報は登録されていません。<br />
					</p>
				</>
			}
		</>
	);
}
