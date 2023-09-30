import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import BlogArticleList from '../components/BlogArticleList';
import $ from 'jquery';
import iterate79 from 'iterate79';
import Utils from './Blog_files/js/Utils.js';
const utils = new Utils();

export default React.memo(function Blog(props){

	const main = useContext(MainContext);
	const PXAry = main.PX.split('.');
	const currentBlogId = (()=>{
		if( PXAry.length >= 3 ){
			return PXAry[2];
		}
		return null;
	})();
	const currentAction = (()=>{
		if( !currentBlogId ){
			return null;
		}else if( PXAry.length >= 4 && PXAry[3] == 'article_info' ){
			return 'article_info';
		}
		return 'article_list';
	})();

	const [localState, update_localState] = useState({
		"enableBlogKit": true,
		"blogList": null,
		"articleList": null,
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

	if( currentAction == 'article_list' && !localState.articleList ){
		(() => {
			let newState = {
				"articleList": {},
				"articleInfo": null,
			};
			newState.articleList[currentBlogId] = true;
			update_localState({
				...localState,
				...newState,
			});
		})();
	}

	if( currentAction == 'article_info' && !localState.articleInfo ){
		main.px2utils.px2cmd(
			`?PX=admin.api.blogkit.get_article_info`,
			{
				path: main.path,
			},
			function( result ){
				let newState = {
					"articleInfo": result.article_info,
				};
				update_localState({
					...localState,
					...newState,
				});
			}
		);
	}


	// --------------------------------------
	// 新規ブログ作成
	function createNewBlog(e){
		e.preventDefault();

		iterate79.fnc({}, [
			(it1) => {

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

				it1.next();
			},
		]);
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
							gotoBlogList();
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
		let basePageInfo;
		let sitemapDefinition;
		let blogmapDefinition;
		let modal;
		iterate79.fnc({}, [
			function(it){
				// サイトマップ定義を取得
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
				// ブログマップ定義を取得
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
			(it1) => {
				// 既存ブログの一覧を取得
				main.px2utils.px2cmd(
					`?PX=admin.api.blogkit.get_article_list`,
					{
						blog_id: blog_id,
						dpp: 1,
						p: 1,
					},
					function( result ){
						basePageInfo = result.article_list[0] || {};
						it1.next();
					}
				);
			},
			function(it){
				blogmapDefinition = utils.fixBlogmapDefinition(blogmapDefinition, sitemapDefinition);

				let page_info = {};
				let blogmapDefinitionAssoc = {};
				for( let idx = 0; blogmapDefinition.length > idx; idx ++ ){
					blogmapDefinitionAssoc[blogmapDefinition[idx].key] = blogmapDefinition[idx];
					page_info[blogmapDefinition[idx].key] = basePageInfo[blogmapDefinition[idx].key];

					// 初期値の調整
					switch( blogmapDefinition[idx].key ){
						case "release_date":
						case "update_date":
							page_info[blogmapDefinition[idx].key] = (function(){
								const date = new Date();
								return `${date.getFullYear()}-${("00"+(date.getMonth() + 1)).slice(-2)}-${("00"+date.getDate()).slice(-2)}`;
							})();
							break;
						case "layout":
							page_info[blogmapDefinition[idx].key] = page_info[blogmapDefinition[idx].key] || "article";
							break;
					}
				}

				const $body = $('<div>')
					.append( main.cloverUtils.bindTwig(
						require('-!text-loader!./Blog_files/templates/createNewArticle.twig'),
						{
							blog_id: blog_id,
							blogmapDefinitionAssoc: blogmapDefinitionAssoc,
							page_info: page_info,
						}
					) );
				modal = px2style.modal({
					"title": "記事を作成する",
					"body": $body,
					"buttons": [
						$('<button type="submit" class="px2-btn px2-btn--primary">').text('作成する'),
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

							main.px2utils.px2cmd(
								`?PX=admin.api.blogkit.create_new_article`,
								{
									blog_id: blog_id,
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

									modal.unlock();
									px2style.closeModal();
									gotoArticleList( blog_id );
								}
							);

						},
					},
				});
				var form = px2style.form($body);
				utils.editArticleFormInteraction($body);
				it.next();
			},
		]);
	}

	// --------------------------------------
	// ブログ記事編集
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
					require('-!text-loader!./Blog_files/templates/editBlogArticle.twig'),
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
									gotoArticleInfo(fields.path);
								}
							);
						},
					},
				});
				var form = px2style.form($body);
				utils.editArticleFormInteraction($body);
				it.next();
			},
		]);
	}

	// --------------------------------------
	// 記事削除
	function deleteArticle(path){
		const blog_id = currentBlogId;
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
	// 記事詳細画面へ
	function gotoArticleInfo(path){
		main.link(path+'?PX=admin.page_info');
		return;

		// main.px2utils.px2cmd(
		// 	`/?PX=admin.api.blogkit.get_article_info`,
		// 	{
		// 		path: path,
		// 	},
		// 	function( result ){
		// 		let newState = {
		// 			"articleInfo": result.article_info,
		// 		};
		// 		update_localState({
		// 			...localState,
		// 			...newState,
		// 		});
		// 		main.link(result.article_info.path+'?PX=admin.blog.'+currentBlogId+'.article_info');
		// 	}
		// );
		// return;
	}

	// --------------------------------------
	// 記事一覧へ
	function gotoArticleList(blog_id){
		(() => {
			let newState = {
				"articleList": {},
				"articleInfo": null,
			};
			update_localState({
				...localState,
				...newState,
			});
			newState.articleList[blog_id] = true;
			update_localState({
				...localState,
				...newState,
			});
			main.link('/'+'?PX=admin.blog.'+blog_id);
		})();
		return;
	}

	// --------------------------------------
	// 記事詳細画面へ
	function gotoBlogList(){
		main.px2utils.px2cmd(
			`?PX=admin.api.blogkit.get_blog_list`,
			{},
			function( result ){
				if( !result.result ){
					update_localState({
						...localState,
						"blogList": null,
						"articleList": {},
						"articleInfo": null,
						"enableBlogKit": false,
						"blogList": [],
					});
					main.link('/'+'?PX=admin.blog');
					return;
				}
				update_localState({
					...localState,
					"blogList": null,
					"articleList": {},
					"articleInfo": null,
					"enableBlogKit": true,
					"blogList": result.blog_list,
				});
				main.link('/'+'?PX=admin.blog');
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

			:(currentAction === "article_info" && localState.articleInfo && localState.articleInfo.path)
				?<>
				{/* --------------------------------------
					ブログ記事詳細画面 */}

					<p><button type="button" data-back className="px2-btn" data-btn-article-list={currentBlogId} onClick={(e)=>{
							e.preventDefault();
							const blog_id = $(e.target).attr('data-btn-article-list');
							gotoArticleList( blog_id );
						}}>戻る</button></p>

					<div className="px2-p">
						<table className="px2-table px2-table--dl">
							<tbody>
								<tr>
									<th>ブログID</th>
									<td>{ currentBlogId }</td>
								</tr>
							</tbody>
						</table>
					</div>

					<ul className="px2-horizontal-list px2-horizontal-list--left">
						<li><button type="button" className="px2-btn" onClick={(e)=>{
							e.preventDefault();
							editBlogArticle( currentBlogId, localState.articleInfo.path );
							}}>ブログ記事情報を編集する</button></li>
						<li><a href="?PX=admin.edit_content" className="px2-btn">コンテンツを編集する</a></li>
						<li><a href="?" className="px2-btn">プレビューに戻る</a></li>
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

			:(currentAction === "article_list")
				?<>
				{/* --------------------------------------
					ブログ記事一覧画面 */}
					<p><button type="button" className="px2-btn" onClick={(e)=>{
						gotoBlogList();
					}}>&lt; ブログ一覧へ戻る</button></p>

					<div className="px2-p">
						<table className="px2-table px2-table--dl">
							<tbody>
								<tr>
									<th>ブログID</th>
									<td>{ currentBlogId }</td>
								</tr>
							</tbody>
						</table>
					</div>

					<ul className="px2-horizontal-list px2-horizontal-list--right">
						<li><button type="button" className="px2-btn px2-btn--primary" data-btn-create-new-article={currentBlogId} onClick={createNewArticle}>新規記事を追加</button></li>
					</ul>

					{(localState.articleList && localState.articleList[currentBlogId])
						? <>
						<BlogArticleList
							blog_id={currentBlogId}
							dpp={100}
							onUpdate={()=>{
								$('.theme-layout__main').animate({scrollTop: 0}, 'fast');
							}} />
						</>
						: <>
						<div className="px2-text-align-center">loading...</div>
						</>
					}

					<p className="px2-text-align-center"><button type="button" className="px2-btn px2-btn--danger" data-delete-blog={currentBlogId} onClick={deleteBlog}>ブログ { currentBlogId } を削除する</button></p>
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
