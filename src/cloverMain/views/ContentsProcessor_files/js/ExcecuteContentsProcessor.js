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
					// コードを取得する
					const response = await getContentsCodes();

					// コードを加工する
					const codes = await srcProcessor(response, contentsDetail.editor_mode);

					// 加工後のコードを保存する
					const result = await saveContentsCodes(codes);
					break;
			}

			resolve({
				'result': true,
			});
		});
	}


	/**
	 * コンテンツのコードを取得する
	 */
	async function getContentsCodes(){
		const px2ce_param = {
			api: "getContentsSrc",
		};
		return new Promise(async (resolve, reject)=>{
			main.px2utils.pxCmd(
				contentsPath+`?PX=px2dthelper.px2ce.gpi&data=`+encodeURIComponent(await main.px2utils.base64_encode_async(JSON.stringify(px2ce_param))),
				{},
				function( response ){
					console.log('gpi response:', response);
					resolve(response);
				}
			);
		});
	}

	/**
	 * コンテンツのコードを保存する
	 */
	async function saveContentsCodes(codes){
		return new Promise(async (resolve, reject)=>{
			if(input.isDryrun){
				resolve({});
				return;
			}

			const px2ce_param = {
				api: "saveContentsSrc",
				codes: codes,
			};
			main.px2utils.pxCmd(
				contentsPath+`?PX=px2dthelper.px2ce.gpi&data=`+encodeURIComponent(await main.px2utils.base64_encode_async(JSON.stringify(px2ce_param))),
				{},
				function( response ){
					console.log('gpi response:', response);
					resolve(response);
				}
			);
		});
	}

	// HTMLソース加工
	async function srcProcessor( codes, type, next ){
		return new Promise(async (resolve, reject)=>{
			const next = (codes)=> {
				resolve(codes);
			};
			try {
				eval(input.scriptSourceProcessor.toString());
			} catch (e) {
				console.error('eval ERROR:', input.scriptSourceProcessor);
				next(codes);
			}
		});
	}

}
