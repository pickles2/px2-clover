import React from "react";
import ReactDOM from "react-dom";
import {MainContext} from './context/MainContext';
import Root from "./layouts/Root";
import Dashboard from './views/Dashboard';
import ClearCache from './views/ClearCache';
import Config from './views/Config';
import ConfigProfile from './views/ConfigProfile';
import ConfigMembers from './views/ConfigMembers';
import ConfigHistory from './views/ConfigHistory';
import ConfigScheduler from './views/ConfigScheduler';
import ConfigMaintenance from './views/ConfigMaintenance';
import Sitemap from './views/Sitemap';
import PageInfo from './views/PageInfo';
import Theme from './views/Theme';
import Modules from './views/Modules';
import Publish from './views/Publish';
import History from './views/History';
import Finder from './views/Finder';
import iterate79 from 'iterate79';
import LangBank from 'langbank';

const languageCsv = require('../../public/resources/data/language.csv');

class Layout extends React.Component {

	/**
	 * Constructor
	 */
	constructor() {
		super();

		function parseUrl(url){
			const parsedUrl = new URL(url);
			let getParams = {};
			let [pathname, searchString] = parsedUrl.search.split('?');
			pathname = parsedUrl.pathname;
			let keyVals = searchString.split('&');
			for( let idx in keyVals ){
				let [key, val] = keyVals[idx].split('=');
				getParams[key] = val;
			}
			pathname = pathname.replace(window.px2config.path_controot, '/');
			let newState = {
				path: pathname,
				PX: getParams.PX,
			};
			return newState;
		}
		const updateGlobalData = ( callback )=>{
			callback = callback || function(){};
			let tmpNewState = {};
			iterate79.fnc({}, [
				(it1) => {
					if( this.state.profileLoaded && this.state.lbLoaded && this.state.pageInfoLoaded && this.state.configLoaded ){
						return;
					}
					it1.next();
				},
				(it1) => {
					px2style.loading();
					it1.next();
				},
				(it1) => {
					if( this.state.profileLoaded ){
						it1.next();
						return;
					}
					this.state.cloverUtils.getProfile((data)=>{
						tmpNewState.profile = data.profile;
						tmpNewState.profileLoaded = true;
						it1.next();
					});
				},
				(it1) => {
					if( this.state.lbLoaded ){
						it1.next();
						return;
					}
					const lb = new LangBank(languageCsv, ()=>{
						let lang = 'ja';
						lang = ( this.state.profile && this.state.profile.lang ? this.state.profile.lang : lang);
						lang = ( tmpNewState.profile && tmpNewState.profile.lang ? tmpNewState.profile.lang : lang);
						lb.setLang( lang );
						tmpNewState.lb = lb;
						tmpNewState.lbLoaded = true;
						it1.next();
					});
				},
				(it1) => {
					if( this.state.configLoaded ){
						it1.next();
						return;
					}
					this.state.cloverUtils.getConfig((data)=>{
						tmpNewState.config = data.config;
						tmpNewState.configLoaded = true;
						it1.next();
					});
				},
				(it1) => {
					if( this.state.pageInfoLoaded ){
						it1.next();
						return;
					}
					this.state.px2utils.getCurrentPageInfo((data)=>{
						tmpNewState.pageInfo = data;
						tmpNewState.pageInfoLoaded = true;
						it1.next();
					});
				},
				(it1) => {
					tmpNewState.currentRoute = getCurrentRoute(this.state.PX);
					tmpNewState.title = tmpNewState.currentRoute.title;

					if( this.state.PX == "admin.page_info" && tmpNewState.pageInfo ){
						// PageInfo 画面にて、routeのタイトルをページのタイトルで置き換える
						let currentTitle = tmpNewState.title;
						if( currentTitle != tmpNewState.pageInfo.current_page_info.title ){
							currentTitle = tmpNewState.pageInfo.current_page_info.title;
							tmpNewState.title = currentTitle;
						}
					}
					it1.next();
					return;
				},
				(it1) => {
					px2style.closeLoading();
					this.setState( tmpNewState );
					callback();
					it1.next();
				},
			]);
		}

		const setMainState = (val) => {
			this.setState((state) => val);
		};

		const link = (url) => {
			url = (url=>{
				const a = document.createElement('a');
				a.href = url;
				return a.href;
			})(url);
			const newState = parseUrl(url);
			history.pushState({}, '', url);
			newState.pageInfoLoaded = false;
			this.setState(newState);
			updateGlobalData(()=>{
				window.scrollTo(0,0);
			});
		};

		const parsedUrl = parseUrl(location);
		const route = {
			'admin': {
				"title": "ダッシュボード",
				"content": <Dashboard />,
			},
			'admin.sitemap': {
				"title": "サイトマップ",
				"content": <Sitemap />,
			},
			'admin.page_info': {
				"title": "ページ情報",
				"content": <PageInfo />,
			},
			'admin.theme': {
				"title": "テーマ",
				"content": <Theme />,
			},
			'admin.publish': {
				"title": "パブリッシュ",
				"content": <Publish />,
			},
			'admin.history': {
				"title": "履歴",
				"content": <History />,
			},
			'admin.config': {
				"title": "設定",
				"content": <Config />,
			},
			'admin.config.profile': {
				"title": "プロフィール設定",
				"parent": "admin.config",
				"content": <ConfigProfile />,
			},
			'admin.config.members': {
				"title": "メンバー一覧",
				"parent": "admin.config",
				"content": <ConfigMembers />,
			},
			'admin.config.history': {
				"title": "履歴管理設定",
				"parent": "admin.config",
				"content": <ConfigHistory />,
			},
			'admin.config.scheduler': {
				"title": "タスクスケジュール設定",
				"parent": "admin.config",
				"content": <ConfigScheduler />,
			},
			'admin.config.files_and_folders': {
				"title": "ファイルを操作",
				"parent": "admin.config",
				"content": <Finder />,
			},
			'admin.modules': {
				"title": "モジュール",
				"parent": "admin.config",
				"content": <Modules />,
			},
			'admin.clearcache': {
				"title": "キャッシュを消去",
				"parent": "admin.config",
				"content": <ClearCache />,
			},
			'admin.config.maintenance': {
				"title": "メンテナンス",
				"parent": "admin.config",
				"content": <ConfigMaintenance />,
			},
		};

		function getCurrentRoute(parsedUrlPX){
			let currentRoute = {};
			if(route[parsedUrlPX] ){
				currentRoute = route[parsedUrlPX];
			}else{
				currentRoute = route["dashboard"];
			}
			return currentRoute;
		}
		const currentRoute = getCurrentRoute(parsedUrl.PX);

		// Initialize State
		this.state = {
			"route": route,
			"currentRoute": currentRoute,
			"title": currentRoute.title,
			"path": parsedUrl.path,
			"PX": parsedUrl.PX,
			"profileLoaded": false,
			"profile": null,
			"lbLoaded": false,
			"lb": null,
			"pageInfoLoaded": false,
			"pageInfo": null,
			"configLoaded": false,
			"config": null,
			"link": link,
			"cloverUtils": window.cloverUtils,
			"px2utils": window.px2utils,
			"setMainState": setMainState,
		};

		updateGlobalData();

		window.addEventListener('popstate', (event) => {
			const newState = parseUrl(location);
			newState.pageInfoLoaded = false;
			this.setState(newState);
			updateGlobalData();
		});
	}

	/**
	 * Renderer
	 */
	render() {
		let currentRoute = this.state.currentRoute;
		let current_path = this.state.px2utils.trimContRoot(this.state.px2utils.href(this.state.path));

		return (
			<MainContext.Provider value={this.state}>
				{<Root
					title={currentRoute.title}
					contents={currentRoute.content}
					path={current_path}
					PX={this.state.PX}
					/>}
			</MainContext.Provider>
		);
	}
}

const app = document.getElementById('cont-app');
ReactDOM.render(<Layout/>, app);
