import $ from 'jquery';
import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import iterate79 from 'iterate79';
import Link from '../components/Link';

export default function ContentsProcessor(props){

	const main = useContext(MainContext);
	const [status, setStatus] = useState({});

	return (
		<>
			<form onSubmit={function(event){event.preventDefault();}}>
				<div className="px2-p">
					<ul>
						<li>この処理は、たくさんのファイルに一度に変更を加えます。</li>
						<li>すべてのファイルを 実行の前に状態をコミットし、実行後にもコミットすることを強くお勧めします。</li>
						<li><code>console.log()</code> に送った情報は、 デベロッパーツール 上で確認することができます。</li>
					</ul>
				</div>

				<h2>パス</h2>
				<p><input type="text" name="target_path" value="/*" className="px2-input" onChange={()=>{}} /></p>

				<h2>ソース加工スクリプト</h2>
				<p><select name="snippet_for_script_source_processor" className="px2-input" onChange={()=>{}}>
					<option value="">サンプルコードを選択してください (注意! - 現在のコードは消去されます)</option>
				</select></p>
				<pre className="cont-code"><code>function srcProcessor( src, type, next ){"{"}
var supply = {"{"}
	// supplying libs
	'cheerio': require('cheerio'),
	'iterate79': require('iterate79')
{"}"};
<textarea name="script_source_processor" className="px2-input px2-input--block" rows="12" defaultValue="// next() に加工後の src を渡して、次の処理へ進む。
next(src);" onChange={()=>{}}></textarea>{"}"}</code></pre>

				<h2>インスタンス加工スクリプト</h2>
				<p><select name="snippet_for_script_instance_processor" className="px2-input" onChange={()=>{}}>
					<option value="">サンプルコードを選択してください (注意! - 現在のコードは消去されます)</option>
				</select></p>
				<pre className="cont-code"><code>function( editor ){"{"}
<textarea name="script_instance_processor" className="px2-input px2-input--block" rows="12" defaultValue="// editor.done() を呼び出して、次の処理へ進む。
editor.done();" onChange={()=>{}}></textarea>{"}"}</code></pre>

				<p><label><input type="checkbox" name="is_dryrun" value="dryrun" onChange={()=>{}} /> Dry Run</label></p>
				<p><button className="px2-btn px2-btn--primary px2-btn--block">すべてのコンテンツを一括加工する</button></p>
			</form>

		</>
	);
}
