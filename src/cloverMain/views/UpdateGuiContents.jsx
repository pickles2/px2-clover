import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import iterate79 from 'iterate79';
import Link from '../components/Link';

export default function UpdateGuiContents(props){

	const main = useContext(MainContext);
	const [status, setStatus] = useState({
		GuiEditorContentsList: null,
		ContentsRebuildStatus: {},
	});

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

				setStatus({
					...status,
					GuiEditorContentsList: data.gui_editor_contents,
				});

				callback();
			}
		);
	}

	/**
	 * GUIコンテンツを再構成する
	 */
	async function rebuildBroccoliContent( target_path ){
		status.ContentsRebuildStatus[target_path] = null;
		setStatus({
			...status,
		});

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

			main.px2utils.base64_encode_async(JSON.stringify(options))
				.then(function(optionsBase64){
					main.px2utils.px2cmd(
						main.px2utils.pagePathToRequestablePath(target_path) + '?PX=px2dthelper.px2ce.gpi',
						{
							"appMode": "web",
							"data": optionsBase64,
						},
						function( res ){
							px2style.closeLoading();

							if( res !== true && !res.result ){
								console.error('Error:', res);
								// alert("Error: " + res.message);
								status.ContentsRebuildStatus[target_path] = false;
								setStatus({
									...status,
								});
								reject();
								return;
							}
							status.ContentsRebuildStatus[target_path] = true;
							setStatus({
								...status,
							});
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
		// $('button[data-target-content]').trigger('click');
		iterate79.ary(
			status.GuiEditorContentsList,
			function(it, page_path, index){
				console.info(index, page_path);
				rebuildBroccoliContent(page_path)
					.finally(()=>{
console.log(status.ContentsRebuildStatus);
						setTimeout(()=>{
							it.next();
						}, 200);
					});
			},
			function(){
				alert('Completed.');
			}
		);
	}

	return (
		<>
			<div className="px2-p">
				<ul className="px2-horizontal-list">
					<li><button className={status.GuiEditorContentsList===null ? "px2-btn px2-btn--primary" : "px2-btn"} onClick={(e)=>{
						$(e.target).attr({'disabled':'disabled'});
						getGuiEditorContentList(function(){
							$(e.target).removeAttr('disabled');
						});
					}}>ブロックエディタのコンテンツを検索する</button></li>
				{(status.GuiEditorContentsList!==null
					?
					<li><button className="px2-btn px2-btn--primary" onClick={(e)=>{
						rebuildAllBroccoliContent();
					}}>すべて再構成</button></li>
					:
					<></>
				)}
				</ul>
			</div>
			{(status.GuiEditorContentsList!==null
				?
				<>
					{(status.GuiEditorContentsList.length
						?
						<>
							<table className="px2-table cont-content-list" style={{widht:"100%"}}>
								<colgroup>
									<col />
									<col />
									<col />
								</colgroup>
								<tbody>
								{(status.GuiEditorContentsList.map((guiEditorContent, idx)=>{
									return (
										<tr key={idx}>
											<th>{guiEditorContent}</th>
											<td>{status.ContentsRebuildStatus[guiEditorContent] === undefined ? '' : status.ContentsRebuildStatus[guiEditorContent] === null ? 'progress...' : status.ContentsRebuildStatus[guiEditorContent] ? 'OK' : 'NG'}</td>
											<td class="cont-content-list__btn-rebuild"><button type="button" data-target-content={guiEditorContent} onClick={(e)=>{
												e.preventDefault();
												var target_path = $(e.target).attr('data-target-content');

												rebuildBroccoliContent(target_path);
											}} className={status.ContentsRebuildStatus[guiEditorContent] === true ? "px2-btn px2-btn--primary" : status.ContentsRebuildStatus[guiEditorContent] === false ? "px2-btn px2-btn--danger" : "px2-btn"} disabled={status.ContentsRebuildStatus[guiEditorContent]===null ? true : false}>rebuild</button></td>
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
