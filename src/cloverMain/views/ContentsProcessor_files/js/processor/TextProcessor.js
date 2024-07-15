import $ from 'jquery';
import iterate79 from 'iterate79';

export default function TextProcessor(main, contentsPath, contentsDetail, input){

	/**
	 * コードを加工して保存する
	 */
	this.execute = async function(){
		// コードを取得する
		const response = await getContentsCodes();

		// コードを加工する
		const codes = await srcProcessor(response, contentsDetail.editor_mode);

		// 加工後のコードを保存する
		const result = await saveContentsCodes(codes);
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
					// console.log('gpi response:', response);
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
					// console.log('gpi response:', response);
					resolve(response);
				}
			);
		});
	}

	/**
	 * HTMLソース加工
	 */
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
