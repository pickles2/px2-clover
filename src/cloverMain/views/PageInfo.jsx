import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import $ from 'jquery';
import iterate79 from 'iterate79';

export default function PageInfo(props){

	const main = useContext(MainContext);
	const [pageInfo, setPageInfo] = useState(false);

	(()=>{
		let tmpPageInfo = {};
		try {
			if( pageInfo && pageInfo.current_page_info && pageInfo.current_page_info.path == props.path ){
				return;
			}
		} catch(e) {}
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
				if( tmpPageInfo.current_page_info ){
					setPageInfo( tmpPageInfo );
				}
				it1.next();
			},
		]);
	})();

	return (
		<>
			{(pageInfo.current_page_info)
				?<>
					{/* <div>{pageInfo.title}</div> */}
					{(typeof(pageInfo.breadcrumb) === typeof([]) && (
						<div className="theme-layout__breadcrumb">
							<ul>
							{pageInfo.breadcrumb.map( ( breadcrumb_info )=>{
								return (
									<li key={breadcrumb_info.id}><Link href={breadcrumb_info.path + "?PX=admin.page_info"}>{breadcrumb_info.title}</Link></li>
								)
							} )}
							<li>{pageInfo.current_page_info.title}</li>
							</ul>
						</div>
					))}
					{(typeof(pageInfo.parent) === typeof({}) && (<>
						<p><Link href={pageInfo.parent.path + "?PX=admin.page_info"}>{pageInfo.parent.title}</Link></p>
					</>))}
					{(typeof(pageInfo.bros) === typeof([]) && (<>
						<ul>
						{pageInfo.bros.map( ( bros_page_info )=>{
							return (
								<li key={bros_page_info.id}><Link href={bros_page_info.path + "?PX=admin.page_info"}>{bros_page_info.title}</Link>
									{(typeof(pageInfo.bros) === typeof([]) && bros_page_info.path == props.path && (<>
										<ul>
										{pageInfo.children.map( ( child_page_info )=>{
											return (
												<li key={child_page_info.id}><Link href={child_page_info.path + "?PX=admin.page_info"}>{child_page_info.title}</Link></li>
											)
										} )}
										</ul>
									</>)
									)}
								</li>
							)
						} )}
						</ul>
					</>))}
					{(typeof(pageInfo.current_page_info) === typeof({}) && (<>
						<div className="px2-p">
							<table className="px2-table">
								<tbody>
									<tr><th>id</th><td>{pageInfo.current_page_info.id}</td></tr>
									<tr><th>title</th><td><Link href={pageInfo.current_page_info.path + "?PX=admin"}>{pageInfo.current_page_info.title}</Link></td></tr>
									<tr><th>path</th><td>{pageInfo.current_page_info.path}</td></tr>
								</tbody>
							</table>
						</div>
					</>))}
				</>
				:<>
					<p>このページは存在しません。</p>
				</>
			}
		</>
	);
}
