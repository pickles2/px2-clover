import $ from 'jquery';
import iterate79 from 'iterate79';
import BroccoliEditor from './BroccoliEditor/BroccoliEditor.js';
import TextProcessor from './TextProcessor.js';

export default function BroccoliProcessor(main, contentsPath, contentsDetail, input){

	/**
	 * コードを加工して保存する
	 */
	this.execute = async function(){
		console.log('----- TODO: Broccoli processor: under construction');
		return new Promise(async (resolve, reject)=>{

			// コードを取得する
			const response = await getContentsCodes();

			// コードを加工する
			console.log('=-=-=-=-=-= Broccoli codes:', response);
			const broccoliEditor = new BroccoliEditor(response.contentsDataJson);
			broccoliEditor.each(function( editor ){
				try {
					eval(input.scriptInstanceProcessor.toString());
				} catch (e) {
					console.error('eval ERROR', e);
					log('eval ERROR');
					editor.done();
				}
			});
			const logAll = await broccoliEditor.run();
			console.log('--- logAll', logAll);

			// 加工後のコードを保存する
			const result = await saveContentsCodes(response.contentsDataJson);

			// Broccoliコンテンツをリビルドする
			await rebuildContents();

			resolve(result);
		});
	}



	/**
	 * コンテンツのコードを取得する
	 */
	async function getContentsCodes(){
		const px2ce_param = {
			api: "broccoliBridge",
			forBroccoli: {
				api: 'getBootupInfomations',
				options: {},
			},
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
	async function saveContentsCodes(dataJson){
		return new Promise(async (resolve, reject)=>{
			if(input.isDryrun){
				resolve({});
				return;
			}

			const px2ce_param = {
				api: "broccoliBridge",
				forBroccoli: {
					api: 'saveContentsData',
					options: {
						data: dataJson,
					},
				},
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
	 * Broccoliコンテンツをリビルドする
	 */
	async function rebuildContents(){
		return new Promise(async (resolve, reject)=>{
			if(input.isDryrun){
				resolve({});
				return;
			}

			const px2ce_param = {
				api: "broccoliBridge",
				forBroccoli: {
					api: 'updateContents',
					options: {
						lang: 'ja',
					},
				},
				page_path: contentsPath,
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
}
