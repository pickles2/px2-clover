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
			function( res ){
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
		iterate79.fnc({}, [
			(it1) => {
				// var template = require('./ConfigMembers_files/templates/edit.twig');
				// var $body = template( {
				// 	"values": {
				// 		'name': '',
				// 		'id': '',
				// 		'pw': '',
				// 		'email': '',
				// 		'lang': '',
				// 		'role': '',
				// 	},
				// } );
				var $body = $('<div>')
					.append( main.cloverUtils.bindTwig(
						require('-!text-loader!./ConfigMembers_files/templates/edit.twig'),
						{
							"values": {
								'name': '',
								'id': '',
								'pw': '',
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

							var params = {
								'name': modal.$modal.find('[name=name]').val(),
								'id': modal.$modal.find('[name=id]').val(),
								'email': modal.$modal.find('[name=email]').val(),
								'lang': modal.$modal.find('select[name=lang]').val(),
								'role': modal.$modal.find('select[name=role]').val(),
							};
							if( modal.$modal.find('[name=pw]').val().length ){
								params.pw = modal.$modal.find('[name=pw]').val();
							}
							main.px2utils.px2cmd(
								'/?PX=admin.api.create_new_member',
								params,
								function( res ){
									if( !res.result ){
										console.error('Error:', res);
										modal.replaceBody( template( {
											"values": params,
											"errors": res.errors,
										} ) );

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

	/**
	 * メンバー情報を変更する
	 */
	function editMember(e, memberInfo){
		e.preventDefault();
		var modal;
		var targetId = memberInfo.id;
		iterate79.fnc({}, [
			(it1) => {
				// var template = require('./ConfigMembers_files/templates/edit.twig');
				// var $body = template( {
				// 	"values": memberInfo,
				// } );
				var $body = $('<div>')
					.append( main.cloverUtils.bindTwig(
						require('-!text-loader!./ConfigMembers_files/templates/edit.twig'),
						{
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

							var params = {
								'target_id': targetId,
								'name': modal.$modal.find('[name=name]').val(),
								'id': modal.$modal.find('[name=id]').val(),
								'email': modal.$modal.find('[name=email]').val(),
								'lang': modal.$modal.find('select[name=lang]').val(),
								'role': modal.$modal.find('select[name=role]').val(),
							};
							if( modal.$modal.find('[name=pw]').val().length ){
								params.pw = modal.$modal.find('[name=pw]').val();
							}

							main.px2utils.px2cmd(
								'/?PX=admin.api.update_member',
								params,
								function( res ){
									if( !res.result ){
										console.error('Error:', res);

										modal.replaceBody( template( {
											"values": params,
											"errors": res.errors,
										} ) );

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

	/**
	 * メンバー情報を削除する
	 */
	function deleteMember(e, memberInfo){
		e.preventDefault();
		var modal;
		var targetId = memberInfo.id;
		iterate79.fnc({}, [
			(it1) => {
				var template = require('./ConfigMembers_files/templates/delete.twig');
				var $body = $('<div>')
					.append( template( {
						"values": memberInfo,
					} ) )
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
							};

							main.px2utils.px2cmd(
								'/?PX=admin.api.delete_member',
								params,
								function( res ){
									if( !res.result ){
										alert( 'Error: ' + res.message );
										console.error('Error:', res);
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

	return (
		<>
			{(!memberList || !main.profile)
				?<>
					<p>...</p>
				</>
			:<>
			<p><button type="button" className={"px2-btn"} onClick={createNewMember}>新規メンバーを登録する</button></p>
			{(memberList.list && memberList.list.length)
				?<>
					<div class="px2-responsive">
						<table class="px2-table">
							<thead>
								<tr>
									<th>{main.lb.get('ui_label.user_name')}</th>
									<th>{main.lb.get('ui_label.user_email')}</th>
									<th>{main.lb.get('ui_label.user_role')}</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
							{memberList.list.map((memberInfo, index) => {
								return <tr key={index}>
									<td>{ memberInfo.name }</td>
									<td>{ memberInfo.email }</td>
									<td>{ memberInfo.role }</td>
									{ memberInfo.id == main.profile.id ? <>
										<td>(You)</td>
									</> : <>
										<td>
											<button type="button" className="px2-btn" onClick={(e)=>{editMember(e, memberInfo)}}>編集</button>
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
			}</>}
			<p><Link href="?PX=admin.config">戻る</Link></p>
		</>
	);
}
