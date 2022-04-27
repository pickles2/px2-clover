import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import $ from 'jquery';
import iterate79 from 'iterate79';

export default function PageInfo(props){

	const main = useContext(MainContext);
	const [pageInfo, setPageInfo] = useState({});

	(()=>{
		let tmpPageInfo = {};
		iterate79.fnc({}, [
			function(it1){
				px2style.loading();
				it1.next();
			},
			function(it1){
				$.ajax({
					"url": "?PX=admin.api.get_page_info",
					"method": "post",
					"data": {
						'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
					},
					"error": function(error){
						console.error('------ admin.api.get_page_info Response Error:', typeof(error), error);
					},
					"success": function(data){
						console.log('------ admin.api.get_page_info Response:', typeof(data), data);
						tmpPageInfo = data;
					},
					"complete": function(){
						it1.next();
					},
				});

			},
			function(it1){
				px2style.closeLoading();
				// setPageInfo( tmpPageInfo );
				it1.next();
			},
		]);
	})();

	return (
		<>
			{/* <div>{pageInfo.title}</div> */}
			<p><Link href="?PX=admin.config">Config</Link></p>
			<p><Link href="/hoge/fuga.html?PX=admin.test">Test</Link></p>
			<p><Link href="?PX=admin">Dashboard</Link></p>
		</>
	);
}
