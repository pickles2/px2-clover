import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function Sitemap(props){

	const main = useContext(MainContext);

	return (
		<>
			<div className="px2-p">
				<p>開発中の機能です。</p>
			</div>
		</>
	);
});
