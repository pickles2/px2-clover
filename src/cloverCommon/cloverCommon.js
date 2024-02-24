import CloverUtils from '../_libs/CloverUtils';
import Px2Utils from '../_libs/Px2Utils';
import $ from 'jquery';

window.cloverUtils = new CloverUtils();
window.px2utils = new Px2Utils();

$(window)
	.on('dragover', function(e){
		e.stopPropagation();
		e.preventDefault();
		return;
	})
	.on('drop', function(e){
		e.stopPropagation();
		e.preventDefault();
		return;
	})
;
