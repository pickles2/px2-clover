export default function CloverUtils(){
	const $ = require('jquery');
	const _ = require('lodash');
	const Twig = require('twig');
	const _this = this;
	this.lang = "ja";
	let lb;

	/**
	 * 言語コードをセットする
	 */
	this.setLang = function(lang){
		this.lang = lang;
	}

	this.setLangbank = function(langbank){
		lb = langbank;
	}

	/**
	 * 起動時情報を取得する
	 */
	this.getBootupInformations = function( callback ){
		let tmpPageInfo;
		$.ajax({
			"url": "?PX=admin.api.get_bootup_informations",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': $('meta[name="csrf-token"]').attr('content'),
			},
			"error": function(error){
				tmpPageInfo = error;
			},
			"success": function(data){
				tmpPageInfo = data;
			},
			"complete": function(){
				callback(tmpPageInfo);
			},
		});
	}

	/**
	 * ログインユーザーのプロフィール情報を取得する
	 */
	this.getProfile = function( callback ){
		let tmpPageInfo;
		$.ajax({
			"url": "?PX=admin.api.get_profile",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': $('meta[name="csrf-token"]').attr('content'),
			},
			"error": function(error){
				tmpPageInfo = error;
			},
			"success": function(data){
				tmpPageInfo = data;
			},
			"complete": function(){
				callback(tmpPageInfo);
			},
		});
	}

	/**
	 * ログインユーザーのプロフィール情報を更新する
	 */
	this.updateProfile = function( newProfile, callback ){
		let result;
		let data = newProfile;
		data.ADMIN_USER_CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
		$.ajax({
			"url": "?PX=admin.api.update_profile",
			"method": "post",
			"data": data,
			"timeout": 30000,
			"error": function(error){
				console.error("Clover API ERROR:", error);
				result = {
					result: false,
					message: "API Errored.",
				};
			},
			"success": function(data){
				result = data;
			},
			"complete": function(){
				callback(result);
			},
		});
	}

	/**
	 * 設定を取得する
	 */
	this.getConfig = function( callback ){
		let tmpConfig;
		let tmpError;
		$.ajax({
			"url": "?PX=admin.api.get_config",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': $('meta[name="csrf-token"]').attr('content'),
			},
			"error": function(error){
				tmpConfig = {
					result: false,
					message: error,
				};
				tmpError = error;
			},
			"success": function(data){
				tmpConfig = data;
			},
			"complete": function(){
				callback(tmpConfig, tmpError);
			},
		});
	}

	/**
	 * 設定を更新する
	 */
	this.updateConfig = function( newConfig, callback ){
		let returnResult;
		let returnError;
		let data = newConfig;
		data.ADMIN_USER_CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');
		$.ajax({
			"url": "?PX=admin.api.update_config",
			"method": "post",
			"data": data,
			"error": function(error){
				returnResult = {
					result: false,
					message: error,
				};
				returnError = error;
			},
			"success": function(data){
				returnResult = data;
			},
			"complete": function(){
				callback(returnResult, returnError);
			},
		});
	}

	var timer_autoCommit;
	this.autoCommit = function(){
		// auto_commit 設定が有効な場合、
		// コミット要求を投げる
		if( !clover_config.history.auto_commit ){
			return;
		}
		clearTimeout(timer_autoCommit);
		timer_autoCommit = setTimeout(function(){
			$.ajax({
				"url": '?PX=admin.api.git_commit',
				"method": 'post',
				'data': {
					'ADMIN_USER_CSRF_TOKEN': $('meta[name="csrf-token"]').attr('content'),
				},
				"error": function(error){
					console.error('------ Auto commit: Error:', typeof(error), error);
				},
				"success": function(data){
					console.log('------ Auto commit: Response:', typeof(data), data);
				},
				"complete": function(){
				},
			});
		}, 2000);
	}

	/**
	 * remote-finder で開く
	 */
	this.openInFinder = function( rootDirectory, $finderContainer, path, callback ){
		rootDirectory = rootDirectory || 'root';
		path = path || '/';
		callback = callback || function(){};
		var remoteFinder = new RemoteFinder(
			$finderContainer,
			{
				"gpiBridge": function(input, callback){ // required
					window.px2utils.pxCmd(
						'/?PX=admin.api.remote_finder',
						{
							'mode': rootDirectory,
							'input': input,
						},
						function( res, error ){
							if( error || !res.result ){
								console.error('Error:', res);
								callback({
									result: false,
									message: "API Error",
								});
								return;
							}
							callback(res.output);
						}
					);
				},
				"open": function(fileinfo, callback){
					window.cloverUtils.openInCommonFileEditor(
						rootDirectory,
						fileinfo.path,
						function(res){
							callback(res);
						}
					);
				},
			}
		);
		remoteFinder.init(path, {}, function(){
			callback(true);
		});
	}

	/**
	 * ファイルエディタで開く
	 */
	this.openInCommonFileEditor = function( rootDirectory, filePath, callback ){
		rootDirectory = rootDirectory || 'root';
		callback = callback || function(){};
		const $body = document.createElement('div');
		const modalObj = px2style.modal({
			"body": $body,
			"buttons": [],
			"width": "100%",
			"height": "100%",
			"contentFill": true,
		});
		modalObj.closable(false);

		var commonFileEditor = new CommonFileEditor(
			$body,
			{
				"lang": this.lang,
				"read": function(filename, callback){ // required
					window.px2utils.pxCmd(
						'/?PX=admin.api.common_file_editor',
						{
							'mode': rootDirectory,
							'method': 'read',
							'filename': filename,
						},
						function( res, error ){
							if( error || !res.result ){
								console.error('Error:', res);
								callback({
									result: false,
									message: "API Error",
								});
								return;
							}
							callback(res);
						}
					);
				},
				"write": function(filename, base64, callback){ // required
					window.px2utils.pxCmd(
						'/?PX=admin.api.common_file_editor',
						{
							'mode': rootDirectory,
							'method': 'write',
							'filename': filename,
							'base64': base64,
						},
						function( res, error ){
							if( error || !res.result ){
								console.error('Error:', res);
								callback({
									result: false,
									message: "API Error",
								});
								return;
							}
							callback(res);
						}
					);
				},
				"onemptytab": function(){
					modalObj.closable(true);
					px2style.closeModal();
				},
			}
		);

		commonFileEditor.init(function(){
			commonFileEditor.preview( filePath );
			callback(true);
		});
		return;
	}

	/**
	 * Twig テンプレートを処理する
	 */
	this.bindTwig = function( templateSrc, bindData ){
		var template = Twig.twig({
			data: templateSrc,
			autoescape: true,
		});
		bindData = {
			...bindData,
			lb: lb,
		};
		return template.render(bindData);
	}


	// --------------------------------------
	// CSRFトークンの更新
	$(window).on('click', _.debounce(
		function (e) {
			$.ajax({
				"url": '?PX=admin.api.csrf_token',
				"method": 'post',
				'data': {
					'ADMIN_USER_CSRF_TOKEN': $('meta[name="csrf-token"]').attr('content'),
				},
				"error": function(error){
					console.error(error);
				},
				"success": function(data){
					$('meta[name="csrf-token"]')
						.attr({
							'content': data.token,
						});
				},
				"complete": function(){
				},
			});

		},
		5 * 60 * 1000,
		{
			maxWait: 10 * 60 * 1000,
		}
	));

}
