import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function CustomConsoleExtensions(props){

	const main = useContext(MainContext);
	const [customConsoleExtensionsList, setCustomConsoleExtensionsList] = useState(null);

	useEffect(() => {
		main.px2utils.px2cmd(
			'/?PX=px2dthelper.custom_console_extensions',
			{},
			function( res ){
				console.log('-- CCE:', res);
				if( !res.result ){
					console.error('Error:', res);
				}
				setCustomConsoleExtensionsList(res);
			}
		);
	}, []);

	const currentCceId = (function(){
		let pxcAry = main.PX.split('.');
		console.log('=-=-=-= main.PX', main.PX);
		if( pxcAry.length > 2 ){
			return pxcAry[2];
		}
		return null;
	})();

	const currentCce = (()=>{
		if( customConsoleExtensionsList === null ){
			return null;
		}
		if( typeof(currentCceId) !== typeof('string') ){
			return null;
		}
		return customConsoleExtensionsList.list[currentCceId];
	})();

	return (
		<>
			{(customConsoleExtensionsList === null)
				? <>
					...
				</>
				: <>
					{currentCceId === null
						? <>
							<div className="px2-linklist">
								<ul>
									{(Object.keys(customConsoleExtensionsList.list).map((cceKey, index) => {
										const listItem = customConsoleExtensionsList.list[cceKey];
										return <li key={index}>
											<Link href={`?PX=admin.cce.${listItem.id}`}>{ listItem.label }</Link>
										</li>;
									}))}
								</ul>
							</div>
							<div className="px2-p">
								<Link href="?PX=admin.config">戻る</Link>
							</div>
						</>
						: <>
							<p>{currentCce.label}</p>
							<div className="cont-custom-console-extensions-main"></div>
							<div className="px2-p">
								<Link href="?PX=admin.cce">戻る</Link>
							</div>
						</>
					}
				</>
			}
		</>
	);
}
