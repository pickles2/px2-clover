import $ from 'jquery';
import iterate79 from 'iterate79';

export default function ExcecuteContentsProcessor(contentsPath, contentsDetail){
	console.log(contentsPath, contentsDetail);

	/**
	 * コンテンツの加工処理を実行する
	 */
	this.execute = async function(inputTargetPath, inputScriptSourceProcessor, inputScriptInstanceProcessor, inputIsDryrun){
		console.log('----- TODO: under construction');
		console.log(inputTargetPath, inputScriptSourceProcessor, inputScriptInstanceProcessor, inputIsDryrun);
		return new Promise((resolve, reject)=>{
			resolve({'result': true,});
		});
	}
}
