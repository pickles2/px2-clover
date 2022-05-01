import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import $ from 'jquery';

export default React.memo(function Sitemap(props){

	const main = useContext(MainContext);
	const [sitemapFileList, setSitemapFileList] = useState(false);

	if( !sitemapFileList ){
		let tmpSitemapFileList;
		$.ajax({
			"url": "?PX=px2dthelper.sitemap.filelist",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('------ admin.api.get_page_info Response Error:', typeof(error), error);
				tmpSitemapFileList = error;
			},
			"success": function(data){
				console.log('------ admin.api.get_page_info Response:', typeof(data), data);
				tmpSitemapFileList = data;
			},
			"complete": function(){
				setSitemapFileList(tmpSitemapFileList);
			},
		});
	}

	/**
	 * サイトマップファイルをダウンロードする
	 * @param {*} origFileName 
	 */
	function downloadSitemapFile( origFileName ){
		var xhr = new XMLHttpRequest();
		xhr.open(
			'POST',
			'?PX=px2dthelper.sitemap.download'
		);
		xhr.setRequestHeader( "Content-type", 'application/x-www-form-urlencoded');
		xhr.setRequestHeader( "Cookie", document.cookie);
		xhr.responseType = 'blob';
		xhr.onload = function(e) {
			if (this.status == 200) {
				console.log(this.response);
				var url = window.URL.createObjectURL(new Blob([this.response]));
				var link = document.createElement('a');
				link.href = url;
				link.setAttribute('download', origFileName);
				document.body.appendChild(link);
				link.click();
				document.body.removeChild(link);
				return;
			}
		}
		xhr.send(new URLSearchParams({
			'filefullname': origFileName,
			'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
		}).toString());
	}

	/**
	 * サイトマップファイルをアップロードする
	 * @param {*} origFileName 
	 */
	function uploadSitemapFile( origFileName ){
		// TODO: 実装する
		alert(origFileName);
		$.ajax({
			"url": "?PX=px2dthelper.sitemap.upload",
			"method": "post",
			"data": {
				'filefullname': origFileName,
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('------ admin.api.get_page_info Response Error:', typeof(error), error);
			},
			"success": function(data){
				console.log('------ admin.api.get_page_info Response:', typeof(data), data);
			},
			"complete": function(){
				alert('done');
			},
		});
	}

	return (
		<>
			{(!sitemapFileList)
				?<>
					<p>...</p>
				</>
			:<>{(sitemapFileList.list)
				?<>
				<div>
					<ul>
						{Object.keys(sitemapFileList.list).map( ( sitemapFileName, idx )=>{
							return (
								<li key={idx}>
									{sitemapFileName}
									<ul>
									{sitemapFileList.list[sitemapFileName].map( ( sitemapFileNameExt, idx )=>{
										return (
											<li key={sitemapFileNameExt}>
												{sitemapFileNameExt} <a href="#" onClick={(e)=>{
													e.preventDefault();
													downloadSitemapFile(sitemapFileName+'.'+sitemapFileNameExt);
												}}>download</a>
											</li>
										)
									} )}
									</ul>
								</li>
							)
						} )}
					</ul>
				</div>
				</>
				:<>
				</>
			}</>
			}
			{/* <div>{main.PX}</div>
			<p><Link href="?PX=admin.config">Config</Link></p>
			<p><Link href="?PX=admin">Dashboard</Link></p> */}
		</>
	);
});
