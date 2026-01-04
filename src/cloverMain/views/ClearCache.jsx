import React, { useContext, useState } from "react";
import {MainContext} from '../context/MainContext';
import $ from 'jquery';

export default React.memo(function ClearCache(props){

	const main = useContext(MainContext);

	/**
	 * キャッシュを削除する
	 */
	function clearcache(){
		px2style.loading();
		main.px2utils.pxCmd(
			"?PX=clearcache",
			{},
			{
				"progress": function(progress){
					console.log('progress:', progress);
				},
			},
			function(data, error){
				console.log('------ clearcache Response:', data, error);
				if( error ){
					px2style.modal({
						'title': main.lb.get('modal_title.clear_cache_error'),
						'body': `<p>${main.lb.get('ui_message.an_error_has_occurred')}</p>`,
					});
				}else{
					px2style.modal({
						'title': main.lb.get('modal_title.clear_cache_completed'),
						'body': `<p>${main.lb.get('ui_message.cache_clearing_completed')}</p>`,
					});
				}

				px2style.closeLoading();
			}
		);
	}

	return (
		<>
			<p><button type="button" onClick={clearcache} className="px2-btn">{main.lb.get('ui_label.clear_cache')}</button></p>
		</>
	);
});
