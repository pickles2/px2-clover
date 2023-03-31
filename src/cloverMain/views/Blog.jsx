import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function Sitemap(props){

	const main = useContext(MainContext);
	const [localState, update_localState] = useState({
		"enableBlogKit": true,
		"page": "",
		"blogId": null,
		"blogList": null,
		"articleList": [],
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
								alert('ERROR: '+result.message);
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

	// 記事一覧へ
	function gotoArticleList(e){
		e.preventDefault();
		const blog_id = $(e.target).attr('data-btn-article-list');
		update_localState({
			...localState,
			"page": "ArticleList",
			"blogId": blog_id,
			"articleList": [],
		});
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
					<div className="px2-p">
						<p>記事詳細画面です。</p>
					</div>
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
						});
					}}>戻る</button></p>

					<ul className="px2-horizontal-list px2-horizontal-list--right">
						<li><button type="button" className="px2-btn px2-btn--primary" data-btn-create-new-article={localState.blogId}>新規記事を追加</button></li>
					</ul>

					<div className="px2-p">
						<table className="px2-table" style={{width:"100%"}}>
							<colgroup>
								<col style={{width:"30%"}} />
								<col style={{width:"70%"}} />
							</colgroup>
							<tr>
								<th>ブログID</th>
								<td>{ localState.blogId }</td>
							</tr>
						</table>
					</div>

					<div className="px2-linklist">
						{(localState.articleList && localState.articleList[localState.blogId])
						? <ul>
						{localState.articleList[localState.blogId].map( ( articleInfo, idx )=>{
							return (
								<li key={idx}>
									<a href="#" data-btn-article="{ articleInfo.path }">
										<div className="px2cce-blog-kit-article-list-item">
											<div className="px2cce-blog-kit-article-list-item__title">{ articleInfo.title }</div>
											<div className="px2cce-blog-kit-article-list-item__update_date">{ articleInfo.update_date }</div>
										</div>
									</a>
								</li>
							)
						} )}
						</ul>
						:<></>}
					</div>

					<p className="px2-text-align-center"><button type="button" className="px2-btn px2-btn--danger" data-delete-blog={localState.blogId} onClick={deleteBlog}>ブログ { localState.blogId } を削除する</button></p>
				</>

			:(localState.enableBlogKit && localState.blogList !== null)
				?<>
				{/* --------------------------------------
					ブログ一覧画面 */}
					<ul className="px2-horizontal-list px2-horizontal-list--right">
						<li><button type="button" className="px2-btn px2-btn--primary" data-btn-create-new-blog onClick={createNewBlog}>新規ブログを追加</button></li>
					</ul>

					{(localState.enableBlogKit && localState.blogList)
						?<>
							<div className="px2-linklist">
								<ul>
									{localState.blogList.map( ( blogInfo, idx )=>{
										return (
											<li key={idx}>
												<a href="#" data-btn-article-list={blogInfo.blog_id} onClick={gotoArticleList}>{blogInfo.blog_id}</a>
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
