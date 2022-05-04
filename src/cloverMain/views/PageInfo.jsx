import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import iterate79 from 'iterate79';

export default function PageInfo(props){

	const main = useContext(MainContext);

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
						console.log( pageInfoRaw );
						it1.next();
					}
				);
			},
			(it1) => {
				var page_info = {};
				for( var idx = 0; pageInfoRaw.page_info.length > idx; idx ++ ){
					page_info[pageInfoRaw.sitemap_definition[idx]] = pageInfoRaw.page_info[idx];
				}

				var template = require('./PageInfo.files/template/editPage.twig');
				var $body = $('<div>')
					.append( template( {
						"page_info": page_info,
					} ) )
				;
				modal = px2style.modal({
					'title': "ページ情報を編集する",
					'body': $body,
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

							// TODO: ページ情報の更新処理
							setTimeout(()=>{
								px2style.closeModal();
								modal.unlock();
							}, 1000);
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
					<ul>
						<li><a href="?" onClick={editPage}>ページ情報を編集する</a></li>
						<li><a href="?PX=admin.edit_contents">コンテンツを編集する</a></li>
						<li><a href="?">プレビューに戻る</a></li>
					</ul>
					{(main.pageInfo !== null && typeof(main.pageInfo.breadcrumb) === typeof([]) && (
						<div className="theme-layout__breadcrumb">
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
					{(typeof(main.pageInfo.current_page_info) === typeof({}) && (<>
						<div className="px2-p">
							<table className="px2-table" style={{width:'100%',}}>
								<tbody>
									<tr><th>id</th><td>{main.pageInfo.current_page_info.id}</td></tr>
									<tr><th>title</th><td><Link href={main.px2utils.href(main.pageInfo.current_page_info.path + "?PX=admin.page_info")}>{main.pageInfo.current_page_info.title}</Link></td></tr>
									<tr><th>path</th><td>{main.pageInfo.current_page_info.path}</td></tr>
									{Object.keys(main.pageInfo.current_page_info).map( ( value, idx )=>{
										if( ['id','title','path'].find(val => val==value) ){return;}
										return (
											<tr key={idx}>
												<th>{value}</th>
												<td>{main.pageInfo.current_page_info[value]}</td>
											</tr>
										)
									} )}
								</tbody>
							</table>
						</div>
						<div className="px2-p">
							<table className="px2-table" style={{width:'100%',}}>
								<tbody>
									<tr><th>Originated CSV</th><td>{main.pageInfo.originated_csv.basename}</td></tr>
									<tr><th>Originated CSV row</th><td>{main.pageInfo.originated_csv.row}</td></tr>
								</tbody>
							</table>
						</div>
					</>))}
				</>
			:<>
				<p>このページは存在しません。</p>
			</>}
			</>}
		</>
	);
}
