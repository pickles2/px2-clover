import $ from 'jquery';

export default function Px2Utils(){

	/**
	 * カレントページ情報一式を取得する
	 * @param {*} path 
	 * @returns 
	 */
	this.getCurrentPageInfo = function( callback ){
		this.px2cmd("?PX=admin.api.get_page_info", {}, callback);
		return;
	}

	/**
	 * PX Command を実行する
	 */
	this.px2cmd = function( path, params, ...args ){
		let options = {};
		if( args.length >=2 ){
			options = args[0];
		}
		const callback = args[args.length - 1];

		params.ADMIN_USER_CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
		let pxCmdStdOut;
		let error;

		let lastResponseLength = false;
		let ajaxOptions = {
			"url": path,
			"method": "post",
			"data": params,
			"cache": false,
			"timeout": 30000, // デフォルトは30秒でタイムアウトさせる
			"xhrFields": {},
		};

		if( options && options.timeout ){
			ajaxOptions.timeout = options.timeout;
		}
		if( options && options.progress ){
			ajaxOptions.xhrFields.onprogress = function(oEvent){
				var thisResponse, response = oEvent.currentTarget.response;
				if(lastResponseLength === false) {
					thisResponse = response;
					lastResponseLength = response.length;
				} else {
					thisResponse = response.substring(lastResponseLength);
					lastResponseLength = response.length;
				}
				options.progress(thisResponse);
			}
		}

		$.ajax(ajaxOptions)
			.done(function(data, textStatus, jqXHR){
				pxCmdStdOut = data;
			})
			.fail(function(jqXHR, textStatus, error){
				if( jqXHR.status == 403 ){
					// alert('You logged out.');
					window.location.reload();
				}
				console.error('PX Command Error:', jqXHR, textStatus, error);
				error = error;
			})
			.always(function(){
				callback(pxCmdStdOut, error);
			})
		;
		return;
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
