import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function Config(props){

	const main = useContext(MainContext);

	return (
		<>
			<h2>{main.lb.get('ui_label.account')}</h2>
			<div className="px2-linklist">
				<ul>
					<li><Link href="?PX=admin.config.profile">{main.lb.get('page_title.config_profile')}</Link></li>
					<li><Link href="?PX=admin.config.members">{main.lb.get('page_title.config_members')}</Link></li>
				</ul>
			</div>
			<h2>{main.lb.get('ui_label.environment_settings')}</h2>
			<div className="px2-linklist">
				<ul>
					<li><Link href="?PX=admin.config.history">{main.lb.get('page_title.config_history')}</Link></li>
					<li><Link href="?PX=admin.config.scheduler">{main.lb.get('page_title.config_scheduler')}</Link></li>
					<li><Link href="?PX=admin.config.maintenance">{main.lb.get('page_title.config_maintenance')}</Link></li>
				</ul>
			</div>
			<h2>{main.lb.get('ui_label.utility')}</h2>
			<div className="px2-linklist">
				<ul>
					<li><Link href="?PX=admin.sitemap">{main.lb.get('page_title.sitemap')}</Link></li>
					<li><Link href="?PX=admin.modules">{main.lb.get('page_title.modules')}</Link></li>
					<li><Link href="?PX=admin.config.find_unassigned_contents">{main.lb.get('page_title.config_find_unassigned_contents')}</Link></li>
					<li><Link href="?PX=admin.config.contents_processor">{main.lb.get('page_title.config_contents_processor')}</Link></li>
					<li><Link href="?PX=admin.config.update_gui_contents">{main.lb.get('page_title.config_update_gui_contents')}</Link></li>
					<li><Link href="?PX=admin.config.files_and_folders">{main.lb.get('page_title.config_files_and_folders')}</Link></li>
					<li><Link href="?PX=admin.clearcache">{main.lb.get('page_title.clearcache')}</Link></li>
				</ul>
			</div>
			<h2>{main.lb.get('ui_label.custom_extensions')}</h2>
			<div className="px2-linklist">
				<ul>
					<li><Link href="?PX=admin.cce">{main.lb.get('page_title.cce')}</Link></li>
				</ul>
			</div>
		</>
	);
}
