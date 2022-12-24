import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function FindUnassignedContents(props){

	const main = useContext(MainContext);
	const [unassignedContentsList, setUnassignedContentsList] = useState(null);

	/**
	 * 未アサインコンテンツの検索結果を取得する
	 */
	function getUnassignedContentList(callback){
		callback = callback || function(){};
		px2style.loading();
		main.px2utils.px2cmd(
			"?PX=px2dthelper.get.list_unassigned_contents",
			{},
			{},
			function(data, error){
				console.log('------ px2dthelper.get.list_unassigned_contents Response:', data, error);
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

				setUnassignedContentsList(data.unassigned_contents);

				callback();
			}
		);
	}

	/**
	 * 未アサインコンテンツを削除する
	 */
	function deleteContent( target_path ){
		if(!confirm('このコンテンツ '+target_path+' を削除しますか？')){
			return;
		}

		main.px2utils.px2cmd(
			target_path + '?PX=px2dthelper.content.delete',
			{},
			function( res ){
				console.log(res);
				if( !res.result ){
					alert( 'Error: ' + res.message );
					console.error('Error:', res);
					return;
				}
				getUnassignedContentList();
			}
		);
	}

	return (
		<>
			<div className="px2-p">
				<button className="px2-btn px2-btn--primary" onClick={(e)=>{
					$(e.target).attr({'disabled':'disabled'});
					getUnassignedContentList(function(){
						$(e.target).removeAttr('disabled');
					});
				}}>未アサインコンテンツを検索する</button>
			</div>
			{(unassignedContentsList!==null
				?
				<>
					{(unassignedContentsList.length
						?
						<>
							<table className="px2-table" style={{widht:"100%"}}>
							{(unassignedContentsList.map((unassignedContent, idx)=>{
								return (
									<tr key={idx}>
										<th>{unassignedContent}</th>
										<td><button type="button" data-target-content={unassignedContent} onClick={(e)=>{
											var target_path = $(e.target).attr('data-target-content');
											target_path = target_path.replace(/(\.html?)(\.[a-zA-Z0-9]+)?$/, '$1');
											deleteContent(target_path);
										}} className="px2-btn px2-btn--danger">remove</button></td>
									</tr>
								);
							}))}
							</table>
						</>
						:
						<>
							<p>未アサインコンテンツは検出されませんでした。</p>
						</>
					)}
				</>
				:
				<></>
			)}
		</>
	);
}
