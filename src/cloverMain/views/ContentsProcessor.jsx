import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import iterate79 from 'iterate79';
import Link from '../components/Link';
import ExcecuteContentsProcessor from './ContentsProcessor_files/js/ExcecuteContentsProcessor.js';

export default function ContentsProcessor(props){

	const main = useContext(MainContext);
	const [status, setStatus] = useState({});

	const isAuthorized = (main.bootupInfoLoaded
		&& main.bootupInfo.authorization.write_file_directly
		&& main.bootupInfo.authorization.server_side_scripting);

	function executeContentsProcessor(event){
		const $form = $(event.target);
		const input = {
			targetPath: $form.find('[name=target_path]').val(),
			scriptSourceProcessor: $form.find('[name=script_source_processor]').val(),
			scriptInstanceProcessor: $form.find('[name=script_instance_processor]').val(),
			isDryrun: $form.find('[name=is_dryrun]').prop('checked'),
		};

		main.px2utils.pxCmd(
			`/?PX=px2dthelper.get.list_all_contents`,
			{},
			function( response ){
				if( !response.result ){
					alert('Errored.');
					return;
				}

				iterate79.ary(
					response.all_contents,
					async function(it, contentsDetail, contentsPath){
						const excecuteContentsProcessor = new ExcecuteContentsProcessor(main, contentsPath, contentsDetail, input);
						const result = await excecuteContentsProcessor.execute();
						console.log('-- result:', result);
						it.next();
					},
					async function(){
						console.log('------- Completed!');
						alert('Completed!');
					}
				);
			}
		);
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
				<p><select name="snippet_for_script_source_processor" className="px2-input" onChange={()=>{}}>
					<option value="">サンプルコードを選択してください (注意! - 現在のコードは消去されます)</option>
				</select></p>
				<pre className="cont-code"><code>function srcProcessor( codes, type, next ){"{"}
<textarea name="script_source_processor" className="px2-input px2-input--block" rows="12" defaultValue="// next() に加工後の `codes` を渡して、次の処理へ進む。
next(codes);" onChange={()=>{}}></textarea>{"}"}</code></pre>

				<h2>インスタンス加工スクリプト</h2>
				<p><select name="snippet_for_script_instance_processor" className="px2-input" onChange={()=>{}}>
					<option value="">サンプルコードを選択してください (注意! - 現在のコードは消去されます)</option>
				</select></p>
				<pre className="cont-code"><code>function( editor ){"{"}
<textarea name="script_instance_processor" className="px2-input px2-input--block" rows="12" defaultValue="// editor.done() を呼び出して、次の処理へ進む。
editor.done();" onChange={()=>{}}></textarea>{"}"}</code></pre>

				<p><label><input type="checkbox" name="is_dryrun" value="dryrun" onChange={()=>{}} /> Dry Run</label></p>
				<p className="px2-text-align-center">
					<button className="px2-btn px2-btn--primary">すべてのコンテンツを一括加工する</button>
				</p>
			</form>

		</>
	);
}
