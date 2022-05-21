import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';
import iterate79 from 'iterate79';

export default function Dashboard(props){

	const main = useContext(MainContext);

	return (
		<>
			<p>ようこそ、Pickles 2 Clover CMS へ！</p>
		</>
	);
}
