/**
 * broccoli-processor/logger.js
 */
export default function Logger(){
	var logs = {};

	/** メッセージを記録する */
	this.log = function( instancePath, message ){
		if( !logs[instancePath] ){
			logs[instancePath] = [];
		}
		logs[instancePath].push(message);
		return true;
	}

	/** すべての記録を取得する */
	this.getAll = function(){
		return logs;
	}
}
