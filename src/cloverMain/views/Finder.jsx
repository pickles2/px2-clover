import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function Finder(props){

	const main = useContext(MainContext);

	return (
		<>
			<div className="px2-p">
				<p>開発中です。</p>
			</div>
		</>
	);
}
