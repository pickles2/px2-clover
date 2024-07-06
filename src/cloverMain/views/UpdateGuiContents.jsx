import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function UpdateGuiContents(props){

	const main = useContext(MainContext);
	const [guiEditorContentsList, setGuiEditorContentsList] = useState(null);

	/**
	 * 未アサインコンテンツの検索結果を取得する
	 */
	function getGuiEditorContentList(callback){
		callback = callback || function(){};
		px2style.loading();
		main.px2utils.px2cmd(
			"?PX=px2dthelper.get.list_gui_editor_contents",
			{},
			{},
			function(data, error){
				if( error ){
					px2style.modal({
						'title': 'エラー',
						'body': '<p>エラーが発生しました。</p>',
					});
				}else{
					px2style.modal({
						'title': '完了',
						'body': '<p>リストの抽出が完了しました。</p>',
					});
				}

				px2style.closeLoading();

				setGuiEditorContentsList(data.gui_editor_contents);

				callback();
			}
		);
	}

	/**
	 * GUIコンテンツを再構成する
	 */
	async function rebuildBroccoliContent( target_path ){
		return new Promise((resolve, reject)=>{
			px2style.loading();

			var options = {
				'api': 'broccoliBridge',
				'forBroccoli': {
					'api': 'updateContents',
					'options': {
						'lang': 'ja',
					},
				},
				'page_path': target_path,
			};

			function pathToRequestPath(path){
				const pattern = /\{(?:\*|\$)([a-zA-Z0-9\_\-]*)\}/;
				while( pattern.test(path) ){
					path = path.replace(pattern, '$1');
				}
				return path;
			}

			main.px2utils.base64_encode_async(JSON.stringify(options)).then(function(optionsBase64){
				main.px2utils.px2cmd(
					pathToRequestPath(target_path) + '?PX=px2dthelper.px2ce.gpi',
					{
						"appMode": "web",
						"data": optionsBase64,
					},
					function( res ){
						px2style.closeLoading();

						if( res !== true && !res.result ){
							console.error('Error:', res);
							alert("Error: " + res.message);
							reject();
							return;
						}
						resolve();
					}
				);
			});
		});
	}

	/**
	 * GUIコンテンツをすべて再構成する
	 */
	function rebuildAllBroccoliContent(){
		$('button[data-target-content]').trigger('click');
	}

	return (
		<>
			<div className="px2-p">
				<button className="px2-btn px2-btn--primary" onClick={(e)=>{
					$(e.target).attr({'disabled':'disabled'});
					getGuiEditorContentList(function(){
						$(e.target).removeAttr('disabled');
					});
				}}>ブロックエディタのコンテンツを検索する</button>
				{(guiEditorContentsList!==null
					?
					<>
						<button className="px2-btn px2-btn--primary" onClick={(e)=>{
							rebuildAllBroccoliContent();
						}}>すべて再構成</button>
					</>
					:
					<></>
				)}
			</div>
			{(guiEditorContentsList!==null
				?
				<>
					{(guiEditorContentsList.length
						?
						<>
							<table className="px2-table" style={{widht:"100%"}}>
								<tbody>
								{(guiEditorContentsList.map((guiEditorContent, idx)=>{
									return (
										<tr key={idx}>
											<th>{guiEditorContent}</th>
											<td><button type="button" data-target-content={guiEditorContent} onClick={(e)=>{
												e.preventDefault();
												e.target.disabled = true;
												var target_path = $(e.target).attr('data-target-content');
												target_path = target_path.replace(/(\.html?)(\.[a-zA-Z0-9]+)?$/, '$1');

												rebuildBroccoliContent(target_path)
													.then(()=>{
														e.target.disabled = false;
														$(e.target).addClass('px2-btn--primary');
													})
													.catch(()=>{
														alert('errored.');
														e.target.disabled = false;
														$(e.target).addClass('px2-btn--danger');
													});
											}} className="px2-btn">rebuild</button></td>
										</tr>
									);
								}))}
								</tbody>
							</table>
						</>
						:
						<>
							<p>ブロックエディタのコンテンツは検出されませんでした。</p>
						</>
					)}
				</>
				:
				<></>
			)}
		</>
	);
}
