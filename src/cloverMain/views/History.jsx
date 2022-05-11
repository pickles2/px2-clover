import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function History(props){

	const main = useContext(MainContext);

	/**
	 * コミットする
	 */
	function commit(){
		px2style.loading();
		$.ajax({
			"url": "?PX=admin.api.git_commit",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				console.error('------ git-commit Response Error:', typeof(error), error);
			},
			"success": function(data){
				console.log('------ git-commit Response:', typeof(data), data);
			},
			"complete": function(){
				alert('git-commit done.');
				px2style.closeLoading();
			},
		});
	}

	return (
		<>
			<p><button type="button" onClick={commit} className="px2-btn">コミットする</button></p>
		</>
	);
});
