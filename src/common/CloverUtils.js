export default function CloverUtils(){

	/**
	 * ログインユーザーのプロフィール情報を取得する
	 */
	this.getProfile = function( callback ){
		let tmpPageInfo;
		$.ajax({
			"url": "?PX=admin.api.get_profile",
			"method": "post",
			"data": {
				'ADMIN_USER_CSRF_TOKEN': window.csrf_token,
			},
			"error": function(error){
				// console.error('------ admin.api.get_profile Response Error:', typeof(error), error);
				tmpPageInfo = error;
			},
			"success": function(data){
				// console.log('------ admin.api.get_profile Response:', typeof(data), data);
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
		data.ADMIN_USER_CSRF_TOKEN = window.csrf_token;
		$.ajax({
			"url": "?PX=admin.api.update_profile",
			"method": "post",
			"data": data,
			"error": function(error){
				// console.error('------ admin.api.update_profile Response Error:', typeof(error), error);
				result = error;
			},
			"success": function(data){
				// console.log('------ admin.api.update_profile Response:', typeof(data), data);
				result = data;
			},
			"complete": function(){
				callback(result);
			},
		});
	}

}
