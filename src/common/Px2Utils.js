import $ from 'jquery';

export default function Px2Utils(){

	/**
	 * カレントページ情報一式を取得する
	 * @param {*} path 
	 * @returns 
	 */
	this.getCurrentPageInfo= function( callback ){
		let tmpPageInfo;
		$.ajax({
			"url": "?PX=admin.api.get_page_info",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				// console.error('------ admin.api.get_page_info Response Error:', typeof(error), error);
				tmpPageInfo = error;
			},
			"success": function(data){
				// console.log('------ admin.api.get_page_info Response:', typeof(data), data);
				tmpPageInfo = data;
			},
			"complete": function(){
				callback(tmpPageInfo);
			},
		});
	}

	/**
	 * リンク先パスを補完する
	 * @param {*} path controot を含まないパス 
	 * @returns 
	 */
	this.href = function( path ){
		if( typeof(path) !== typeof('') ){
			return path;
		}

		// GETパラメータを受け付けられるようにする
		let [pathname, query] = path.split('?');

		// パスパラメータ {$xxx} を補完する
		let tmpStr = pathname;
		pathname = '';
		while(1){
			if(tmpStr.match(/^([\s\S]*?)\{\$([\s\S]+)\}([\s\S]*)$/)){
				pathname += RegExp.$1;
				pathname += RegExp.$2;
				tmpStr = RegExp.$3;
				continue;
			}
			pathname += tmpStr;
			break;
		}

		// パスパラメータ {*xxx} を補完する
		tmpStr = pathname;
		pathname = '';
		while(1){
			if(tmpStr.match(/^([\s\S]*?)\{\*([\s\S]*)\}([\s\S]*)$/)){
				pathname += RegExp.$1;
				pathname += RegExp.$2;
				tmpStr = RegExp.$3;
				continue;
			}
			pathname += tmpStr;
			break;
		}

		// デフォルトファイル名を補完する
		if( pathname.match(/\/$/) ){
			pathname += window.px2config.default_directory_index;
		}

		// controot を補完する
		pathname = pathname.replace(/^\//, window.px2config.path_controot);

		var rtn = pathname + (typeof(query)==typeof('') ? '?'+query : '');
		return rtn;
	}

	/**
	 * 先頭から controot を削除する
	 * @param {*} path 
	 * @returns 
	 */
	this.trimContRoot = function( path ){
		if( path.indexOf(window.px2config.path_controot) === 0 ){
			path = "/"+path.substr(window.px2config.path_controot.length);
		}
		return path;
	}

}
