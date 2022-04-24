import React from "react";
import ReactDOM from "react-dom";
import {MainContext} from './context/MainContext';
import Root from "./layouts/Root";

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

		const setMainState = (val) => {
			this.setState((state) => val);
		};
		const link = (url) => {
			const pagePath = parseUrl(url);
			history.pushState({}, '', url);
			this.setState(pagePath);
		};
		const pagePath = parseUrl(location);

		// Initialize State
		this.state = {
			"path": pagePath.path,
			"PX": pagePath.PX,
			"link": link,
			"setMainState": setMainState,
		};

		console.log(this.state);

		window.addEventListener('popstate', (event) => {
			const pagePath = parseUrl(location);
			this.setState(pagePath);
		});
	}

	/**
	 * Renderer
	 */
	render() {
		return (
			<MainContext.Provider value={this.state}>
				<Root />
			</MainContext.Provider>
		);
	}
}

const app = document.getElementById('cont-app');
ReactDOM.render(<Layout/>, app);
