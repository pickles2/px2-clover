import React from "react";
import ReactDOM from "react-dom";
import {MainContext} from './context/MainContext';
import Root from "./components/Root";

class Layout extends React.Component {

	/**
	 * Constructor
	 */
	constructor() {
		super();
		const setMainState = (val) => {
			this.setState((state) => val);
		};

		// Initialize State
		this.state = {
			"setMainState": setMainState,
		};
	}

	/**
	 * Renderer
	 */
	render() {
		return (
			<MainContext.Provider value={this.state}>
				<Root />
			</MainContext.Provider>
		);
	}
}

const app = document.getElementById('cont-app');
ReactDOM.render(<Layout/>, app);
