import $ from 'jquery';
import iterate79 from 'iterate79';
import TextProcessor from './processor/TextProcessor.js';
import BroccoliProcessor from './processor/BroccoliProcessor.js';

export default function ExcecuteContentsProcessor(main, contentsPath, contentsDetail, input){

	/**
	 * コンテンツの加工処理を実行する
	 */
	this.execute = async function(){
		console.log('----- TODO: under construction');

		return new Promise(async (resolve, reject)=>{

			switch(contentsDetail.editor_mode){
				case ".not_exists":
				case ".page_not_exists":
					break;

				case "html.gui":
					console.log('----- TODO: Broccoli processor: under construction');
					break;

				case "html":
				case "md":
				default:
					// コードを加工して保存する
					const textProcessor = new TextProcessor(main, contentsPath, contentsDetail, input);
					const result = await textProcessor.execute();
					break;
			}

			resolve({
				'result': true,
			});
		});
	}

}
