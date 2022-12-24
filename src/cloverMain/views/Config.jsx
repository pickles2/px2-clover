import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function Config(props){

	const main = useContext(MainContext);

	return (
		<>
			<div className="px2-linklist">
				<ul>
					<li><Link href="?PX=admin.config.profile">プロフィール設定</Link></li>
					<li><Link href="?PX=admin.config.members">メンバー一覧</Link></li>
					<li><Link href="?PX=admin.config.history">履歴管理設定</Link></li>
					<li><Link href="?PX=admin.config.scheduler">タスクスケジュール設定</Link></li>
					<li><Link href="?PX=admin.config.maintenance">メンテナンス</Link></li>
					<li><Link href="?PX=admin.sitemap">サイトマップ</Link></li>
					<li><Link href="?PX=admin.config.find_unassigned_contents">未アサインコンテンツ検索</Link></li>
					<li><Link href="?PX=admin.modules">モジュール</Link></li>
					<li><Link href="?PX=admin.config.files_and_folders">ファイルを操作</Link></li>
					<li><Link href="?PX=admin.clearcache">キャッシュを消去</Link></li>
				</ul>
			</div>
		</>
	);
}
