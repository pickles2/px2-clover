import $ from 'jquery';

export default function Px2Utils(){

	/**
	 * カレントページ情報一式を取得する
	 * @param {*} path 
	 * @returns 
	 */
	this.getCurrentPageInfo = function( callback ){
		this.pxCmd("?PX=admin.api.get_page_info", {}, callback);
		return;
	}

	/**
	 * PX Command を実行する
	 */
	this.pxCmd = function( path, params, ...args ){
		let options = {};
		if( args.length >=2 ){
			options = args[0];
		}
		const callback = args[args.length - 1];

		params = params || {};
		params.ADMIN_USER_CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
		params.lang = params.lang || window.cloverUtils.lang;

		let pxCmdStdOut;
		let error;

		let lastResponseLength = false;
		let ajaxOptions = {
			"url": (function(){
				if( !path.match(/^\//) ){
					return path;
				}
				return window.px2config.path_controot + (path.replace(/^\/*/, ''));
			})(),
			"method": "post",
			"data": params,
			"cache": false,
			"timeout": 30*1000, // デフォルトは30秒でタイムアウトさせる
			"xhrFields": {},
		};

		if( options && options.timeout ){
			ajaxOptions.timeout = options.timeout;
		}else if( options && options.timeout === 0 ){
			delete(ajaxOptions.timeout);
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
			.fail(function(jqXHR, textStatus, errorMsg){
				if( jqXHR.status == 403 ){
					// logged out.
					window.location.reload();
				}
				console.error('PX Command Error:', jqXHR, textStatus, errorMsg);
				error = errorMsg;
				if(jqXHR.responseJSON){
					pxCmdStdOut = jqXHR.responseJSON;
				}else if(jqXHR.responseText){
					pxCmdStdOut = jqXHR.responseText;
				}
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
	 * ページのpathをリクエスト可能な形に変換する
	 * pathに含まれるパスパラメータを保管し、リクエスト可能な形にします。
	 * @param {*} page_path 
	 * @returns requestable path
	 */
	this.pagePathToRequestablePath = function(page_path){
		const pattern = /\{(?:\*|\$)([a-zA-Z0-9\_\-]*)\}/;
		while( pattern.test(page_path) ){
			page_path = page_path.replace(pattern, '$1');
		}
		return page_path;
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

	/**
	 * Base64 変換
	 */
	this.base64_encode_async = async function(orig) { return new Promise(function(rlv, rjc){
		var r = new FileReader();
		r.onload = function(){
			var offset = r.result.indexOf(",");
			rlv(r.result.slice(offset+1));
		};
		r.readAsDataURL(new Blob([orig]));
	}); }

}
