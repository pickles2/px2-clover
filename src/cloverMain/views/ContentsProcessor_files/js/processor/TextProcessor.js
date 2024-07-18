import $ from 'jquery';
import iterate79 from 'iterate79';

export default function TextProcessor(main, logger, contentsPath, contentsDetail, input){

	/**
	 * コードを加工して保存する
	 */
	this.execute = async function(){
		return new Promise(async (resolve, reject)=>{

			// コードを取得する
			const codes = await getContentsCodes();

			// コードを加工する
			const newCodes = await srcProcessor(contentsPath, codes, contentsDetail.editor_mode, logger);

			// 加工後のコードを保存する
			const result = await saveContentsCodes(newCodes);

			resolve(result);
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
					resolve(response);
				}
			);
		});
	}

	/**
	 * HTMLソース加工
	 */
	async function srcProcessor( contentsPath, codes, type, logger ){
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
