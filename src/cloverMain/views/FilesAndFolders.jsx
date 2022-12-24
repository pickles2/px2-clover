import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function FilesAndFolders(props){

	const main = useContext(MainContext);

	useEffect(() => {
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

	return (
		<>
			<div id="cont-remote-finder-content">
				...
			</div>
		</>
	);
}
