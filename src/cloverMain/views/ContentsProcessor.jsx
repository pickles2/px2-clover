import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import iterate79 from 'iterate79';
import Link from '../components/Link';
import ExcecuteContentsProcessor from './ContentsProcessor_files/js/ExcecuteContentsProcessor.js';
import Logger from './ContentsProcessor_files/js/Logger.js';

export default function ContentsProcessor(props){

	const main = useContext(MainContext);
	const [status, setStatus] = useState({});

	const isAuthorized = (main.bootupInfoLoaded
		&& main.bootupInfo.authorization.write_file_directly
		&& main.bootupInfo.authorization.server_side_scripting);

	/**
	 * コンテンツの一括加工を実行する
	 */
	function executeContentsProcessor(event){
		const $form = $(event.target);
		const input = {
			targetPath: $form.find('[name=target_path]').val(),
			scriptSourceProcessor: $form.find('[name=script_source_processor]').val(),
			scriptInstanceProcessor: $form.find('[name=script_instance_processor]').val(),
			isDryrun: $form.find('[name=is_dryrun]').prop('checked'),
		};

		const $body = $( main.cloverUtils.bindTwig(
			require('-!text-loader!./ContentsProcessor_files/templates/modal_start.twig'),
			{
				"lockedField": {
					"logical_path": "lock",
				},
			}
		) );

		const $executeModal = px2style.modal({
			"title": "コンテンツの一括加工",
			"body": $body,
			"width": 800,
		}, function(){
			main.px2utils.pxCmd(
				`/?PX=px2dthelper.get.list_all_contents`,
				{},
				function( response ){
					if( !response.result ){
						alert('Errored.');
						return;
					}

					const logger = new Logger();

					$body.html( main.cloverUtils.bindTwig(
						require('-!text-loader!./ContentsProcessor_files/templates/modal_base.twig'),
						{
							"contentsList": response.all_contents,
						}
					) );

					const $result = $('.cont-result');

					iterate79.ary(
						response.all_contents,
						async function(it, contentsDetail, contentsPath){
							logger.setCurrentContentsPath(contentsPath);
							const $progress = $body.find(`tr[data-path-content="${contentsPath}"] .cont-progress`);
							$progress.text('progress...');

							const excecuteContentsProcessor = new ExcecuteContentsProcessor(main, logger, contentsPath, contentsDetail, input);
							const result = await excecuteContentsProcessor.execute();
							console.log('-- result:', result);

							$progress.text('done');

							$result.val(JSON.stringify(logger.getAll(), null, 2));

							it.next();
						},
						async function(){
							console.log('------- Completed!', logger.getAll());
							$result.val(JSON.stringify(logger.getAll(), null, 2));
							setTimeout(()=>{
								alert('Completed!');
							}, 100);
						}
					);
				}
			);
		});
	}

	if( !isAuthorized ){
		return (
			<>
				<p>Not Authorized.</p>
			</>
		);
	}

	return (
		<>
			<form onSubmit={function(event){event.preventDefault();executeContentsProcessor(event);}}>
				<div className="px2-p">
					<ul>
						<li>この処理は、たくさんのファイルに一度に変更を加えます。</li>
						<li>すべてのファイルを 実行の前に状態をコミットし、実行後にもコミットすることを強くお勧めします。</li>
						<li><code>console.log()</code> に送った情報は、 デベロッパーツール 上で確認することができます。</li>
					</ul>
				</div>

				<h2>パス</h2>
				<p><input type="text" name="target_path" value="/*" className="px2-input px2-input--block" onChange={()=>{}} /></p>

				<h2>ソース加工スクリプト</h2>
				{/* <p><select name="snippet_for_script_source_processor" className="px2-input" onChange={()=>{}}>
					<option value="">サンプルコードを選択してください (注意! - 現在のコードは消去されます)</option>
				</select></p> */}
				<pre className="cont-code"><code>function( codes, info, logger, next ){"{"}
<textarea name="script_source_processor" className="px2-input px2-input--block" rows="12"
defaultValue="/*
* codes Object
* - codes.html = コンテンツのHTMLコード
* - codes.css = コンテンツのCSSコード
* - codes.js = コンテンツのJSコード
*
* info Object
* - info.contentsPath = コンテンツのパス
* - info.editorType = エディタの種類
*/
// next() に加工後の `codes` を渡して、次の処理へ進む。
next(codes);" onChange={()=>{}}></textarea>{"}"}</code></pre>

				<h2>インスタンス加工スクリプト</h2>
				{/* <p><select name="snippet_for_script_instance_processor" className="px2-input" onChange={()=>{}}>
					<option value="">サンプルコードを選択してください (注意! - 現在のコードは消去されます)</option>
				</select></p> */}
				<pre className="cont-code"><code>function( instance, info, logger, next ){"{"}
<textarea name="script_instance_processor" className="px2-input px2-input--block" rows="12"
defaultValue="/*
* instance Object
* - instance.modId = モジュールID
* - instance.fields = フィールドデータ
*
* info Object
* - info.contentsPath = コンテンツのパス
* - info.editorType = エディタの種類
* - info.instancePath = インスタンスのパス
*
* logger Object
* - logger.log(string) = ログを出力する
*/
// next() に加工後のインスタンスを渡して、次の処理へ進む。
next(instance);" onChange={()=>{}}></textarea>{"}"}</code></pre>

				<p><label><input type="checkbox" name="is_dryrun" value="dryrun" defaultChecked={true} onChange={()=>{}} /> 実行結果を保存しない (Dry run)</label></p>
				<p className="px2-text-align-center">
					<button className="px2-btn px2-btn--primary">すべてのコンテンツを一括加工する</button>
				</p>
			</form>

		</>
	);
}
