import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function ConfigMembers(props){

	const main = useContext(MainContext);
	const [memberList, setMemberList] = useState(false);

	useEffect(() => {
		main.px2utils.px2cmd(
			'/?PX=admin.api.get_members',
			{},
			function( res ){
				setMemberList(res);
				return;
			}
		);
		return () => {
		};
	}, []);

	return (
		<>
			{(!memberList || !main.profile)
				?<>
					<p>...</p>
				</>
			:<>{(memberList.list && memberList.list.length)
				?<>
					<ul>
						{memberList.list.map((memberInfo, index) => {
							return <li key={index}>
								{ memberInfo.name }
								{ memberInfo.id == main.profile.id ? <> (You)</> : <></> }
							</li>;
						})}
					</ul>
				</>
				:<>
					<p>
						メンバー情報は登録されていません。<br />
					</p>
				</>
			}</>}
			<p><Link href="?PX=admin.config">戻る</Link></p>
		</>
	);
}
