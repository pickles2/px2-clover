/**
 * broccoli-processor/logger.js
 */
export default function Logger(){
	var logs = {};
	let contentsPath = '';

	this.setCurrentContentsPath = function(_contentsPath){
		contentsPath = _contentsPath;
	}

	/** メッセージを記録する */
	this.log = function( message ){
		if( !logs[contentsPath] ){
			logs[contentsPath] = [];
		}
		logs[contentsPath].push(message);
		return true;
	}

	/** すべての記録を取得する */
	this.getAll = function(){
		return {
			logs,
		};
	}
}
