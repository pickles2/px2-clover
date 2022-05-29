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
	function loadSitemapFileList( callback ){
		callback = callback || function(){};
		let tmpSitemapFileList = sitemapFileList;
		$.ajax({
			"url": "?PX=px2dthelper.sitemap.filelist",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('Error:', error);
				alert('Loading Error');
			},
			"success": function(data){
				if( !data.result ){
					alert('Loading Error');
					return;
				}
				tmpSitemapFileList = data;
			},
			"complete": function(){
				setSitemapFileList(tmpSitemapFileList);
				callback( tmpSitemapFileList );
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
			if (this.status !== 200) {
				alert('Failed to download.');
				return;
			}
			var url = window.URL.createObjectURL(new Blob([this.response]));
			var link = document.createElement('a');
			link.href = url;
			link.setAttribute('download', origFileName);
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
			return;
		}
		xhr.send(new URLSearchParams({
			'filefullname': origFileName,
			'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
		}).toString());
	}

	/**
	 * アップロードダイアログを開く
	 */
	function openUploadSitemapFileDialog(){
		var template = require('./Sitemap_files/templates/upload.twig');
		var $body = $('<div>')
			.append( template( {
				"csrf_token": window.csrf_token,
			} ) )
		;
		const modal = px2style.modal({
			"title": "サイトマップファイルをアップロード",
			"body": $body,
			'buttons':[
				$('<button type="button" class="px2-btn px2-btn--primary">')
					.text('アップロードする')
					.on('click', function(e){
						e.preventDefault();
						uploadSitemapFile( $body.find('form').get(0) );
						px2style.closeModal();
					})
			],
			'buttonsSecondary': [
				$('<button type="button" class="px2-btn">')
					.text('キャンセル')
					.on('click', function(){
						px2style.closeModal();
					}),
			],
		});
	}

	/**
	 * サイトマップファイルをアップロードする
	 * @param {*} form 
	 */
	function uploadSitemapFile( form ){
		const formdata = new FormData(form);

		var xhr = new XMLHttpRequest();
		xhr.open(
			'POST',
			'?PX=px2dthelper.sitemap.upload'
		);
		xhr.upload.addEventListener('loadend', (evt) => {
			loadSitemapFileList( (loadedData) => {
				main.setMainState({
					"pageInfoLoaded": false,
				});
				alert('Upload: done.');

				main.cloverUtils.autoCommit();
				main.link('?PX=admin.sitemap');
			} );
		});
		xhr.send(formdata);
	}

	/**
	 * サイトマップファイルを削除する
	 * @param {*} origFileName 
	 */
	function deleteSitemapFile( origFileName ){
		if( !confirm( 'Delete file "' + origFileName + '.*" ?' ) ){
			return;
		}

		$.ajax({
			"url": "?PX=px2dthelper.sitemap.delete",
			"method": "post",
			"data": {
				'filename': origFileName,
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('Error:', error);
				alert('Failed to Delete file.');
			},
			"success": function(data){
				if( !data.result ){
					alert('Failed to Delete file.');
				}
			},
			"complete": function(){
				main.cloverUtils.autoCommit();
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
			<p><button type="button" className="px2-btn" onClick={openUploadSitemapFileDialog}>アップロード</button></p>
		</>
	);
});
