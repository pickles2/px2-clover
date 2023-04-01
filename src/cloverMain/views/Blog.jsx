import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';
import it79 from 'iterate79';
import Utils from './Blog_files/js/Utils.js';
const utils = new Utils();

export default React.memo(function Sitemap(props){

	const main = useContext(MainContext);
	const [localState, update_localState] = useState({
		"enableBlogKit": true,
		"page": "",
		"blogId": null,
		"blogList": null,
		"articleList": [],
		"articleInfo": null,
	});

	if( !localState.blogList ){
		main.px2utils.px2cmd(
			`?PX=admin.api.blogkit.get_blog_list`,
			{},
			function( result ){
				if( !result.result ){
					update_localState({
						...localState,
						"enableBlogKit": false,
						"blogList": [],
					});
					return;
				}
				update_localState({
					...localState,
					"enableBlogKit": true,
					"blogList": result.blog_list,
				});
			}
		);
	}

	// --------------------------------------
	// 新規ブログ作成
	function createNewBlog(e){
		e.preventDefault();
		var $body = $('<div>')
			.append( main.cloverUtils.bindTwig(
				require('-!text-loader!./Blog_files/templates/createNewBlog.twig'),
				{}
			) );
		px2style.modal({
			"title": "新規ブログを追加する",
			"body": $body,
			"buttons": [
				$('<button type="submit" class="px2-btn px2-btn--primary">').text('作成する'),
			],
			"form": {
				"submit": function(e){
					const $form = $(this);
					const newBlogId = $form.find(`[name=blog_id]`).val();

					main.px2utils.px2cmd(
						`?PX=admin.api.blogkit.create_new_blog`,
						{
							blog_id: newBlogId,
						},
						function( result ){
							if( !result.result ){
								form.reportValidationError({
									errors: result.errors,
								});
								return;
							}
							px2style.closeModal();
							update_localState({
								...localState,
								"blogList": null,
							});
						}
					);
				},
			},
		});
		var form = px2style.form($body);
	}

	// --------------------------------------
	// ブログを削除
	function deleteBlog(e){
		e.preventDefault();
		const blog_id = $(e.target).attr('data-delete-blog');
		var $body = $('<div>')
			.append( main.cloverUtils.bindTwig(
				require('-!text-loader!./Blog_files/templates/deleteBlog.twig'),
				{
					"blog_id": blog_id,
				}
			) );
		px2style.modal({
			"title": "ブログを削除する",
			"body": $body,
			"buttons": [
				$('<button type="submit" class="px2-btn px2-btn--danger">').text('削除する'),
			],
			"form": {
				"submit": function(e){
					main.px2utils.px2cmd(
						`?PX=admin.api.blogkit.delete_blog`,
						{
							blog_id: blog_id,
						},
						function( result ){
							if( !result.result ){
								alert('ERROR: '+result.message);
								return;
							}
							px2style.closeModal();
							update_localState({
								...localState,
								"page": null,
								"blogId": null,
								"articleList": [],
							});
						}
					);
				},
			},
		});
	}

	// --------------------------------------
	// 新規記事作成
	function createNewArticle(e){
		const blog_id = $(e.target).attr(`data-btn-create-new-article`);
		let sitemapDefinition;
		let blogmapDefinition;
		it79.fnc({}, [
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
						'blog_id': blog_id,
					},
					function( res ){
						blogmapDefinition = res.blogmap_definition;
						it.next();
					}
				);
			},
			function(it){
				blogmapDefinition = utils.fixSitemapDefinition(blogmapDefinition, sitemapDefinition);
				const $body = $('<div>')
					.append( main.cloverUtils.bindTwig(
						require('-!text-loader!./Blog_files/templates/createNewArticle.twig'),
						{
							blog_id: blog_id,
							blogmapDefinition: blogmapDefinition,
						}
					) );
				px2style.modal({
					"title": "記事を作成する",
					"body": $body,
					"buttons": [
						$('<button type="submit" class="px2-btn px2-btn--primary">').text('作成する'),
					],
					"form": {
						"submit": function(e){
							const $form = $(this);
							let fields = {};
							for( let idx in blogmapDefinition ){
								const blogmapDefinitionRow = blogmapDefinition[idx];
								fields[blogmapDefinitionRow.key] = $form.find(`[name=${blogmapDefinitionRow.key}]`).val();
							}

							main.px2utils.px2cmd(
								`?PX=admin.api.blogkit.create_new_article`,
								{
									blog_id: blog_id,
									fields: JSON.stringify(fields),
								},
								function( result ){
									if( !result.result ){
										form.reportValidationError({
											errors: result.errors,
										});
										return;
									}

									px2style.closeModal();
									gotoArticleList( blog_id );
								}
							);

						},
					},
				});
				var form = px2style.form($body);
				it.next();
			},
		]);
	}

	// --------------------------------------
	// 記事編集
	function editArticle(path){
		const blog_id = localState.blogId;
		let sitemapDefinition;
		let blogmapDefinition;
		let article_info;
		it79.fnc({}, [
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
				blogmapDefinition = utils.fixSitemapDefinition(blogmapDefinition, sitemapDefinition);
				const $body = $(main.cloverUtils.bindTwig(
					require('-!text-loader!./Blog_files/templates/editArticle.twig'),
					{
						blog_id: blog_id,
						blogmapDefinition: blogmapDefinition,
						article_info: article_info,
					}
				));
				px2style.modal({
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
							const $form = $(this);
							let fields = {};
							for( let idx in blogmapDefinition ){
								const blogmapDefinitionRow = blogmapDefinition[idx];
								fields[blogmapDefinitionRow.key] = $form.find(`[name=${blogmapDefinitionRow.key}]`).val();
							}
							main.px2utils.px2cmd(
								`?PX=admin.api.blogkit.update_article`,
								{
									blog_id: blog_id,
									path: path,
									fields: JSON.stringify(fields),
								},
								function( result ){
									if( !result.result ){
										form.reportValidationError({
											errors: result.errors,
										});
										return;
									}
									px2style.closeModal();
									gotoArticle(fields.path);
								}
							);
						},
					},
				});
				var form = px2style.form($body);
				it.next();
			},
		]);
	}

	// --------------------------------------
	// 記事削除
	function deleteArticle(path){
		const blog_id = localState.blogId;
		const $body = $(main.cloverUtils.bindTwig(
			require('-!text-loader!./Blog_files/templates/deleteArticle.twig'),
			{
				blog_id: blog_id,
				path: path,
			}
		));
		px2style.modal({
			"title": "記事を削除する",
			"body": $body,
			"buttons": [
				$('<button type="submit" class="px2-btn px2-btn--danger">').text('削除する'),
			],
			"form": {
				"submit": function(e){
					main.px2utils.px2cmd(
						`?PX=admin.api.blogkit.delete_article`,
						{
							blog_id: blog_id,
							path: path,
						},
						function( result ){
							if( !result.result ){
								alert('ERROR: '+result.message);
								return;
							}
							px2style.closeModal();
							gotoArticleList(blog_id);
						}
					);
				},
			},
		});
	}

	// --------------------------------------
	// 記事一覧へ
	function gotoArticleList(blog_id){
		main.px2utils.px2cmd(
			`?PX=admin.api.blogkit.get_article_list`,
			{
				blog_id: blog_id,
			},
			function( result ){
				let newState = {
					"blogId": blog_id,
					"page": "ArticleList",
					"articleList": {},
					"articleInfo": null,
				};
				newState.articleList[blog_id] = result.article_list;
				update_localState({
					...localState,
					...newState,
				});
			}
		);
		return;
	}

	// --------------------------------------
	// 記事詳細画面へ
	function gotoArticle(path){
		main.px2utils.px2cmd(
			`?PX=admin.api.blogkit.get_article_info`,
			{
				path: path,
			},
			function( result ){
				let newState = {
					"page": "Article",
					"articleInfo": result.article_info,
				};
				update_localState({
					...localState,
					...newState,
				});
			}
		);
		return;
	}

	return (
		<>
			{(!localState.enableBlogKit)
				?<>
				{/* --------------------------------------
					BlogKitプラグインが未設定の画面 */}
					<p>Blog Kit プラグインが利用できません。</p>
				</>

			:(localState.page === "Article")
				?<>
				{/* --------------------------------------
					記事詳細画面 */}

					<p><button type="button" data-back className="px2-btn" data-btn-article-list={localState.blogId} onClick={(e)=>{
							e.preventDefault();
							const blog_id = $(e.target).attr('data-btn-article-list');
							gotoArticleList( blog_id );
						}}>戻る</button></p>

					<div className="px2-p">
						<table className="px2-table" style={{width: "100%",}}>
							<colgroup>
								<col style={{width: "30%",}} />
								<col style={{width: "70%",}} />
							</colgroup>
							<tbody>
								<tr>
									<th>ブログID</th>
									<td>{ localState.blogId }</td>
								</tr>
							</tbody>
						</table>
					</div>

					<ul className="px2-horizontal-list px2-horizontal-list--left">
						<li><button type="button" className="px2-btn" onClick={(e)=>{
							e.preventDefault();
							editArticle( localState.articleInfo.path );
							}}>ページ情報を編集する</button></li>
						<li><button type="button" className="px2-btn" onClick={(e)=>{
							window.open(main.px2utils.href(localState.articleInfo.path + '?PX=admin.edit_content'));
							}}>コンテンツを編集する</button></li>
						<li><button type="button" className="px2-btn" onClick={(e)=>{
							window.open(main.px2utils.href(localState.articleInfo.path));
							}}>プレビューに戻る</button></li>
					</ul>

					<div className="px2-p">
						<table className="px2-table" style={{width: "100%",}}>
							<colgroup>
								<col style={{width: "30%",}} />
								<col style={{width: "70%",}} />
							</colgroup>
							<tbody>
								{Object.keys(localState.articleInfo).map( ( key, idx )=>{
									const value = localState.articleInfo[key];
									return (
										<tr key={key}>
											<th>{key}</th>
											<td>{value}</td>
										</tr>
									)
								} )}
							</tbody>
						</table>
					</div>
					<p className="px2-text-align-center"><button type="button" className="px2-btn px2-btn--danger" data-delete-article={localState.articleInfo.path} onClick={(e)=>{
						e.preventDefault();
						deleteArticle(localState.articleInfo.path);
						}}>記事を削除する</button></p>

				</>

			:(localState.page === "ArticleList")
				?<>
				{/* --------------------------------------
					記事一覧画面 */}
					<p><button type="button" className="px2-btn" onClick={()=>{
						update_localState({
							...localState,
							"page": null,
							"blogId": null,
							"articleList": [],
							"articleInfo": null,
						});
					}}>戻る</button></p>

					<div className="px2-p">
						<table className="px2-table" style={{width:"100%"}}>
							<colgroup>
								<col style={{width:"30%"}} />
								<col style={{width:"70%"}} />
							</colgroup>
							<tbody>
								<tr>
									<th>ブログID</th>
									<td>{ localState.blogId }</td>
								</tr>
							</tbody>
						</table>
					</div>

					<ul className="px2-horizontal-list px2-horizontal-list--right">
						<li><button type="button" className="px2-btn px2-btn--primary" data-btn-create-new-article={localState.blogId} onClick={createNewArticle}>新規記事を追加</button></li>
					</ul>

					{(localState.articleList && localState.articleList[localState.blogId] && localState.articleList[localState.blogId].length)
						? <div className="px2-linklist">
							<ul>
							{localState.articleList[localState.blogId].map( ( articleInfo, idx )=>{
								return (
									<li key={idx}>
										<a href="#" onClick={(e)=>{
											e.preventDefault();
											const path = articleInfo.path;
											gotoArticle(path);
										}}>
											<div className="cont-blog-kit-article-list-item">
												<div className="cont-blog-kit-article-list-item__title">{ articleInfo.title }</div>
												<div className="cont-blog-kit-article-list-item__update_date">{ articleInfo.update_date }</div>
											</div>
										</a>
									</li>
								)
							} )}
							</ul>
						</div>
					:<></>}

					<p className="px2-text-align-center"><button type="button" className="px2-btn px2-btn--danger" data-delete-blog={localState.blogId} onClick={deleteBlog}>ブログ { localState.blogId } を削除する</button></p>
				</>

			:(localState.enableBlogKit && localState.blogList !== null)
				?<>
				{/* --------------------------------------
					ブログ一覧画面 */}
					<ul className="px2-horizontal-list px2-horizontal-list--right">
						<li><button type="button" className="px2-btn px2-btn--primary" data-btn-create-new-blog onClick={createNewBlog}>新規ブログを追加</button></li>
					</ul>

					{(localState.enableBlogKit && localState.blogList.length)
						?<>
							<div className="px2-linklist">
								<ul>
									{localState.blogList.map( ( blogInfo, idx )=>{
										return (
											<li key={idx}>
												<a href="#" onClick={(e)=>{
													e.preventDefault();
													const blog_id = blogInfo.blog_id;
													gotoArticleList( blog_id );
												}}>{blogInfo.blog_id}</a>
											</li>
										)
									} )}
								</ul>
							</div>
						</>
					: <>
					</>}
				</>
			:<>
			{/* --------------------------------------
				読込中画面 */}
				<div className="px2-p">
					<p>...</p>
				</div>
			</>}
		</>
	);
});
