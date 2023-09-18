import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function FilesAndFolders(props){

	const main = useContext(MainContext);

	const isFilesAndFoldersAuthorized = (main.bootupInfoLoaded && main.bootupInfo.authorization.write_file_directly && main.bootupInfo.authorization.server_side_scripting);

	useEffect(() => {
		if(!isFilesAndFoldersAuthorized){
			return;
		}

		const $body = document.getElementById('cont-remote-finder-content');
		main.cloverUtils.openInFinder(
			'root',
			$body,
			'/',
			function(){
				$($body).css({"flex-grow":"100"});
			}
		);
	}, []);

	if( !isFilesAndFoldersAuthorized ){
		return (<p>権限がありません。</p>);
	}

	return (
		<>
			<div id="cont-remote-finder-content">
				...
			</div>
		</>
	);
}
