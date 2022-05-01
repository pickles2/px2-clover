import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function Sitemap(props){

	const main = useContext(MainContext);
	const [sitemapFileList, setSitemapFileList] = useState(false);

	if( !sitemapFileList ){
		loadSitemapFileList();
	}

	/**
	 * サイトマップファイルの一覧を更新する
	 */
	function loadSitemapFileList(){
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
	 * @param {*} form 
	 */
	function uploadSitemapFile( form ){
		const formdata = new FormData(form);
		// console.log(formdata, form);

		var xhr = new XMLHttpRequest();
		xhr.open(
			'POST',
			'?PX=px2dthelper.sitemap.upload'
		);
		xhr.upload.addEventListener('loadend', (evt) => {
			loadSitemapFileList();
		});
		xhr.send(formdata);
	}

	/**
	 * サイトマップファイルを削除する
	 * @param {*} origFileName 
	 */
	function deleteSitemapFile( origFileName ){
		$.ajax({
			"url": "?PX=px2dthelper.sitemap.delete",
			"method": "post",
			"data": {
				'filename': origFileName,
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('------ px2dthelper.sitemap.delete Response Error:', typeof(error), error);
			},
			"success": function(data){
				console.log('------ px2dthelper.sitemap.delete Response:', typeof(data), data);
			},
			"complete": function(){
				loadSitemapFileList();
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
									<ul>
										<li><a href="#" onClick={(e)=>{e.preventDefault();deleteSitemapFile(sitemapFileName);}}>delete</a></li>
									</ul>
								</li>
							)
						} )}
					</ul>
				</div>
				</>
				:<>
				</>
			}</>}
			<hr />
			<div>
				<form action="?PX=px2dthelper.sitemap.upload" method="post" encType="multipart/form-data" onSubmit={function(e){
					e.preventDefault();
					uploadSitemapFile(e.target);
				}}>
					<div>filename: <input type="input" name="filefullname" defaultValue="" /></div>
					<div>file: <input type="file" name="file" defaultValue="" /></div>
					<button type="submit" className="px2-btn px2-btn--primary">アップロード</button>
					<input type="hidden" name="ADMIN_USER_CSRF_TOKEN" defaultValue={window.csrf_token} />
				</form>
			</div>
		</>
	);
});
