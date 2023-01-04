import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import $ from 'jquery';

export default React.memo(function Root(props){

	const main = useContext(MainContext);

	document.title = (main.title ? main.title : props.title) + ' : ' + window.px2config.name;

	return (
		<>
			<div className="theme-layout" data-px={props.PX}>
				<header className="theme-layout__header">
					<div className="theme-layout__header__inner">
						<div className="theme-layout__title">
							<span className="theme-layout__title-pj-name">
								<Link href={main.px2utils.href('/?PX=admin')}>{(window.px2config.name)}</Link>
							</span>
						</div>
						<nav className="theme-layout__left-navbar">
							<ul>
								<li><Link href="/?PX=admin.page_info">ページ</Link></li>
								<li><Link href="/?PX=admin.theme">テーマ</Link></li>
								<li><Link href="/?PX=admin.publish">パブリッシュ</Link></li>
								<li><Link href="/?PX=admin.history">編集履歴</Link></li>
								<li><Link href="/?PX=admin.config">設定</Link></li>
							</ul>
						</nav>
						<div className="theme-layout__hamburger-menu">
							<button type="button" onClick={(e)=>{
								var $body = $('.theme-layout__left-navbar').clone();
								px2style.modal({
									"type": "drawer-left",
									"body": $body,
									"buttons": [],
									"onbgclick": function(){
										px2style.closeModal();
									},
								});
								$body.find('a').on('click', function(e){
									e.preventDefault();
									main.link(e.target.href);
									px2style.closeModal();
									return false;
								});
							}}><span></span></button>
						</div>
					</div>
				</header>

				<div className="theme-layout__main">
					<div className="theme-layout__main-center">
						<div className="theme-layout__main-center-h1">
							<h1>{main.title}</h1>
						</div>
						<div className="theme-layout__main-center-main">
							<main className="contents">
								{props.contents}
							</main>
						</div>
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
			</div>
		</>
	);
});
