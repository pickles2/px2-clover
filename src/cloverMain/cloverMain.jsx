import React from "react";
import ReactDOM from "react-dom";
import {MainContext} from './context/MainContext';
import Root from "./layouts/Root";
import Config from './views/Config';
import ConfigProfile from './views/ConfigProfile';
import Sitemap from './views/Sitemap';
import PageInfo from './views/PageInfo';
import iterate79 from 'iterate79';
import CloverUtils from '../common/CloverUtils';
import Px2Utils from '../common/Px2Utils';

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
					if( this.state.pageInfoLoaded && this.state.profileLoaded ){
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
					px2style.closeLoading();
					this.state.setMainState( tmpNewState );
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
				var a = document.createElement('a');
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
		const cloverUtils = new CloverUtils();
		const px2utils = new Px2Utils();

		// Initialize State
		this.state = {
			"path": parsedUrl.path,
			"PX": parsedUrl.PX,
			"pageInfoLoaded": false,
			"pageInfo": null,
			"profileLoaded": false,
			"profile": null,
			"link": link,
			"cloverUtils": cloverUtils,
			"px2utils": px2utils,
			"setMainState": setMainState,
		};

		// console.log(this.state);


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
		let title = window.px2config.name;
		let content = {};
		let current_path = this.state.px2utils.trimContRoot(this.state.px2utils.href(this.state.path));

		switch( this.state.PX ){
			case 'admin.sitemap':
				title = "サイトマップ";
				content = <Sitemap />;
				break;
			case 'admin.config':
				title = "設定";
				content = <Config />;
				break;
			case 'admin.config.profile':
				title = "プロフィール設定";
				content = <ConfigProfile />;
				break;
			case 'admin.page_info':
				title = "ページ情報";
				content = <PageInfo path={current_path} PX={this.state.PX} />;
				break;
			case 'admin':
			default:
				title = "ダッシュボード";
				content = <PageInfo path={current_path} PX={this.state.PX} />;
				break;
		}
		return (
			<MainContext.Provider value={this.state}>
				{<Root
					title={title}
					contents={content}
					path={current_path}
					PX={this.state.PX}
					/>}
			</MainContext.Provider>
		);
	}
}

const app = document.getElementById('cont-app');
ReactDOM.render(<Layout/>, app);
