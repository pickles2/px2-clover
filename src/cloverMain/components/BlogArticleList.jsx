import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';

export default function BlogArticleList(props){

	const main = useContext(MainContext);
	const [localState, update_localState] = useState({
		"count": 0,
		"blogArticleList": null,
		"page": 1,
		"pageCount": 0,
	});
	const dpp = props.dpp || 50;
	const onLoad = props.onLoad || function(){};
	const onUpdate = props.onUpdate || function(){};

	useEffect(() => {
		px2style.loading();
		main.px2utils.px2cmd(
			`?PX=admin.api.blogkit.get_article_list`,
			{
				blog_id: props.blog_id,
				dpp: dpp,
				p: localState.page,
			},
			function( result ){
				let newState = {};
				newState.count = result.count;
				newState.blogArticleList = result.article_list;
				newState.pageCount = Math.ceil( result.count / dpp );

				update_localState({
					...localState,
					...newState,
				});

				px2style.closeLoading();
				onLoad();
			}
		);
		return () => {
		};
	}, []);

	/**
	 * ページネーションを更新する
	 */
	function gotoPage(page){
		if( page < 1 ){
			page = 1;
		}
		if( localState.pageCount < page ){
			page = localState.pageCount;
		}
		px2style.loading();
		main.px2utils.px2cmd(
			`?PX=admin.api.blogkit.get_article_list`,
			{
				blog_id: props.blog_id,
				dpp: dpp,
				p: page,
			},
			function( result ){
				let newState = {};
				newState.blogArticleList = result.article_list;
				newState.page = page;
				update_localState({
					...localState,
					...newState,
				});

				px2style.closeLoading();
				onUpdate();
			}
		);
	}

	return (
		<>
			{(!localState.blogArticleList)
			?<>
				<div className="px2-text-align-center">loading...</div>
			</>
			:<>												
				<div className="px2-clover-pagenation">
					<ul>
						<li><button type="button" className="px2-btn" onClick={()=>{gotoPage(localState.page - 1);}} disabled={(localState.page <= 1 ? true : false)}>&lt; 前へ</button></li>
						<li>{localState.page} / {localState.pageCount}</li>
						<li><button type="button" className="px2-btn" onClick={()=>{gotoPage(localState.page + 1);}} disabled={(localState.page >= localState.pageCount ? true : false)}>次へ &gt;</button></li>
					</ul>
				</div>
				<div className="px2-linklist">
					<ul>
						{localState.blogArticleList.map( ( articleInfo, idx )=>{
							return (
								<li key={idx}>
									<a href={main.px2utils.href(articleInfo.path + "?PX=admin.page_info")} onClick={(e)=>{
										e.preventDefault();
										main.link( main.px2utils.href(articleInfo.path + "?PX=admin.page_info") );
										return false;
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
				<div className="px2-clover-pagenation">
					<ul>
						<li><button type="button" className="px2-btn" onClick={()=>{gotoPage(localState.page - 1);}} disabled={(localState.page <= 1 ? true : false)}>&lt; 前へ</button></li>
						<li>{localState.page} / {localState.pageCount}</li>
						<li><button type="button" className="px2-btn" onClick={()=>{gotoPage(localState.page + 1);}} disabled={(localState.page >= localState.pageCount ? true : false)}>次へ &gt;</button></li>
					</ul>
				</div>
			</>}

		</>
	);
};
