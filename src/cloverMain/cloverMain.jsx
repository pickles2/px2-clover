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
import Blog from './views/Blog';
import PageInfo from './views/PageInfo';
import Theme from './views/Theme';
import Modules from './views/Modules';
import Publish from './views/Publish';
import History from './views/History';
import FilesAndFolders from './views/FilesAndFolders';
import FindUnassignedContents from './views/FindUnassignedContents';
import CustomConsoleExtensions from './views/CustomConsoleExtensions';
import iterate79 from 'iterate79';
import LangBank from 'langbank';

const languageCsv = require('../../data/lang/language.csv');

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
			if( searchString ){
				let keyVals = searchString.split('&');
				for( let idx in keyVals ){
					let [key, val] = keyVals[idx].split('=');
					getParams[key] = val;
				}
			}
			pathname = pathname.replace(window.px2config.path_controot, '/');
			let newState = {
				path: pathname,
				PX: getParams.PX,
			};
			return newState;
		}
		const updateGlobalData = ( newState, callback )=>{
			newState = {
				...this.state,
				...(newState || {})
			};
			callback = callback || function(){};

			iterate79.fnc({}, [
				(it1) => {
					if( newState.bootupInfoLoaded && newState.profileLoaded && newState.lbLoaded && newState.pageInfoLoaded && newState.configLoaded ){
						this.setState( newState );
						callback();
						return;
					}
					it1.next();
				},
				(it1) => {
					px2style.loading();
					it1.next();
				},
				(it1) => {
					if( newState.bootupInfoLoaded ){
						it1.next();
						return;
					}
					newState.cloverUtils.getBootupInformations((data)=>{
						newState.bootupInfo = data.bootupInfo;
						newState.bootupInfoLoaded = true;
						it1.next();
					});
				},
				(it1) => {
					if( newState.profileLoaded ){
						it1.next();
						return;
					}
					newState.cloverUtils.getProfile((data)=>{
						newState.profile = data.profile;
						newState.profileLoaded = true;
						it1.next();
					});
				},
				(it1) => {
					if( newState.lbLoaded ){
						it1.next();
						return;
					}
					const lb = new LangBank(languageCsv, ()=>{
						const lang = ( newState.profile && newState.profile.lang ? newState.profile.lang : "ja");
						lb.setLang( lang );
						newState.cloverUtils.setLang( lang );
						newState.lb = lb;
						newState.lbLoaded = true;
						it1.next();
					});
				},
				(it1) => {
					if( newState.configLoaded ){
						it1.next();
						return;
					}
					newState.cloverUtils.getConfig((data)=>{
						newState.config = data.config;
						newState.configLoaded = true;
						it1.next();
					});
				},
				(it1) => {
					if( newState.pxConfigLoaded ){
						it1.next();
						return;
					}
					window.px2utils.px2cmd(
						'/?PX=api.get.config',
						{},
						function( res ){
							if( !res ){
								console.error('Error: PX Config:', res);
							}
							newState.pxConfig = res;
							newState.pxConfigLoaded = true;
							it1.next();
						}
					);
				},
				(it1) => {
					if( newState.pageInfoLoaded ){
						it1.next();
						return;
					}
					newState.px2utils.getCurrentPageInfo((data)=>{
						newState.pageInfo = data;
						newState.pageInfoLoaded = true;
						it1.next();
					});
				},
				(it1) => {
					newState.currentRoute = getCurrentRoute(newState.PX);
					newState.title = newState.currentRoute.title;

					if( newState.lb && newState.currentRoute.langKey ){
						newState.title = newState.lb.get(newState.currentRoute.langKey);
					}else if( newState.lb && newState.currentRoute.langKey ){
						newState.title = newState.lb.get(newState.currentRoute.langKey);
					}

					if( newState.PX == "admin.page_info" && newState.pageInfo ){
						// PageInfo 画面にて、routeのタイトルをページのタイトルで置き換える
						let currentTitle = newState.title;
						if( currentTitle != newState.pageInfo.current_page_info.title ){
							currentTitle = newState.pageInfo.current_page_info.title;
							newState.title = currentTitle;
						}
					}
					it1.next();
					return;
				},
				(it1) => {
					px2style.closeLoading();
					this.setState( newState );
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
			updateGlobalData(newState, ()=>{
				window.scrollTo(0,0);
			});
			$('.theme-layout__main').animate({scrollTop: 0}, 'fast');
		};

		const parsedUrl = parseUrl(location);
		const route = {
			'admin': {
				"title": "ダッシュボード",
				"langKey": "page_title.dashboard",
				"content": <Dashboard />,
			},
			'admin.page_info': {
				"title": "ページ",
				"langKey": "page_title.page_info",
				"content": <PageInfo />,
			},
			'admin.blog': {
				"title": "ブログ",
				"langKey": "page_title.blog",
				"content": <Blog />,
			},
			'admin.theme': {
				"title": "テーマ",
				"langKey": "page_title.theme",
				"content": <Theme />,
			},
			'admin.publish': {
				"title": "パブリッシュ",
				"langKey": "page_title.publish",
				"content": <Publish />,
			},
			'admin.history': {
				"title": "編集履歴",
				"langKey": "page_title.history",
				"content": <History />,
			},
			'admin.config': {
				"title": "設定",
				"langKey": "page_title.config",
				"content": <Config />,
			},
			'admin.config.profile': {
				"title": "プロフィール設定",
				"langKey": "page_title.config_profile",
				"parent": "admin.config",
				"content": <ConfigProfile />,
			},
			'admin.config.members': {
				"title": "メンバー一覧",
				"langKey": "page_title.config_members",
				"parent": "admin.config",
				"content": <ConfigMembers />,
			},
			'admin.config.history': {
				"title": "履歴管理設定",
				"langKey": "page_title.config_history",
				"parent": "admin.config",
				"content": <ConfigHistory />,
			},
			'admin.config.scheduler': {
				"title": "タスクスケジュール設定",
				"langKey": "page_title.config_scheduler",
				"parent": "admin.config",
				"content": <ConfigScheduler />,
			},
			'admin.config.files_and_folders': {
				"title": "ファイルを操作",
				"langKey": "page_title.config_files_and_folders",
				"parent": "admin.config",
				"content": <FilesAndFolders />,
			},
			'admin.config.find_unassigned_contents': {
				"title": "未アサインコンテンツ検索",
				"langKey": "page_title.config_find_unassigned_contents",
				"parent": "admin.config",
				"content": <FindUnassignedContents />,
			},
			'admin.sitemap': {
				"title": "サイトマップ",
				"langKey": "page_title.sitemap",
				"parent": "admin.config",
				"content": <Sitemap />,
			},
			'admin.modules': {
				"title": "モジュール",
				"langKey": "page_title.modules",
				"parent": "admin.config",
				"content": <Modules />,
			},
			'admin.clearcache': {
				"title": "キャッシュを消去",
				"langKey": "page_title.clearcache",
				"parent": "admin.config",
				"content": <ClearCache />,
			},
			'admin.config.maintenance': {
				"title": "メンテナンス",
				"langKey": "page_title.config_maintenance",
				"parent": "admin.config",
				"content": <ConfigMaintenance />,
			},
			'admin.cce': {
				"title": "拡張機能",
				"langKey": "page_title.cce",
				"parent": "admin.config",
				"content": <CustomConsoleExtensions />,
			},
		};

		function getCurrentRoute(parsedUrlPX){
			if( !parsedUrlPX ){
				return {
					"title": "---",
					"current": null,
					"langKey": null,
					"parent": null,
					"content": null,
				};
			}
			let aryParsedUrlPX = parsedUrlPX.split(/\./);
			let currentRoute = {};
			while( true ){
				if( aryParsedUrlPX.length < 1 ){
					break;
				}
				parsedUrlPX = aryParsedUrlPX.join('.');
				if( route[parsedUrlPX] ){
					break;
				}
				aryParsedUrlPX.pop();
			}

			if(route[parsedUrlPX] ){
				currentRoute = {
					...route[parsedUrlPX],
					"current": parsedUrlPX,
				};
			}else{
				currentRoute = {
					...route["dashboard"],
					"current": "dashboard",
				};
			}
			return currentRoute;
		}
		const currentRoute = getCurrentRoute(parsedUrl.PX);

		// Initialize State
		this.state = {
			"bootupInfoLoaded": false,
			"bootupInfo": null,
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
			"pxConfigLoaded": false,
			"pxConfig": null,
			"link": link,
			"cloverUtils": window.cloverUtils,
			"px2utils": window.px2utils,
			"getCurrentRoute": getCurrentRoute,
			"setMainState": setMainState,
		};

		updateGlobalData({});

		window.addEventListener('popstate', (event) => {
			const newState = parseUrl(location);
			newState.pageInfoLoaded = false;
			updateGlobalData(newState);
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
