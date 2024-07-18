import $ from 'jquery';
import iterate79 from 'iterate79';
import TextProcessor from './processor/TextProcessor.js';
import BroccoliProcessor from './processor/BroccoliProcessor.js';

export default function ExcecuteContentsProcessor(main, logger, contentsPath, contentsDetail, input){

	/**
	 * コンテンツの加工処理を実行する
	 */
	this.execute = async function(){
		return new Promise(async (resolve, reject)=>{

			switch(contentsDetail.editor_mode){
				case ".not_exists":
				case ".page_not_exists":
					break;

				case "html.gui":
					// コードを加工して保存する
					const broccoliProcessor = new BroccoliProcessor(main, logger, contentsPath, contentsDetail, input);
					const broccoliResult = await broccoliProcessor.execute();
					break;

				case "html":
				case "md":
				default:
					// コードを加工して保存する
					const textProcessor = new TextProcessor(main, logger, contentsPath, contentsDetail, input);
					const textResult = await textProcessor.execute();
					break;
			}

			resolve({
				'result': true,
			});
		});
	}

}
