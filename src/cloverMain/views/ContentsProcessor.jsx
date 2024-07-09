import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import iterate79 from 'iterate79';
import Link from '../components/Link';

export default function ContentsProcessor(props){

	const main = useContext(MainContext);
	const [status, setStatus] = useState({});

	return (
		<>
			<div className="px2-p">
                <p>開発中...</p>
			</div>
		</>
	);
}
