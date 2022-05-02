import React, { useContext } from "react";
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
					<ul>
						<li><a href="?PX=admin.edit_contents">コンテンツを編集する</a></li>
						<li><a href="?">プレビューに戻る</a></li>
					</ul>
					{(main.pageInfo !== null && typeof(main.pageInfo.breadcrumb) === typeof([]) && (
						<div className="theme-layout__breadcrumb">
							<ul>
							{main.pageInfo.breadcrumb.map( ( breadcrumb_info )=>{
								return (
									<li key={breadcrumb_info.id}><Link href={main.px2utils.href(breadcrumb_info.path + "?PX=admin.page_info")}>{breadcrumb_info.title}</Link></li>
								)
							} )}
							<li>{main.pageInfo.current_page_info.title}</li>
							</ul>
						</div>
					))}
					{(typeof(main.pageInfo.current_page_info) === typeof({}) && (<>
						<div className="px2-p">
							<table className="px2-table" style={{width:'100%',}}>
								<tbody>
									<tr><th>id</th><td>{main.pageInfo.current_page_info.id}</td></tr>
									<tr><th>title</th><td><Link href={main.px2utils.href(main.pageInfo.current_page_info.path + "?PX=admin.page_info")}>{main.pageInfo.current_page_info.title}</Link></td></tr>
									<tr><th>path</th><td>{main.pageInfo.current_page_info.path}</td></tr>
									{Object.keys(main.pageInfo.current_page_info).map( ( value, idx )=>{
										if( ['id','title','path'].find(val => val==value) ){return;}
										return (
											<tr key={idx}>
												<th>{value}</th>
												<td>{main.pageInfo.current_page_info[value]}</td>
											</tr>
										)
									} )}
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
