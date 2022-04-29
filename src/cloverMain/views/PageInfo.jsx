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
					{(typeof(main.pageInfo.current_page_info) === typeof({}) && (<>
						<div className="px2-p">
							<table className="px2-table">
								<tbody>
									<tr><th>id</th><td>{main.pageInfo.current_page_info.id}</td></tr>
									<tr><th>title</th><td><Link href={main.px2utils.href(main.pageInfo.current_page_info.path + "?PX=admin")}>{main.pageInfo.current_page_info.title}</Link></td></tr>
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
