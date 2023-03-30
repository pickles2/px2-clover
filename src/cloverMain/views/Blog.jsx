import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function Sitemap(props){

	const main = useContext(MainContext);
	const [localState, update_localState] = useState({
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
				update_localState({
					...localState,
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
			{(!localState.blogList)
				?<>
					<p>...</p>
				</>
			:(localState.page === "ArticleList")
				?<>
					<div className="px2-p">
						<p>記事一覧画面です。</p>
					</div>
				</>
			:(localState.page === "Article")
				?<>
					<div className="px2-p">
						<p>記事詳細画面です。</p>
					</div>
				</>
			:<>
				<ul className="px2-horizontal-list px2-horizontal-list--right">
					<li><button type="button" className="px2-btn px2-btn--primary" data-btn-create-new-blog onClick={createNewBlog}>新規ブログを追加</button></li>
				</ul>

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
			</>}
		</>
	);
});
