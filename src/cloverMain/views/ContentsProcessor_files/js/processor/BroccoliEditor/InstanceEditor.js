/**
 * broccoli-processor/instanceEditor.js
 */
export default function InstanceEditor(instancePath, logger, done){
	var instance = {};

	/** インスタンスパスを取得 */
	this.getInstancePath = function(){
		return instancePath;
	}
	/** インスタンスデータを取得 */
	this.getInstance = function(){
		return instance;
	}
	/** インスタンスデータをセット */
	this.setInstance = function(val){
		instance = val;
		return true;
	}
	/** ログを記録 */
	this.log = function(val){
		return logger.log( instancePath, val );
	}
	/** インスタンスの編集終了を宣言する */
	this.done = done;
}
