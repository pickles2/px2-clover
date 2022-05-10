import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function Publish(props){

	const main = useContext(MainContext);

	/**
	 * パブリッシュを実行する
	 */
	function publish(){
		if( !confirm('パブリッシュを実行しますか？') ){
			return;
		}
		px2style.loading();
		$.ajax({
			"url": "?PX=publish.run",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('------ publish Response Error:', typeof(error), error);
			},
			"success": function(data){
				console.log('------ publish Response:', typeof(data), data);
			},
			"complete": function(){
				alert('publish done.');
				px2style.closeLoading();
			},
		});
	}

	return (
		<>
			<p><button type="button" onClick={publish} className="px2-btn">パブリッシュ</button></p>
		</>
	);
});
