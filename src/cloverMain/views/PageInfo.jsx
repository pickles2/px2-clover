import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import iterate79 from 'iterate79';

export default function PageInfo(props){

	const main = useContext(MainContext);
	const [sitemapDefinition, updateSitemapDefinition] = useState({
		"path": {"label": "ページのパス"},
		"content": {"label": "コンテンツファイルの格納先"},
		"id": {"label": "ページID"},
		"title": {"label": "ページタイトル"},
		"title_breadcrumb": {"label": "ページタイトル(パン屑表示用)"},
		"title_h1": {"label": "ページタイトル(H1表示用)"},
		"title_label": {"label": "ページタイトル(リンク表示用)"},
		"title_full": {"label": "ページタイトル(タイトルタグ用)"},
		"logical_path": {"label": "論理構造上のパス"},
		"list_flg": {"label": "一覧表示フラグ"},
		"layout": {"label": "レイアウト"},
		"orderby": {"label": "表示順"},
		"keywords": {"label": "metaキーワード"},
		"description": {"label": "metaディスクリプション"},
		"category_top_flg": {"label": "カテゴリトップフラグ"},
		"role": {"label": "ロール"},
		"proc_type": {"label": "コンテンツの処理方法"},

		"**delete_flg": {"label": "(削除フラグ)"},
	});

	useEffect(() => {
		main.px2utils.px2cmd(
			'/?PX=api.get.sitemap_definition',
			{},
			function( res ){
				updateSitemapDefinition(res);
				return;
			}
		);
		return () => {
		};
	}, []);

	/**
	 * 兄ページを新規追加する
	 */
	function createNewBrosBefore(e){
		var basePageInfo = main.pageInfo.bros[0];
		var baseLogicalPath = main.pageInfo.current_page_info.logical_path;
		var basePagePath = main.px2utils.trimContRoot(main.px2utils.href( basePageInfo.path ));
		return createNewPage(e, {
			'logical_path': baseLogicalPath,
			'path': basePagePath,
			'insert': 'before',
		});
	}

	/**
	 * 弟ページを新規追加する
	 */
	function createNewBrosAfter(e){
		var basePageInfo = main.pageInfo.bros[main.pageInfo.bros.length - 1];
		var baseLogicalPath = main.pageInfo.current_page_info.logical_path;
		var basePagePath = main.px2utils.trimContRoot(main.px2utils.href( basePageInfo.path ));
		return createNewPage(e, {
			'logical_path': baseLogicalPath,
			'path': basePagePath,
			'insert': 'after',
		});
	}

	/**
	 * 子ページを新規追加する
	 */
	function createNewChildAfter(e){
		var basePageInfo = main.pageInfo.current_page_info;
		var baseLogicalPath = basePageInfo.logical_path + '>' + basePageInfo.path;
		if( main.pageInfo.children && main.pageInfo.children.length ){
			basePageInfo = main.pageInfo.children[main.pageInfo.children.length - 1];
			baseLogicalPath = basePageInfo.logical_path;
		}
		baseLogicalPath = baseLogicalPath.replace(/^\>*/, '');
		var basePagePath = main.px2utils.trimContRoot(main.px2utils.href( basePageInfo.path ));
		return createNewPage(e, {
			'logical_path': baseLogicalPath,
			'path': basePagePath,
		});
	}

	/**
	 * 新規ページ情報を追加する
	 */
	function createNewPage(e, basePageInfo){
		e.preventDefault();
		var pageInfoRaw = {};
		var modal;
		var originatedCsv = main.pageInfo.originated_csv;
		iterate79.fnc({}, [
			(it1) => {
				if( !basePageInfo ){
					it1.next();
					return;
				}

				main.px2utils.px2cmd(
					basePageInfo.path + '?PX=admin.api.get_page_info',
					{},
					function( res ){
						if( !res.result ){
							alert( 'Error: ' + res.message );
							console.error('Error:', res);
							return;
						}
						originatedCsv = res.originated_csv;
						it1.next();
					}
				);
			},
			(it1) => {
				var params = {
					'filefullname': originatedCsv.basename,
					'row': originatedCsv.row,
				};
				main.px2utils.px2cmd(
					'/?PX=px2dthelper.page.get_page_info_raw',
					params,
					function( res ){
						if( !res.result ){
							alert( 'Error: ' + res.message );
							console.error('Error:', res);
							return;
						}
						pageInfoRaw = res;
						it1.next();
					}
				);
			},
			(it1) => {
				if( !basePageInfo ){
					it1.next();
					return;
				}
				for(var idx in pageInfoRaw.sitemap_definition){
					var key = pageInfoRaw.sitemap_definition[idx];
					if(key == 'logical_path'){
						pageInfoRaw.page_info[idx] = basePageInfo.logical_path;
						break;
					}
				}
				it1.next();
			},
			(it1) => {
				var page_info = {};
				for( var idx = 0; pageInfoRaw.page_info.length > idx; idx ++ ){
					page_info[pageInfoRaw.sitemap_definition[idx]] = pageInfoRaw.page_info[idx];
				}

				var template = require('./PageInfo_files/templates/editPage.twig');
				var $body = $('<div>')
					.append( template( {
						"page_info": page_info,
						"sitemapDefinition": sitemapDefinition,
						"lockedField": {
							"logical_path": "lock",
						},
					} ) )
				;
				modal = px2style.modal({
					'title': "ページ情報を追加する",
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

							// 入力エラー表示をクリア
							$body.find('.px2-form-input-list__li--error').removeClass('px2-form-input-list__li--error');
							$body.find('.px2-error').remove();

							var $inputs = modal.$modal.find('form input');
							var new_page_info = {};
							$inputs.each((idx, elm)=>{
								var $elm = $(elm);
								new_page_info[$elm.attr('name')] = $elm.val();
							});

							var params = {
								'filefullname': originatedCsv.basename,
								'row': (originatedCsv.row + (basePageInfo.insert == 'before' ? 0 : 1)),
								'page_info': new_page_info,
							};
							main.px2utils.px2cmd(
								'/?PX=px2dthelper.page.add_page_info_raw',
								params,
								function( res ){
									if( !res.result ){
										for( const key in res.errors){
											let $input = $body.find('[name='+key+']');
											$input.closest('.px2-form-input-list__li').addClass('px2-form-input-list__li--error');
											$input.before(
												$('<p>')
													.text(res.errors[key])
													.addClass('px2-error')
											);
										}
										console.error('Error:', res);
										modal.unlock();
										return;
									}
									main.setMainState({
										"pageInfoLoaded": false,
									});
									modal.unlock();
									px2style.closeModal();

									main.cloverUtils.autoCommit();
									main.link('?PX=admin.page_info');
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
	 * カレントページ情報を更新する
	 */
	function editPage(e){
		e.preventDefault();
		var pageInfoRaw = {};
		var modal;
		var originatedCsv = main.pageInfo.originated_csv;
		iterate79.fnc({}, [
			(it1) => {
				var params = {
					'filefullname': originatedCsv.basename,
					'row': originatedCsv.row,
				};
				main.px2utils.px2cmd(
					'/?PX=px2dthelper.page.get_page_info_raw',
					params,
					function( res ){
						if( !res.result ){
							alert( 'Error: ' + res.message );
							console.error('Error:', res);
							return;
						}
						pageInfoRaw = res;
						it1.next();
					}
				);
			},
			(it1) => {
				var page_info = {};
				for( var idx = 0; pageInfoRaw.page_info.length > idx; idx ++ ){
					page_info[pageInfoRaw.sitemap_definition[idx]] = pageInfoRaw.page_info[idx];
				}

				var template = require('./PageInfo_files/templates/editPage.twig');
				var $body = $('<div>')
					.append( template( {
						"page_info": page_info,
						"sitemapDefinition": sitemapDefinition,
						"lockedField": {
							// "path": "lock",
							// "logical_path": "lock",
						},
					} ) )
				;
				modal = px2style.modal({
					'title': "ページ情報を編集する",
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

							// 入力エラー表示をクリア
							$body.find('.px2-form-input-list__li--error').removeClass('px2-form-input-list__li--error');
							$body.find('.px2-error').remove();

							var $inputs = modal.$modal.find('form input');
							var new_page_info = {};
							$inputs.each((idx, elm)=>{
								var $elm = $(elm);
								new_page_info[$elm.attr('name')] = $elm.val();
							});

							var params = {
								'filefullname': originatedCsv.basename,
								'row': originatedCsv.row,
								'page_info': new_page_info,
							};
							main.px2utils.px2cmd(
								'/?PX=px2dthelper.page.update_page_info_raw',
								params,
								function( res ){
									if( !res.result ){
										for( const key in res.errors){
											let $input = $body.find('[name='+key+']');
											$input.closest('.px2-form-input-list__li').addClass('px2-form-input-list__li--error');
											$input.before(
												$('<p>')
													.text(res.errors[key])
													.addClass('px2-error')
											);
										}
										console.error('Error:', res);
										modal.unlock();
										return;
									}
									main.setMainState({
										"pageInfoLoaded": false,
									});
									modal.unlock();
									px2style.closeModal();

									main.cloverUtils.autoCommit();
									main.link('?PX=admin.page_info');
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
	 * ページを並べ替える
	 */
	function sortPage(e){
		e.preventDefault();
		var modal;
		var originatedCsv = main.pageInfo.originated_csv;
		iterate79.fnc({}, [
			(it1) => {
				it1.next();
			},
			(it1) => {
				var template = require('./PageInfo_files/templates/sortPage.twig');
				var $body = $('<div>')
					.append( template( {
						"bros": main.pageInfo.bros,
					} ) )
				;
				modal = px2style.modal({
					'title': "ページを並べ替える",
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

							// 入力エラー表示をクリア
							$body.find('.px2-form-input-list__li--error').removeClass('px2-form-input-list__li--error');
							$body.find('.px2-error').remove();

							var $select = modal.$modal.find('form select');
							var selectedPagePath = $select.val();
							main.px2utils.px2cmd("?PX=api.get.page_originated_csv", {
								"path": selectedPagePath,
							}, function(originatedCsvInfo){
								main.px2utils.px2cmd(
									'/?PX=px2dthelper.page.move_page_info_raw',
									{
										"from_filefullname": originatedCsv.basename,
										"from_row": originatedCsv.row,
										"to_filefullname": originatedCsvInfo.basename,
										"to_row": originatedCsvInfo.row,
									},
									function( res ){
										if( !res.result ){
											console.error('Error:', res);
											modal.unlock();
											return;
										}
										main.setMainState({
											"pageInfoLoaded": false,
										});
										modal.unlock();
										px2style.closeModal();

										main.cloverUtils.autoCommit();
										main.link('?PX=admin.page_info');
									}
								);
							});
						}
					},
				});
				it1.next();
			},
		]);
	}

	/**
	 * ページを削除する
	 */
	function deletePage(e){
		e.preventDefault();
		var pageInfoRaw = {};
		var modal;
		var originatedCsv = main.pageInfo.originated_csv;
		iterate79.fnc({}, [
			(it1) => {
				var params = {
					'filefullname': originatedCsv.basename,
					'row': originatedCsv.row,
				};
				main.px2utils.px2cmd(
					'/?PX=px2dthelper.page.get_page_info_raw',
					params,
					function( res ){
						if( !res.result ){
							alert( 'Error: ' + res.message );
							console.error('Error:', res);
							return;
						}
						pageInfoRaw = res;
						it1.next();
					}
				);
			},
			(it1) => {
				var page_info = {};
				for( var idx = 0; pageInfoRaw.page_info.length > idx; idx ++ ){
					page_info[pageInfoRaw.sitemap_definition[idx]] = pageInfoRaw.page_info[idx];
				}

				var template = require('./PageInfo_files/templates/deletePage.twig');
				var $body = $('<div>')
					.append( template( {
					} ) )
				;
				modal = px2style.modal({
					'title': "ページ情報を削除する",
					'body': $body,
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

							iterate79.fnc({}, [
								(it2) => {
									var isChecked = modal.$modal.find('[name=delete_contents]:checked').val();
									console.log(isChecked);
									if( !isChecked ){
										it2.next();
										return;
									}
									main.px2utils.px2cmd(
										'?PX=px2dthelper.content.delete',
										{},
										function( res ){
											if( !res.result ){
												alert( 'Error: ' + res.message );
												console.error('Error:', res);
												modal.unlock();
												return;
											}
											it2.next();
										}
									);
								},
								(it2) => {
									var params = {
										'filefullname': originatedCsv.basename,
										'row': originatedCsv.row,
									};
									main.px2utils.px2cmd(
										'/?PX=px2dthelper.page.delete_page_info_raw',
										params,
										function( res ){
											if( !res.result ){
												alert( 'Error: ' + res.message );
												console.error('Error:', res);
												modal.unlock();
												return;
											}
											main.setMainState({
												"pageInfoLoaded": false,
											});
											modal.unlock();
											px2style.closeModal();

											main.cloverUtils.autoCommit();
											main.link('/?PX=admin.page_info');
											it2.next();
										}
									);
								},
							]);
						}
					},
				});
				it1.next();
			},
		]);
	}


	return (
		<>
			{(main.pageInfo === null)
				?<>
					<p>...</p>
				</>

			:<>{(main.pageInfo.current_page_info)
				?<>
					<div className="cont-menubar">
						<ul>
							<li><a href="?" className="px2-btn" onClick={editPage}>ページ情報を編集する</a></li>
							<li><a href="?" className="px2-btn" onClick={sortPage}>並べ替え</a></li>
							<li><a href="?PX=admin.edit_contents" className="px2-btn">コンテンツを編集する</a></li>
							<li><a href="?" className="px2-btn">プレビューに戻る</a></li>
							{/* <li><a href="?" className="px2-btn" onClick={createNewPage}>ページ情報を追加する</a></li> */}
						</ul>
					</div>
					{(main.pageInfo !== null && typeof(main.pageInfo.breadcrumb) === typeof([]) && (
						<div className="cont-layout-breadcrumb">
							<ul>
							{main.pageInfo.breadcrumb.map( ( breadcrumb_info )=>{
								return (
									<li key={breadcrumb_info.id}><Link href={main.px2utils.href(breadcrumb_info.path + "?PX=admin.page_info")}>{breadcrumb_info.title}</Link></li>
								)
							} )}
							<li>{main.pageInfo.current_page_info.title}</li>
							</ul>
						</div>
					))}
					<div className="cont-layout">
						{(typeof(main.pageInfo.current_page_info) === typeof({}) && (<>
							<div className="cont-layout__main">
								<table className="px2-table" style={{width:'100%',}}>
									<colgroup>
										<col style={{width: "30%"}} />
										<col style={{width: "70%"}} />
									</colgroup>
									<tbody>
										<tr><th>{sitemapDefinition['id'].label}</th><td>{main.pageInfo.current_page_info.id}</td></tr>
										<tr><th>{sitemapDefinition['title'].label}</th><td><a href={main.px2utils.href(main.pageInfo.current_page_info.path)}>{main.pageInfo.current_page_info.title}</a></td></tr>
										<tr><th>{sitemapDefinition['path'].label}</th><td>{main.pageInfo.current_page_info.path}</td></tr>
										{Object.keys(main.pageInfo.current_page_info).map( ( key, idx )=>{
											if( ['id','title','path'].find(val => val==key) ){return;}
											return (
												<tr key={idx}>
													<th>{(sitemapDefinition[key] ? sitemapDefinition[key].label : key)}</th>
													<td>{main.pageInfo.current_page_info[key]}</td>
												</tr>
											)
										} )}
									</tbody>
								</table>
							</div>

							<nav className="cont-layout__right-navibar">
								<div className="cont-pagenavi">
									{(main.pageInfo !== null && typeof(main.pageInfo.parent) === typeof({}) && (<>
										<div className="cont-pagenavi__parent"><Link href={main.px2utils.href(main.pageInfo.parent.path + "?PX=admin.page_info")}>{main.pageInfo.parent.title}</Link></div>
									</>))}
									{(main.pageInfo !== null && typeof(main.pageInfo.bros) === typeof([]) && (<>
										<ul>
										{(!!main.pageInfo.current_page_info.id.length && (
											<li><a href="?" onClick={createNewBrosBefore}>(+) ページを追加する</a></li>
										))}
										{main.pageInfo.bros.map( ( bros_page_info )=>{
											return (
												<li key={bros_page_info.id} className={(bros_page_info.id == main.pageInfo.current_page_info.id ? "cont-pagenavi__current" : "")}><Link href={main.px2utils.href(bros_page_info.path + "?PX=admin.page_info")}>{bros_page_info.title}</Link>
													{(main.px2utils.href(bros_page_info.path) == main.px2utils.href(props.path) && (<>
														<ul>
														{main.pageInfo.children.map( ( child_page_info )=>{
															return (
																<li key={child_page_info.id}><Link href={main.px2utils.href(child_page_info.path + "?PX=admin.page_info")}>{child_page_info.title}</Link></li>
															)
														} )}
															<li><a href="?" onClick={createNewChildAfter}>(+) ページを追加する</a></li>
														</ul>
													</>)
													)}
												</li>
											)
										} )}
										{(!!main.pageInfo.current_page_info.id.length && (
											<li><a href="?" onClick={createNewBrosAfter}>(+) ページを追加する</a></li>
										))}
										</ul>
									</>))}
								</div>
							</nav>
						</>))}
					</div>
					{(typeof(main.pageInfo.current_page_info) === typeof({}) && (<>
						<div className="px2-p">
							<table className="px2-table" style={{width:'100%',}}>
								<colgroup>
									<col style={{width: "30%"}} />
									<col style={{width: "70%"}} />
								</colgroup>
								<tbody>
									<tr><th>Originated CSV</th><td>{main.pageInfo.originated_csv.basename}</td></tr>
									<tr><th>Originated CSV row</th><td>{main.pageInfo.originated_csv.row}</td></tr>
									<tr><th>Process Type</th><td>{main.pageInfo.proc_type}</td></tr>
									<tr><th>Editor Mode</th><td>{main.pageInfo.editor_mode}</td></tr>
								</tbody>
							</table>
						</div>
					</>))}
					{(typeof(main.pageInfo.current_page_info) === typeof({}) && !!main.pageInfo.current_page_info.id.length && (<>
						<p className="px2-text-align-center"><button type="button" onClick={deletePage} className="px2-btn px2-btn--danger">このページを削除する</button></p>
					</>))}
				</>
			:<>
				<p>このページは存在しません。</p>
			</>}
			</>}
		</>
	);
}
