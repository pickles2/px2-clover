import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function PageInfo(props){

	const main = useContext(MainContext);

	return (
		<>
			{(main.pageInfo === null)
				?<>
					<p>...</p>
				</>

			:<>{(main.pageInfo.current_page_info)
				?<>
					{/* <div>{main.pageInfo.title}</div> */}
					{(typeof(main.pageInfo.breadcrumb) === typeof([]) && (
						<div className="theme-layout__breadcrumb">
							<ul>
							{main.pageInfo.breadcrumb.map( ( breadcrumb_info )=>{
								return (
									<li key={breadcrumb_info.id}><Link href={breadcrumb_info.path + "?PX=admin.page_info"}>{breadcrumb_info.title}</Link></li>
								)
							} )}
							<li>{main.pageInfo.current_page_info.title}</li>
							</ul>
						</div>
					))}
					{(typeof(main.pageInfo.parent) === typeof({}) && (<>
						<p><Link href={main.pageInfo.parent.path + "?PX=admin.page_info"}>{main.pageInfo.parent.title}</Link></p>
					</>))}
					{(typeof(main.pageInfo.bros) === typeof([]) && (<>
						<ul>
						{main.pageInfo.bros.map( ( bros_page_info )=>{
							return (
								<li key={bros_page_info.id}><Link href={bros_page_info.path + "?PX=admin.page_info"}>{bros_page_info.title}</Link>
									{(typeof(main.pageInfo.bros) === typeof([]) && bros_page_info.path == props.path && (<>
										<ul>
										{main.pageInfo.children.map( ( child_page_info )=>{
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
					{(typeof(main.pageInfo.current_page_info) === typeof({}) && (<>
						<div className="px2-p">
							<table className="px2-table">
								<tbody>
									<tr><th>id</th><td>{main.pageInfo.current_page_info.id}</td></tr>
									<tr><th>title</th><td><Link href={main.pageInfo.current_page_info.path + "?PX=admin"}>{main.pageInfo.current_page_info.title}</Link></td></tr>
									<tr><th>path</th><td>{main.pageInfo.current_page_info.path}</td></tr>
								</tbody>
							</table>
						</div>
					</>))}
				</>
			:<>
				<p>このページは存在しません。</p>
			</>}
			</>}
		</>
	);
}
