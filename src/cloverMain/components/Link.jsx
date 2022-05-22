import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';

export default function Link(props){

	const main = useContext(MainContext);

	const className = (() => {
		if( props.className ){
			return props.className;
		}

		function parseUrl(url){
			const tmpA = document.createElement('a');
			tmpA.href = url;
			const parsedUrl = new URL(tmpA.href);
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

		let parsedUrl = parseUrl(props.href);
		let splitedMainPX = main.PX.split('.');
		let splitedPropsPX = parsedUrl.PX.split('.');
		let isMissmatch = false;
		for( let idx in splitedPropsPX ){
			if( splitedMainPX[idx] != splitedPropsPX[idx] ){
				isMissmatch = true;
			}
		}
		if( !isMissmatch ){
			return 'current';
		}
		return null;
	})();

	function goto(e){
		e.preventDefault();
		main.link(e.target.href);
		return false;
	}

	return (
		<a href={props.href} onClick={goto} className={className}>{props.children}</a>
	);
}
