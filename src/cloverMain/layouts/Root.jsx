import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import $ from 'jquery';

export default function Root(props){

	const main = useContext(MainContext);

	document.title = props.title + ' : Clover';

	function clearcache(){
		px2style.loading();
		$.ajax({
			"url": "?PX=clearcache",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('------ clearcache Response Error:', typeof(error), error);
			},
			"success": function(data){
				console.log('------ clearcache Response:', typeof(data), data);
			},
			"complete": function(){
				alert('clearcache done.');
				px2style.closeLoading();
			},
		});
	}

	function publish(){
		px2style.loading();
		$.ajax({
			"url": "?PX=publish.run",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('------ publish Response Error:', typeof(error), error);
			},
			"success": function(data){
				console.log('------ publish Response:', typeof(data), data);
			},
			"complete": function(){
				alert('publish done.');
				px2style.closeLoading();
			},
		});
	}

	return (
		<>
			<div className="theme-layout">
				<header className="theme-layout__header">
					<div>Pickles 2 Clover</div>
				</header>

				<div className="theme-layout__main">
					<nav className="theme-layout__left-navbar">
						<ul>
							<li><Link href="?PX=admin.config">Config</Link></li>
							<li><Link href="?PX=admin.page_info">ページ情報</Link></li>
							<li><a href="?PX=admin.edit_contents">コンテンツを編集する</a></li>
							<li><button type="button" onClick={publish}>パブリッシュ</button></li>
							<li><button type="button" onClick={clearcache}>キャッシュを消去</button></li>
						</ul>
					</nav>
					<div className="theme-layout__main-center">
						{(main.pageInfo !== null && typeof(main.pageInfo.breadcrumb) === typeof([]) && (
							<div className="theme-layout__breadcrumb">
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
						<h1>{props.title}</h1>
						<main className="contents">
							{props.contents}
						</main>
					</div>
					<nav className="theme-layout__right-navbar">
						{(main.pageInfo !== null && typeof(main.pageInfo.parent) === typeof({}) && (<>
							<p><Link href={main.px2utils.href(main.pageInfo.parent.path + "?PX=admin.page_info")}>{main.pageInfo.parent.title}</Link></p>
						</>))}
						{(main.pageInfo !== null && typeof(main.pageInfo.bros) === typeof([]) && (<>
							<ul>
							{main.pageInfo.bros.map( ( bros_page_info )=>{
								return (
									<li key={bros_page_info.id}><Link href={main.px2utils.href(bros_page_info.path + "?PX=admin.page_info")}>{bros_page_info.title}</Link>
										{(main.px2utils.href(bros_page_info.path) == main.px2utils.href(props.path) && (<>
											<ul>
											{main.pageInfo.children.map( ( child_page_info )=>{
												return (
													<li key={child_page_info.id}><Link href={main.px2utils.href(child_page_info.path + "?PX=admin.page_info")}>{child_page_info.title}</Link></li>
												)
											} )}
											</ul>
										</>)
										)}
									</li>
								)
							} )}
							</ul>
						</>))}
					</nav>
				</div>
				<footer className="theme-layout__footer">
					<ul>
						<li><a href="?">プレビューへ戻る</a></li>
						<li><a href="?PX=admin.logout">ログアウト</a></li>
					</ul>
				</footer>
			</div>
		</>
	);
}
