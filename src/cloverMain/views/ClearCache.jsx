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
		$.ajax({
			"url": "?PX=clearcache",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('------ clearcache Response Error:', typeof(error), error);
			},
			"success": function(data){
				console.log('------ clearcache Response:', typeof(data), data);
			},
			"complete": function(){
				alert('clearcache done.');
				px2style.closeLoading();
			},
		});
	}

	return (
		<>
			<p><button type="button" onClick={clearcache} className="px2-btn">キャッシュを消去</button></p>
		</>
	);
});
