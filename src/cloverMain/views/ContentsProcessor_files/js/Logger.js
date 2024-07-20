/**
 * broccoli-processor/logger.js
 */
export default function Logger(){
	let logs = {};
	let counter = {};
	let counterInFile = {};
	let contentsPath = '';

	this.setCurrentContentsPath = function(_contentsPath){
		contentsPath = _contentsPath;
	}

	/**
	 * メッセージを記録する
	 */
	this.log = function( message ){
		console.log(`--- ${contentsPath}:`, message);
		if( !logs[contentsPath] ){
			logs[contentsPath] = [];
		}
		logs[contentsPath].push(message);
		return true;
	}

	/**
	 * 出現回数をカウントする
	 */
	this.count = function( key ){
		if( !counter[key] ){
			counter[key] = 0;
		}
		counter[key] ++;
		return true;
	}

	/**
	 * ファイル内での出現回数をカウントする
	 */
	this.countInFile = function( key ){
		if( !counterInFile[contentsPath] ){
			counterInFile[contentsPath] = {};
		}
		if( !counterInFile[contentsPath][key] ){
			counterInFile[contentsPath][key] = 0;
		}
		counterInFile[contentsPath][key] ++;
		return true;
	}

	/**
	 * すべての記録を取得する
	 */
	this.getAll = function(){
		return {
			logs,
			counter,
			counterInFile,
		};
	}
}
