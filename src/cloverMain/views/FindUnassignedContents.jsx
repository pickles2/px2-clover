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
	function findUnassignedContents(e){
		px2style.loading();
		$(e.target).attr({'disabled':'disabled'});
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
				$(e.target).removeAttr('disabled');

				setUnassignedContentsList(data.unassigned_contents);
			}
		);
	}

	return (
		<>
			<div>
				<button className="px2-btn px2-btn--primary" onClick={findUnassignedContents}>未アサインコンテンツを検索する</button>
			</div>
			{unassignedContentsList!==null && unassignedContentsList.length && (
				<>
					<ul>
					{(unassignedContentsList.map((unassignedContent)=>{
						return (<>
							<li>{unassignedContent}</li>
						</>);
					}))}
					</ul>
				</>
			)}
		</>
	);
}
