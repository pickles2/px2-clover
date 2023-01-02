import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import iterate79 from 'iterate79';

export default function Dashboard(props){

	const main = useContext(MainContext);

	return (
		<>
			<p>ようこそ、Pickles 2 Clover CMS へ！</p>
			{!main.pxConfig
				?<></>
				:<>
					<h2>Site Profile</h2>
					<table className="px2-table">
						<colgroup>
							<col width="30%" />
							<col width="70%" />
						</colgroup>
						<tbody>
						<tr>
							<th>Site Name</th>
							<td>{main.pxConfig.name || '---'}</td>
						</tr>
						<tr>
							<th>Domain</th>
							<td>{main.pxConfig.domain || '---'}</td>
						</tr>
						<tr>
							<th>Copyright</th>
							<td>{main.pxConfig.copyright || '---'}</td>
						</tr>
						</tbody>
					</table>
				</>
			}
		</>
	);
}
