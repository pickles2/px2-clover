import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import $ from 'jquery';

export default React.memo(function Root(props){

	const main = useContext(MainContext);

	document.title = props.title + ' : ' + window.px2config.name;

	return (
		<>
			<div className="theme-layout">
				<header className="theme-layout__header">
					<div className="theme-layout__header__inner">
						<div className="theme-layout__title">
							<span className="theme-layout__title-pj-name">
								<Link href={main.px2utils.href('/?PX=admin')}>{(window.px2config.name)}</Link>
							</span>
							<span className="theme-layout__title-console-name">
								Admin Console
							</span>
						</div>
					</div>
				</header>

				<div className="theme-layout__main">
					<nav className="theme-layout__left-navbar">
						<ul>
							<li><Link href="/?PX=admin.sitemap">サイトマップ</Link></li>
							<li><Link href="/?PX=admin.page_info">ページ情報</Link></li>
							<li><Link href="/?PX=admin.theme">テーマ</Link></li>
							<li><Link href="/?PX=admin.modules">モジュール</Link></li>
							<li><Link href="/?PX=admin.publish">パブリッシュ</Link></li>
							<li><Link href="/?PX=admin.history">履歴</Link></li>
							<li><Link href="/?PX=admin.clearcache">キャッシュを消去</Link></li>
							<li><Link href="/?PX=admin.config">設定</Link></li>
						</ul>
					</nav>
					<div className="theme-layout__main-center">
						<div className="theme-layout__main-center-h1">
							<h1>{props.title}</h1>
						</div>
						<div className="theme-layout__main-center-main">
							<main className="contents" data-px={props.PX}>
								{props.contents}
							</main>
						</div>
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
		</>
	);
});
