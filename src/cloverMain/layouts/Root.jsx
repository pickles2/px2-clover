import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import $ from 'jquery';

export default function Root(props){

	const main = useContext(MainContext);

	document.title = props.title + ' : ' + window.px2config.name;

	/**
	 * キャッシュを削除する
	 */
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

	/**
	 * パブリッシュを実行する
	 */
	function publish(){
		if( !confirm('パブリッシュを実行しますか？') ){
			return;
		}
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
					<div><Link href={main.px2utils.href('/?PX=admin')}>{(window.px2config.name)}</Link> Admin Console</div>
				</header>

				<div className="theme-layout__main">
					<nav className="theme-layout__left-navbar">
						<ul>
							<li><Link href="/?PX=admin.sitemap">サイトマップ</Link></li>
							<li><Link href="/?PX=admin.config">設定</Link></li>
							<li><Link href="/?PX=admin.page_info">ページ情報</Link></li>
							<li><button type="button" onClick={publish}>パブリッシュ</button></li>
							<li><button type="button" onClick={clearcache}>キャッシュを消去</button></li>
						</ul>
					</nav>
					<div className="theme-layout__main-center">
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
					{(main.profile && main.profile.name)
						? <>
							<div className="px2-text-align-center">Logged in as: {main.profile.name}</div>
						</>
						: <></>}
					<ul>
						<li><a href="?">プレビューへ戻る</a></li>
						<li><a href="?PX=admin.logout">ログアウト</a></li>
					</ul>
				</footer>
			</div>
		</>
	);
}
