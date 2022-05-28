import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function ClearCache(props){

	const main = useContext(MainContext);

	/**
	 * キャッシュを削除する
	 */
	function clearcache(){
		px2style.loading();
		main.px2utils.px2cmd(
			"?PX=clearcache",
			{},
			{
				"progress": function(progress){
					console.log('progress:', progress);
				},
			},
			function(data, error){
				console.log('------ clearcache Response:', data, error);
				if( error ){
					alert('clearcache error.');
				}else{
					alert('clearcache done.');
				}
				px2style.closeLoading();
			}
		);
	}

	return (
		<>
			<p><button type="button" onClick={clearcache} className="px2-btn">キャッシュを消去</button></p>
		</>
	);
});
