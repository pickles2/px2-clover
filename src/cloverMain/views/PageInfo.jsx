import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import iterate79 from 'iterate79';

export default function PageInfo(props){

	const main = useContext(MainContext);
	const pageFieldLogicalName = {
		"path": "ページのパス",
		"content": "コンテンツファイルの格納先",
		"id": "ページID",
		"title": "ページタイトル",
		"title_breadcrumb": "ページタイトル(パン屑表示用)",
		"title_h1": "ページタイトル(H1表示用)",
		"title_label": "ページタイトル(リンク表示用)",
		"title_full": "ページタイトル(タイトルタグ用)",
		"logical_path": "論理構造上のパス",
		"list_flg": "一覧表示フラグ",
		"layout": "レイアウト",
		"orderby": "表示順",
		"keywords": "metaキーワード",
		"description": "metaディスクリプション",
		"category_top_flg": "カテゴリトップフラグ",
		"role": "ロール",
		"proc_type": "コンテンツの処理方法",

		"**delete_flg": "(削除フラグ)",
	};


	/**
	 * 新規ページ情報を追加する
	 */
	function createNewPage(e){
		e.preventDefault();
		var pageInfoRaw = {};
		var modal;
		iterate79.fnc({}, [
			(it1) => {
				var params = {
					'filefullname': main.pageInfo.originated_csv.basename,
					'row': main.pageInfo.originated_csv.row,
				};
				main.px2utils.px2cmd(
					'/?PX=px2dthelper.page.get_page_info_raw',
					params,
					function( res ){
						if( !res.result ){
							alert( 'Error: ' + res.message );
							console.error('Error:', res);
							return;
						}
						pageInfoRaw = res;
						it1.next();
					}
				);
			},
			(it1) => {
				var page_info = {};
				for( var idx = 0; pageInfoRaw.page_info.length > idx; idx ++ ){
					page_info[pageInfoRaw.sitemap_definition[idx]] = pageInfoRaw.page_info[idx];
				}

				var template = require('./PageInfo_files/template/editPage.twig');
				var $body = $('<div>')
					.append( template( {
						"page_info": page_info,
						"pageFieldLogicalName": pageFieldLogicalName,
					} ) )
				;
				modal = px2style.modal({
					'title': "ページ情報を追加する",
					'body': $body,
					'width': '680px',
					'buttons':[
						$('<button type="submit" class="px2-btn px2-btn--primary">')
							.text('保存する')
					],
					'buttonsSecondary': [
						$('<button type="button" class="px2-btn">')
							.text('キャンセル')
							.on('click', function(){
								px2style.closeModal();
							}),
					],
					'form': {
						'action': 'javascript:;',
						'method': 'post',
						'submit': function(e){
							e.preventDefault();
							modal.lock();

							var $inputs = modal.$modal.find('form input');
							var new_page_info = {};
							$inputs.each((idx, elm)=>{
								var $elm = $(elm);
								new_page_info[$elm.attr('name')] = $elm.val();
							});

							var params = {
								'filefullname': main.pageInfo.originated_csv.basename,
								'row': (main.pageInfo.originated_csv.row + 1),
								'page_info': new_page_info,
							};
							main.px2utils.px2cmd(
								'/?PX=px2dthelper.page.add_page_info_raw',
								params,
								function( res ){
									if( !res.result ){
										alert( 'Error: ' + res.message );
										console.error('Error:', res);
										return;
									}
									main.setMainState({
										"pageInfoLoaded": false,
									});
									modal.unlock();
									px2style.closeModal();
									main.link('?PX=admin.page_info');
								}
							);
						}
					},
				});
				it1.next();
			},
		]);
	}

	/**
	 * カレントページ情報を更新する
	 */
	function editPage(e){
		e.preventDefault();
		var pageInfoRaw = {};
		var modal;
		iterate79.fnc({}, [
			(it1) => {
				var params = {
					'filefullname': main.pageInfo.originated_csv.basename,
					'row': main.pageInfo.originated_csv.row,
				};
				main.px2utils.px2cmd(
					'/?PX=px2dthelper.page.get_page_info_raw',
					params,
					function( res ){
						if( !res.result ){
							alert( 'Error: ' + res.message );
							console.error('Error:', res);
							return;
						}
						pageInfoRaw = res;
						it1.next();
					}
				);
			},
			(it1) => {
				var page_info = {};
				for( var idx = 0; pageInfoRaw.page_info.length > idx; idx ++ ){
					page_info[pageInfoRaw.sitemap_definition[idx]] = pageInfoRaw.page_info[idx];
				}

				var template = require('./PageInfo_files/template/editPage.twig');
				var $body = $('<div>')
					.append( template( {
						"page_info": page_info,
						"pageFieldLogicalName": pageFieldLogicalName,
					} ) )
				;
				modal = px2style.modal({
					'title': "ページ情報を編集する",
					'body': $body,
					'width': '680px',
					'buttons':[
						$('<button type="submit" class="px2-btn px2-btn--primary">')
							.text('保存する')
					],
					'buttonsSecondary': [
						$('<button type="button" class="px2-btn">')
							.text('キャンセル')
							.on('click', function(){
								px2style.closeModal();
							}),
					],
					'form': {
						'action': 'javascript:;',
						'method': 'post',
						'submit': function(e){
							e.preventDefault();
							modal.lock();

							var $inputs = modal.$modal.find('form input');
							var new_page_info = {};
							$inputs.each((idx, elm)=>{
								var $elm = $(elm);
								new_page_info[$elm.attr('name')] = $elm.val();
							});

							var params = {
								'filefullname': main.pageInfo.originated_csv.basename,
								'row': main.pageInfo.originated_csv.row,
								'page_info': new_page_info,
							};
							main.px2utils.px2cmd(
								'/?PX=px2dthelper.page.update_page_info_raw',
								params,
								function( res ){
									if( !res.result ){
										alert( 'Error: ' + res.message );
										console.error('Error:', res);
										return;
									}
									main.setMainState({
										"pageInfoLoaded": false,
									});
									modal.unlock();
									px2style.closeModal();
									main.link('?PX=admin.page_info');
								}
							);
						}
					},
				});
				it1.next();
			},
		]);
	}

	/**
	 * ページを削除する
	 */
	function deletePage(e){
		e.preventDefault();
		var pageInfoRaw = {};
		var modal;
		iterate79.fnc({}, [
			(it1) => {
				var params = {
					'filefullname': main.pageInfo.originated_csv.basename,
					'row': main.pageInfo.originated_csv.row,
				};
				main.px2utils.px2cmd(
					'/?PX=px2dthelper.page.get_page_info_raw',
					params,
					function( res ){
						if( !res.result ){
							alert( 'Error: ' + res.message );
							console.error('Error:', res);
							return;
						}
						pageInfoRaw = res;
						it1.next();
					}
				);
			},
			(it1) => {
				var page_info = {};
				for( var idx = 0; pageInfoRaw.page_info.length > idx; idx ++ ){
					page_info[pageInfoRaw.sitemap_definition[idx]] = pageInfoRaw.page_info[idx];
				}

				var template = require('./PageInfo_files/template/deletePage.twig');
				var $body = $('<div>')
					.append( template( {
					} ) )
				;
				modal = px2style.modal({
					'title': "ページ情報を削除する",
					'body': $body,
					'buttons':[
						$('<button type="submit" class="px2-btn px2-btn--danger">')
							.text('削除する')
					],
					'buttonsSecondary': [
						$('<button type="button" class="px2-btn">')
							.text('キャンセル')
							.on('click', function(){
								px2style.closeModal();
							}),
					],
					'form': {
						'action': 'javascript:;',
						'method': 'post',
						'submit': function(e){
							e.preventDefault();

							var params = {
								'filefullname': main.pageInfo.originated_csv.basename,
								'row': main.pageInfo.originated_csv.row,
							};
							main.px2utils.px2cmd(
								'/?PX=px2dthelper.page.delete_page_info_raw',
								params,
								function( res ){
									if( !res.result ){
										alert( 'Error: ' + res.message );
										console.error('Error:', res);
										return;
									}
									main.setMainState({
										"pageInfoLoaded": false,
									});
									px2style.closeModal();
									main.link('/?PX=admin.page_info');
								}
							);
						}
					},
				});
				it1.next();
			},
		]);
	}


	return (
		<>
			{(main.pageInfo === null)
				?<>
					<p>...</p>
				</>

			:<>{(main.pageInfo.current_page_info)
				?<>
					<div className="cont-menubar">
						<ul>
							<li><a href="?" onClick={editPage}>ページ情報を編集する</a></li>
							<li><a href="?" onClick={createNewPage}>ページ情報を追加する</a></li>
							<li><a href="?PX=admin.edit_contents">コンテンツを編集する</a></li>
							<li><a href="?">プレビューに戻る</a></li>
						</ul>
					</div>
					{(main.pageInfo !== null && typeof(main.pageInfo.breadcrumb) === typeof([]) && (
						<div className="cont-layout-breadcrumb">
							<ul>
							{main.pageInfo.breadcrumb.map( ( breadcrumb_info )=>{
								return (
									<li key={breadcrumb_info.id}><Link href={main.px2utils.href(breadcrumb_info.path + "?PX=admin.page_info")}>{breadcrumb_info.title}</Link></li>
								)
							} )}
							<li>{main.pageInfo.current_page_info.title}</li>
							</ul>
						</div>
					))}
					<div className="cont-layout">
						{(typeof(main.pageInfo.current_page_info) === typeof({}) && (<>
							<div className="cont-layout__main">
								<table className="px2-table" style={{width:'100%',}}>
									<colgroup>
										<col style={{width: "30%"}} />
										<col style={{width: "70%"}} />
									</colgroup>
									<tbody>
										<tr><th>{pageFieldLogicalName['id']}</th><td>{main.pageInfo.current_page_info.id}</td></tr>
										<tr><th>{pageFieldLogicalName['title']}</th><td><Link href={main.px2utils.href(main.pageInfo.current_page_info.path + "?PX=admin.page_info")}>{main.pageInfo.current_page_info.title}</Link></td></tr>
										<tr><th>{pageFieldLogicalName['path']}</th><td>{main.pageInfo.current_page_info.path}</td></tr>
										{Object.keys(main.pageInfo.current_page_info).map( ( key, idx )=>{
											if( ['id','title','path'].find(val => val==key) ){return;}
											return (
												<tr key={idx}>
													<th>{pageFieldLogicalName[key] || key}</th>
													<td>{main.pageInfo.current_page_info[key]}</td>
												</tr>
											)
										} )}
									</tbody>
								</table>
							</div>

							<nav className="cont-layout__right-navibar">
								<div className="cont-pagenavi">
									{(main.pageInfo !== null && typeof(main.pageInfo.parent) === typeof({}) && (<>
										<div className="cont-pagenavi__parent"><Link href={main.px2utils.href(main.pageInfo.parent.path + "?PX=admin.page_info")}>{main.pageInfo.parent.title}</Link></div>
									</>))}
									{(main.pageInfo !== null && typeof(main.pageInfo.bros) === typeof([]) && (<>
										<ul>
										{main.pageInfo.bros.map( ( bros_page_info )=>{
											return (
												<li key={bros_page_info.id} className={(bros_page_info.id == main.pageInfo.current_page_info.id ? "cont-pagenavi__current" : "")}><Link href={main.px2utils.href(bros_page_info.path + "?PX=admin.page_info")}>{bros_page_info.title}</Link>
													{(main.px2utils.href(bros_page_info.path) == main.px2utils.href(props.path) && (<>
														<ul>
														{main.pageInfo.children.map( ( child_page_info )=>{
															return (
																<li key={child_page_info.id}><Link href={main.px2utils.href(child_page_info.path + "?PX=admin.page_info")}>{child_page_info.title}</Link></li>
															)
														} )}
														</ul>
													</>)
													)}
												</li>
											)
										} )}
										</ul>
									</>))}
								</div>
							</nav>
						</>))}
					</div>
					{(typeof(main.pageInfo.current_page_info) === typeof({}) && (<>
						<div className="px2-p">
							<table className="px2-table" style={{width:'100%',}}>
								<colgroup>
									<col style={{width: "30%"}} />
									<col style={{width: "70%"}} />
								</colgroup>
								<tbody>
									<tr><th>Originated CSV</th><td>{main.pageInfo.originated_csv.basename}</td></tr>
									<tr><th>Originated CSV row</th><td>{main.pageInfo.originated_csv.row}</td></tr>
								</tbody>
							</table>
						</div>
					</>))}
					{(typeof(main.pageInfo.current_page_info) === typeof({}) && !!main.pageInfo.current_page_info.id.length && (<>
						<p className="px2-text-align-center"><button type="button" onClick={deletePage} className="px2-btn px2-btn--danger">このページを削除する</button></p>
					</>))}
				</>
			:<>
				<p>このページは存在しません。</p>
			</>}
			</>}
		</>
	);
}
