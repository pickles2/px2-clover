import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';

export default function BlogArticleList(props){

	const main = useContext(MainContext);
	const [blogArticleList, update_blogArticleList] = useState({});

	return (
		<>
			{(!blogArticleList[props.blog_id])
			?<>
				{(()=>{
					main.px2utils.px2cmd(
						`?PX=admin.api.blogkit.get_article_list`,
						{
							blog_id: props.blog_id,
						},
						function( result ){
							let newState = {};
							newState[props.blog_id] = result.article_list;
							update_blogArticleList(newState);
						}
					);
				})()}
				<div>...</div>
			</>
			:<>												
				<div className="px2-linklist">
					<ul>
						{blogArticleList[props.blog_id].map( ( articleInfo, idx )=>{
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
			</>}

		</>
	);
};
