import React, { useContext } from "react";
import {MainContext} from '../context/MainContext';

export default function Link(props){

	const main = useContext(MainContext);
	function goto(e){
		e.preventDefault();
		main.link(e.target.href);
		return false;
	}

	return (
		<a href={props.href} onClick={goto}>{props.children}</a>
	);
}
