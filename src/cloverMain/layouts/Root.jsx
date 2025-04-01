import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import $ from 'jquery';

export default React.memo(function Root(props){

	const main = useContext(MainContext);

	const currentRoute = main.getCurrentRoute(props.PX);

	document.title = (main.title ? main.title : props.title) + ' : ' + window.px2config.name;

	return (
		<>
			{(main.lb && <>
			<div className="theme-layout" data-px={currentRoute.current}>
				<header className="theme-layout__header">
					<div className="theme-layout__header__inner">
						<div className="theme-layout__title">
							<span className="theme-layout__title-pj-name">
								<Link href={main.px2utils.href('/?PX=admin')}>{(window.px2config.name)}</Link>
							</span>
						</div>
						<nav className="theme-layout__left-navbar">
							<ul>
								<li><Link href={main.px2utils.href("/?PX=admin.page_info")}><span>{main.lb.get('page_title.page_info')}</span></Link></li>
								<li><Link href={main.px2utils.href("/?PX=admin.blog")}><span>{main.lb.get('page_title.blog')}</span></Link></li>
								<li><Link href={main.px2utils.href("/?PX=admin.theme")}><span>{main.lb.get('page_title.theme')}</span></Link></li>
								<li><Link href={main.px2utils.href("/?PX=admin.publish")}><span>{main.lb.get('page_title.publish')}</span></Link></li>
								<li><Link href={main.px2utils.href("/?PX=admin.history")}><span>{main.lb.get('page_title.history')}</span></Link></li>
							</ul>
							<ul className="theme-layout__left-navbar__foot-menu">
								<li><Link href={main.px2utils.href("/?PX=admin.config")}><span>{main.lb.get('page_title.config')}</span></Link></li>
								<li><a href="?"><span>{main.lb.get('page_title.back_to_preview')}</span></a></li>
								<li><a href="?PX=admin.logout"><span>{main.lb.get('page_title.logout')}</span></a></li>
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
									var $a = $(this);
									var href = $a.attr('href');
									var pathname = null;
									var searchString = null;
									var getParams = {};
									if( typeof(href) == typeof('string') && href.match(/\?/) ){
										[pathname, searchString] = href.split('?');
									}
									if(searchString){
										let keyVals = searchString.split('&');
										for( let idx in keyVals ){
											let [key, val] = keyVals[idx].split('=');
											getParams[key] = val;
										}
									}
									if( searchString && getParams['PX'] !== 'admin.logout' ){
										e.preventDefault();
										main.link(e.target.href);
										px2style.closeModal();
										return false;
									}
									return true;
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
							<li><a href="?">{main.lb.get('page_title.back_to_preview')}</a></li>
							<li><a href="?PX=admin.logout">{main.lb.get('page_title.logout')}</a></li>
						</ul>
					</footer>
				</div>
			</div>
			</>)}
		</>
	);
});
