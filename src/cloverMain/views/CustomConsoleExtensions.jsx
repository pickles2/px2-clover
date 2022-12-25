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

	return (
		<>
			{(customConsoleExtensionsList === null
				?
					<>...</>
				:
					<>
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
			)}
		</>
	);
}
