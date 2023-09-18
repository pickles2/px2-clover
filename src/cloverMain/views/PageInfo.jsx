import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import BlogArticleList from '../components/BlogArticleList';
import iterate79 from 'iterate79';
import Utils from './PageInfo_files/js/Utils.js';
const utils = new Utils();

export default React.memo(function PageInfo(props){

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

	var isChangeContentEditorModeAuthorized = (main.bootupInfoLoaded && main.bootupInfo.authorization.server_side_scripting);
		// TODO: HTML中に動的コードを含まないコンテンツならば、'server_side_scripting' 権限は要らないかもしれない。

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

	function fixSitemapDefinition( page_info ){
		var fixedSitemapDefinition = JSON.parse(JSON.stringify(sitemapDefinition));
		Object.keys(page_info).forEach((key) => {
			if(fixedSitemapDefinition[key]){
				return;
			}
			fixedSitemapDefinition[key] = {
				"label": key,
				"type": "text",
			};
			if( key.match(/(?:\-|\_)fla?g$/) ){
				fixedSitemapDefinition[key].type = "boolean";
			}else if( key.match(/^is(?:\-|\_)/) ){
				fixedSitemapDefinition[key].type = "boolean";
			}else if( key.match(/(?:\-|\_)date$/) ){
				fixedSitemapDefinition[key].type = "date";
			}else if( key.match(/(?:\-|\_)datetime$/) ){
				fixedSitemapDefinition[key].type = "datetime";
			}
		});
		return fixedSitemapDefinition;
	}

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
		var fixedSitemapDefinition;
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
				main.px2utils.px2cmd(
					'/?PX=px2dthelper.page.get_page_info_raw',
					{
						'filefullname': originatedCsv.basename,
						'row': originatedCsv.row,
					},
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
				fixedSitemapDefinition = fixSitemapDefinition(page_info);

				var $body = $( main.cloverUtils.bindTwig(
					require('-!text-loader!./PageInfo_files/templates/editPage.twig'),
					{
						"page_info": page_info,
						"sitemapDefinition": fixedSitemapDefinition,
						"lockedField": {
							"logical_path": "lock",
						},
					}
				) );

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

							var new_page_info = {};
							Object.keys(fixedSitemapDefinition).forEach((key)=>{
								if( fixedSitemapDefinition[key].type == 'boolean' ){
									var $input = modal.$modal.find(`form input[name="${key}"]:checked`);
									new_page_info[key] = $input.val();
								}else{
									var $input = modal.$modal.find(`form input[name="${key}"]`);
									new_page_info[key] = $input.val();
								}
							});

							main.px2utils.px2cmd(
								'/?PX=px2dthelper.page.add_page_info_raw',
								{
									'filefullname': originatedCsv.basename,
									'row': (originatedCsv.row + (basePageInfo.insert == 'before' ? 0 : 1)),
									'page_info': new_page_info,
								},
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
	function editPage(){
		var pageInfoRaw = {};
		var modal;
		var originatedCsv = main.pageInfo.originated_csv;
		var fixedSitemapDefinition;
		iterate79.fnc({}, [
			(it1) => {
				main.px2utils.px2cmd(
					'/?PX=px2dthelper.page.get_page_info_raw',
					{
						'filefullname': originatedCsv.basename,
						'row': originatedCsv.row,
					},
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
				fixedSitemapDefinition = fixSitemapDefinition(page_info);

				var $body = $( main.cloverUtils.bindTwig(
					require('-!text-loader!./PageInfo_files/templates/editPage.twig'),
					{
						"page_info": page_info,
						"sitemapDefinition": fixedSitemapDefinition,
						"lockedField": {
							// "path": "lock",
							// "logical_path": "lock",
						},
					}
				) );

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

							var new_page_info = {};
							Object.keys(fixedSitemapDefinition).forEach((key)=>{
								if( fixedSitemapDefinition[key].type == 'boolean' ){
									var $input = modal.$modal.find(`form input[name="${key}"]:checked`);
									new_page_info[key] = $input.val();
								}else{
									var $input = modal.$modal.find(`form input[name="${key}"]`);
									new_page_info[key] = $input.val();
								}
							});

							iterate79.fnc({}, [
								(it2) => {
									// 入力エラー表示をクリア
									$body.find('.px2-form-input-list__li--error').removeClass('px2-form-input-list__li--error');
									$body.find('.px2-error').remove();

									it2.next();
								},
								(it2) => {
									main.px2utils.px2cmd(
										'/?PX=px2dthelper.page.update_page_info_raw',
										{
											'filefullname': originatedCsv.basename,
											'row': originatedCsv.row,
											'page_info': new_page_info,
										},
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
											it2.next();
										}
									);
								},
								(it2) => {
									var contentBefore = page_info.path;
									if( page_info.content ){ contentBefore = page_info.content; }
									var contentAfter = new_page_info.path;
									if( new_page_info.content ){ contentAfter = new_page_info.content; }

									if( contentBefore === contentAfter ){
										// コンテンツパスの変更はないので、スキップ
										it2.next();
										return;
									}

									main.px2utils.px2cmd(
										'/?PX=px2dthelper.content.move',
										{
											'from': contentBefore,
											'to': contentAfter,
										},
										function( res ){
											if( !res.result ){
												console.error('Error:', res);
											}
											it2.next();
										}
									);
									return;
								},
								() => {
									main.setMainState({
										"pageInfoLoaded": false,
									});
									modal.unlock();
									px2style.closeModal();

									main.cloverUtils.autoCommit();
									main.link(main.px2utils.href(new_page_info.path) + '?PX=admin.page_info');
								},
							]);

						}
					},
				});
				it1.next();
			},
		]);
	}

	/**
	 * カレントブログ記事情報を更新する
	 */
	function editBlogArticle(blog_id, path){
		var modal;
		let sitemapDefinition;
		let blogmapDefinition;
		let article_info;
		iterate79.fnc({}, [
			function(it){
				main.px2utils.px2cmd(
					`?PX=admin.api.blogkit.get_sitemap_definition`,
					{},
					function( res ){
						sitemapDefinition = res.sitemap_definition;
						it.next();
					}
				);
			},
			function(it){
				main.px2utils.px2cmd(
					`?PX=admin.api.blogkit.get_blogmap_definition`,
					{
						blog_id: blog_id,
					},
					function( res ){
						blogmapDefinition = res.blogmap_definition;
						it.next();
					}
				);
			},
			function(it){
				main.px2utils.px2cmd(
					`?PX=admin.api.blogkit.get_article_info`,
					{
						path: path,
					},
					function( res ){
						article_info = res.article_info;
						it.next();
					}
				);
			},
			function(it){
				blogmapDefinition = utils.fixBlogmapDefinition(blogmapDefinition, sitemapDefinition);
				const $body = $(main.cloverUtils.bindTwig(
					require('-!text-loader!./PageInfo_files/templates/editBlogArticle.twig'),
					{
						blog_id: blog_id,
						blogmapDefinition: blogmapDefinition,
						article_info: article_info,
					}
				));
				modal = px2style.modal({
					"title": "記事を編集する",
					"body": $body,
					"buttons": [
						$('<button type="submit" class="px2-btn px2-btn--primary">').text('保存する'),
					],
					"buttonsSecondary": [
						$('<button type="button" class="px2-btn px2-btn--secondary">').text('キャンセル')
							.on('click', function(){ px2style.closeModal(); }),
					],
					"form": {
						"submit": function(e){
							modal.lock();
							const $form = $(this);
							let fields = {};
							for( let idx in blogmapDefinition ){
								const blogmapDefinitionRow = blogmapDefinition[idx];
								fields[blogmapDefinitionRow.key] = $form.find(`[name=${blogmapDefinitionRow.key}]`).val();
							}
							iterate79.fnc({}, [
								(it) => {
									main.px2utils.px2cmd(
										`?PX=admin.api.blogkit.update_article`,
										{
											blog_id: blog_id,
											path: path,
											fields: JSON.stringify(fields),
										},
										function( result ){
											if( !result.result ){
												modal.unlock();
												form.reportValidationError({
													errors: result.errors,
												});
												return;
											}
											it.next();
										}
									);
								},
								(it) => {
									var contentBefore = path;
									if( article_info.content ){ contentBefore = article_info.content; }
									var contentAfter = fields.path;
									if( fields.content ){ contentAfter = fields.content; }

									if( contentBefore === contentAfter ){
										// コンテンツパスの変更はないので、スキップ
										it.next();
										return;
									}

									main.px2utils.px2cmd(
										'/?PX=px2dthelper.content.move',
										{
											'from': contentBefore,
											'to': contentAfter,
										},
										function( res ){
											if( !res.result ){
												console.error('Error:', res);
											}
											it.next();
										}
									);
									return;
								},
								(it) => {
									main.setMainState({
										"pageInfoLoaded": false,
									});
									modal.unlock();
									px2style.closeModal();

									main.cloverUtils.autoCommit();
									main.link(main.px2utils.href(fields.path) + '?PX=admin.page_info');

									it.next();
								},
							]);
						},
					},
				});
				var form = px2style.form($body);
				utils.editArticleFormInteraction($body);
				it.next();
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
				// var template = require('./PageInfo_files/templates/sortPage.twig');
				// var $body = $('<div>')
				// 	.append( template( {
				// 		"current_page_info": main.pageInfo.current_page_info,
				// 		"bros": main.pageInfo.bros,
				// 	} ) )
				// ;
				var $body = $('<div>')
					.append( main.cloverUtils.bindTwig(
						require('-!text-loader!./PageInfo_files/templates/sortPage.twig'),
						{
							"current_page_info": main.pageInfo.current_page_info,
							"bros": main.pageInfo.bros,
						}
					) );

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

							if(selectedPagePath == main.pageInfo.current_page_info.path){
								alert('移動先が変更されていません。');
								modal.unlock();
								return;
							}

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
										modal.unlock();
										px2style.closeModal();

										main.setMainState({
											"pageInfoLoaded": false,
										});
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
	function deletePage(){
		let pageInfoRaw = {};
		let modal;
		let originatedCsv = main.pageInfo.originated_csv;
		iterate79.fnc({}, [
			(it1) => {
				main.px2utils.px2cmd(
					'/?PX=px2dthelper.page.get_page_info_raw',
					{
						'filefullname': originatedCsv.basename,
						'row': originatedCsv.row,
					},
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
				var $body = $(template({}));
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
									main.px2utils.px2cmd(
										'/?PX=px2dthelper.page.delete_page_info_raw',
										{
											'filefullname': originatedCsv.basename,
											'row': originatedCsv.row,
										},
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

	/**
	 * ブログ記事を削除する
	 */
	function deleteBlogArticle(blog_id, path){
		let modal;
		const $body = $(main.cloverUtils.bindTwig(
			require('-!text-loader!./PageInfo_files/templates/deleteBlogArticle.twig'),
			{
				blog_id: blog_id,
				path: path,
			}
		));
		modal = px2style.modal({
			"title": "記事を削除する",
			"body": $body,
			"buttons": [
				$('<button type="submit" class="px2-btn px2-btn--danger">').text('削除する'),
			],
			"form": {
				"submit": function(e){
					e.preventDefault();
					modal.lock();

					iterate79.fnc({}, [
						(it) => {
							var isChecked = modal.$modal.find('[name=delete_contents]:checked').val();
							if( !isChecked ){
								it.next();
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
									it.next();
								}
							);
						},
						(it) => {
							main.px2utils.px2cmd(
								`?PX=admin.api.blogkit.delete_article`,
								{
									blog_id: blog_id,
									path: path,
								},
								function( result ){
									if( !result.result ){
										alert('ERROR: '+result.message);
										modal.unlock();
										return;
									}
									modal.unlock();
									px2style.closeModal();

									main.cloverUtils.autoCommit();
									main.link('/?PX=admin.page_info');

									it.next();
								}
							);
						},
					]);
				},
			},
		});
	}

	/**
	 * 編集方法を変更する
	 */
	function changeEditorType(e){
		e.preventDefault();

		var $this = $(this);
		var $body = $('<div>')
			.append( `
				<ul>
					<li><label><input type="radio" name="proc_type" value="html.gui" /> ブロックエディタ</label></li>
					<li><label><input type="radio" name="proc_type" value="html" /> HTML</label></li>
					<li><label><input type="radio" name="proc_type" value="md" /> Markdown</label></li>
				</ul>
			` )
		;
		$body.find('input[name=proc_type]').val( [main.pageInfo.editor_mode] );
		px2style.modal({
			'title': '編集方法を変更する',
			'body': $body,
			'buttons':[
				$('<button class="px2-btn px2-btn--primary" type="button">')
					.text('OK')
					.on('click', function(){
						var editorModeTo = $body.find('input[name=proc_type]:checked').val();

						px2style.loading();

						main.px2utils.px2cmd(
							`?PX=px2dthelper.change_content_editor_mode&editor_mode=${editorModeTo}`,
							{},
							function( result, error ){
								if( !result[0] ){
									alert('編集モードの変更に失敗しました。'+(result[1] || error));
									px2style.closeLoading();
									return;
								}

								main.setMainState({
									"pageInfoLoaded": false,
								});

								px2style.closeModal();
								px2style.closeLoading();

								main.cloverUtils.autoCommit();
								main.link('?PX=admin.page_info');
								return;
							}
						);
					})
			],
			'buttonsSecondary': [
				$('<button class="px2-btn" type="button">')
					.text('キャンセル')
					.on('click', function(){
						px2style.closeModal();
					}),
			]
		});
	}

	/**
	 * 単体パブリッシュ
	 */
	function singlePagePublish(e){
		e.preventDefault();

		px2style.loading();

		main.px2utils.px2cmd(
			'?PX=px2dthelper.publish_single_page',
			{},
			function( res ){
				px2style.closeLoading();

				console.info('=== publish result:', res);
				if( typeof(res) !== typeof('') && !res.result ){
					console.error('Error:', res);
					alert("Error");
					return;
				}
				alert("done.");
			}
		);
	}

	/**
	 * ブロックエディタのコンテンツを再構成する
	 */
	function rebuildBroccoliContent(e){
		e.preventDefault();
		if( main.pageInfo.editor_mode != 'html.gui' ){
			alert('Error: Editor mode is not "html.gui".');
			return;
		}

		px2style.loading();

		var options = {
			'api': 'broccoliBridge',
			'forBroccoli': {
				'api': 'updateContents',
				'options': {
					'lang': 'ja',
				},
			},
			'page_path': main.pageInfo.current_page_info.path,
		};

		main.px2utils.base64_encode_async(JSON.stringify(options)).then(function(optionsBase64){
			main.px2utils.px2cmd(
				'?PX=px2dthelper.px2ce.gpi',
				{
					"appMode": "web",
					"data": optionsBase64,
				},
				function( res ){
					px2style.closeLoading();

					if( res !== true && !res.result ){
						console.error('Error:', res);
						alert("Error: " + res.message);
						return;
					}
					alert("done.");
				}
			);
		});
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
							{(main.pageInfo.originated_csv)
								?<>
								<li><button className="px2-btn" onClick={(e)=>{
									e.preventDefault();
									editPage();
									}}>ページ情報を編集する</button></li>
								</>
							:<>{(main.pageInfo.blog && main.pageInfo.blog.originated_csv)
								?<>
								<li><button className="px2-btn" onClick={(e)=>{
									e.preventDefault();
									editBlogArticle( main.pageInfo.blog.blog_id, main.pageInfo.current_page_info.path );
									}}>ブログ記事情報を編集する</button></li>
								</>
							:<>
							</>}</>}
							<li><a href="?PX=admin.edit_content" className="px2-btn">コンテンツを編集する</a></li>
							<li><a href="?" className="px2-btn">プレビューに戻る</a></li>
						</ul>
					</div>

					{(main.pageInfo !== null && (main.pageInfo.current_page_info.id.length >= 0) && typeof(main.pageInfo.breadcrumb) === typeof([]) && (
						<div className="cont-layout-breadcrumb">
							<ul>
							{main.pageInfo.breadcrumb.map( ( breadcrumb_info )=>{
								return (
									<li key={breadcrumb_info.id}><Link href={main.px2utils.href(breadcrumb_info.path + "?PX=admin.page_info")}>{breadcrumb_info.title}</Link></li>
								)
							} )}
							<li><span>{main.pageInfo.current_page_info.title}</span></li>
							</ul>
						</div>
					))}
					<div className="cont-layout">
						{(typeof(main.pageInfo.current_page_info) === typeof({}) && (<>
							<div className="cont-layout__main">
								<table className="px2-table px2-table--dl">
									<tbody>
										<tr><th>{sitemapDefinition['id'].label}</th><td>{main.pageInfo.current_page_info.id}</td></tr>
										<tr><th>{sitemapDefinition['title'].label}</th><td><a href={main.px2utils.href(main.pageInfo.current_page_info.path)}>{main.pageInfo.current_page_info.title}</a></td></tr>
										<tr><th>{sitemapDefinition['path'].label}</th><td>{main.pageInfo.current_page_info.path}</td></tr>
										<tr><th>{sitemapDefinition['content'].label}</th><td>{main.pageInfo.current_page_info.content}</td></tr>
									</tbody>
								</table>
								<p className="px2-text-align-right"><button type="button" className="px2-btn" onClick={()=>{
									px2style.modal({
										"title": "ページの詳細情報",
										"width": '680px',
										"body": $('#cont-page-info-detail').html(),
									});
								}}>ページ詳細情報</button></p>

								<div className="px2-linklist">
									<ul>
										{main.pageInfo.originated_csv && !!main.pageInfo.current_page_info.id.length && <>
										<li><a href="?" onClick={sortPage}>並べ替え</a></li>
										</>}
										{main.pageInfo.editor_mode !== '.not_exists' && <>
										{isChangeContentEditorModeAuthorized ? <><li><a href="?" onClick={changeEditorType}>編集方法を変更する</a></li></> : <></>}
										<li><a href="?" onClick={singlePagePublish}>単体パブリッシュ</a></li>
										{main.pageInfo.editor_mode == 'html.gui' && <li><a href="?" onClick={rebuildBroccoliContent}>ブロックエディタのコンテンツを再構成する</a></li>}
										</>}
									</ul>
								</div>

								{(main.pageInfo.blog && main.pageInfo.blog.child_blogs.length) ?<>
									<h2>ブログ記事</h2>
									<div>
										{main.pageInfo.blog.child_blogs.map( ( child_blog_info )=>{
											return (<div key={child_blog_info.blog_id}>
												<h3><Link href={main.px2utils.href('?PX=admin.blog.'+child_blog_info.blog_id)}>{child_blog_info.blog_id}</Link></h3>
												<BlogArticleList blog_id={child_blog_info.blog_id} dpp={10} />
											</div>)
										} )}
									</div>
								</>
								:<>
								</>}


							</div>

							<nav className="cont-layout__right-navibar">
								<div className="cont-pagenavi">
									{(main.pageInfo !== null && typeof(main.pageInfo.parent) === typeof({}) && (<>
										<div className="cont-pagenavi__parent"><Link href={main.px2utils.href(main.pageInfo.parent.path + "?PX=admin.page_info")}>{main.pageInfo.parent.title}</Link></div>
									</>))}
									{(main.pageInfo !== null && typeof(main.pageInfo.bros) === typeof([]) && !!main.pageInfo.originated_csv && (<>
										<ul>
										{(!!main.pageInfo.current_page_info.id.length && (
											<li className="cont-pagenavi__add-new-page"><a href="?" onClick={createNewBrosBefore}>(+) ページを追加する</a></li>
										))}
										{main.pageInfo.bros.map( ( bros_page_info )=>{
											return (
												<li key={bros_page_info.id} className={(bros_page_info.id == main.pageInfo.current_page_info.id ? "cont-pagenavi__current" : "")}><Link href={main.px2utils.href(bros_page_info.path + "?PX=admin.page_info")}>{bros_page_info.title}</Link>
													{(main.px2utils.href(bros_page_info.path) == main.px2utils.href(main.path) && (<>
														<ul>
														{main.pageInfo.children.map( ( child_page_info )=>{
															return (
																<li key={child_page_info.id}><Link href={main.px2utils.href(child_page_info.path + "?PX=admin.page_info")}>{child_page_info.title}</Link></li>
															)
														} )}
															<li className="cont-pagenavi__add-new-page"><a href="?" onClick={createNewChildAfter}>(+) ページを追加する</a></li>
														</ul>
													</>)
													)}
												</li>
											)
										} )}
										{(!!main.pageInfo.current_page_info.id.length && (
											<li className="cont-pagenavi__add-new-page"><a href="?" onClick={createNewBrosAfter}>(+) ページを追加する</a></li>
										))}
										</ul>
									</>))}
								</div>
								{(main.pageInfo.blog && main.pageInfo.blog.blog_id)
									?<>
										<div className="px2-p">
											<div>ブログID: <Link href={main.px2utils.href('?PX=admin.blog.'+main.pageInfo.blog.blog_id)}>{main.pageInfo.blog.blog_id}</Link></div>
										</div>
									</>
									:<></>}
							</nav>
						</>))}
					</div>
					<div id="cont-page-info-detail" style={{display: "none"}}>
					{(typeof(main.pageInfo.current_page_info) === typeof({}) && (<>
						{(()=>{
							const fixedSitemapDefinition = fixSitemapDefinition(main.pageInfo.current_page_info);
							return <>
						<div className="px2-p">
							<table className="px2-table px2-table--dl">
								<tbody>
									<tr><th>{fixedSitemapDefinition['id'].label}</th><td>{main.pageInfo.current_page_info.id}</td></tr>
									<tr><th>{fixedSitemapDefinition['title'].label}</th><td><a href={main.px2utils.href(main.pageInfo.current_page_info.path)}>{main.pageInfo.current_page_info.title}</a></td></tr>
									<tr><th>{fixedSitemapDefinition['path'].label}</th><td>{main.pageInfo.current_page_info.path}</td></tr>
									{Object.keys(main.pageInfo.current_page_info).map( ( key, idx )=>{
										if( ['id','title','path'].find(val => val==key) ){return;}
										return (
											<tr key={idx}>
												<th>{(fixedSitemapDefinition[key] ? fixedSitemapDefinition[key].label : key)}</th>
												{fixedSitemapDefinition[key].type == 'boolean'
												? <td>{main.pageInfo.current_page_info[key] ? "ON" : "OFF"}</td>
												: <td>{main.pageInfo.current_page_info[key]}</td>
												}
											</tr>
										)
									} )}
								</tbody>
							</table>
						</div>
							</>
						})()}
						<div className="px2-p">
							<table className="px2-table px2-table--dl">
								<tbody>
									{( main.pageInfo.blog && main.pageInfo.blog.article_info ) ?<>
										{/* ブログ */}
										<tr><th>Page Type</th><td>Blog Article - <Link href={main.px2utils.href("/?PX=admin.blog."+main.pageInfo.blog.blog_id)}>{main.pageInfo.blog.blog_id}</Link></td></tr>
										<tr><th>Originated CSV</th><td>{(main.pageInfo.blog.originated_csv ? `${main.pageInfo.blog.originated_csv.basename} Line: ${main.pageInfo.blog.originated_csv.row}` : '---')}</td></tr>
									</>
									:<>
										{/* ページ */}
										<tr><th>Page Type</th><td>Sitemap Page</td></tr>
										<tr><th>Originated CSV</th><td>{(main.pageInfo.originated_csv ? `${main.pageInfo.originated_csv.basename} Line: ${main.pageInfo.originated_csv.row}` : '---')}</td></tr>
									</>}
									<tr><th>Process Type</th><td>{main.pageInfo.proc_type}</td></tr>
									<tr><th>Editor Mode</th><td>{main.pageInfo.editor_mode}</td></tr>
								</tbody>
							</table>
						</div>
					</>))}
					</div>

					{(typeof(main.pageInfo.current_page_info) === typeof({}) && !!main.pageInfo.current_page_info.id.length && (<>
						{(main.pageInfo.originated_csv)
							?<>
							<p className="px2-text-align-center"><button type="button" onClick={(e)=>{
								e.preventDefault();
								deletePage();
								}} className="px2-btn px2-btn--danger">このページを削除する</button></p>
							</>
						:<>{(main.pageInfo.blog && main.pageInfo.blog.originated_csv)
							?<>
							<p className="px2-text-align-center"><button type="button" onClick={(e)=>{
								e.preventDefault();
								deleteBlogArticle( main.pageInfo.blog.blog_id, main.pageInfo.current_page_info.path );
								}} className="px2-btn px2-btn--danger">このブログ記事を削除する</button></p>
							</>
						:<>
						</>}</>}
					</>))}
				</>
			:<>
				<p>このページは存在しません。</p>
			</>}</>}
		</>
	);
});
