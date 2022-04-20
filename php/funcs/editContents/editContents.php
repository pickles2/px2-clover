<?php
namespace tomk79\pickles2\px2clover\funcs\editContents;

/**
 * px2-clover: コンテンツ編集機能
 */
class editContents{

	/** Picklesオブジェクト */
	private $px;


	/**
	 * Constructor
	 *
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $px ){
		$this->px = $px;
	}

	public function start(){
		ob_start(); ?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>contents editor</title>
<?php

		$client_resources_dist = $this->px->realpath_plugin_files('/px2-clover/');
		$path_client_resources = $this->px->path_plugin_files('/px2-clover/');
		$this->px->fs()->mkdir_r($client_resources_dist); // ディレクトリが予め存在していないとファイル生成は失敗する。

		$res = $this->px->internal_sub_request('/?PX=px2dthelper.px2ce.client_resources&dist='.urlencode($client_resources_dist));
		$res = json_decode($res, true);

		foreach( $res['css'] as $css ){
			echo '<link rel="stylesheet" href="'.htmlspecialchars($path_client_resources.$css).'" />'."\n";
		}

		echo '<script src="data:text/javascript;base64,'.htmlspecialchars(base64_encode( file_get_contents(__DIR__.'/../../../resources/jquery-3.6.0.min.js') )).'"></script>'."\n";
		foreach( $res['js'] as $js ){
			echo '<script src="'.htmlspecialchars($path_client_resources.$js).'"></script>'."\n";
		}
?>
</head>
<body>
<p>Pickles 2 Clover</p>
<p>コンテンツ編集機能は開発中です。</p>
<p><a href="?PX=admin">戻る</a></p>
<p><a href="?PX=admin.logout">ログアウト</a></p>


<div id="canvas" style="height: 400px; width: 100%;"></div>


<script type="text/javascript">
	(function(){
		var page_path = <?= json_encode($this->px->req()->get_request_file_path(), JSON_UNESCAPED_SLASHES); ?>;
		var theme_id = '';
		var layout_id = '';
		var target_mode = 'page_content';
		// .envよりプレビューサーバーのURLを取得
		var preview_url = '?';
		var resizeTimer;

		if( page_path ){
			target_mode = 'page_content';
		}else if( theme_id && layout_id ){
			target_mode = 'theme_layout';
			page_path = '/'+theme_id+'/'+layout_id+'.html';
		}

		// Px2CE の初期化
		var pickles2ContentsEditor = new Pickles2ContentsEditor(); // px2ce client
		pickles2ContentsEditor.init(
			{
				// いろんな設定値
				// これについては Px2CE の README を参照
				// https://github.com/pickles2/node-pickles2-contents-editor
				'page_path': page_path , // <- 編集対象ページのパス
				'elmCanvas': document.getElementById('canvas'), // <- 編集画面を描画するための器となる要素
				'preview':{
					'origin': preview_url// プレビュー用サーバーの情報を設定します。
				},
				'lang': 'ja', // language
				'gpiBridge': function(input, callback){
					console.log('====== GPI Request:', input);
					console.log(JSON.stringify(input));
					$.ajax({
						"url": '?PX=px2dthelper.px2ce.gpi', // TODO: GPIのパス
						"method": 'post',
						'data': {
							'data': btoa(JSON.stringify(input)),
							// _token: '{{ csrf_token() }}'
						},
						"error": function(error){
							console.error('------ GPI Response Error:', typeof(error), error);
							callback(error);
						},
						"success": function(data){
							console.log('------ GPI Response:', typeof(data), data);
							callback(data);
						}
					});
					return;
				},
				'complete': function(){
					window.open('about:blank', '_self').close();
				},
				'clipboard': {
					'set': function( data, type, event, callback ){
						// console.log(data, type, event, callback);
						localStorage.setItem('app-burdock-virtualClipBoard', data);
						if( callback ){
							callback();
						}
					},
					'get': function( type, event, callback ){
						var rtn = localStorage.getItem('app-burdock-virtualClipBoard');
						// console.log(rtn);
						if( callback ){
							callback(rtn);
							return false;
						}
						return rtn;
					}
				},
				'onClickContentsLink': function( uri, data ){
					// TODO: 編集リンクを生成する
					// alert('編集: ' + uri);
				},
				'onMessage': function( message ){
					// ユーザーへ知らせるメッセージを表示する
					px2style.flashMessage(message);
					console.info('message: '+message);
				}
			},
			function(){
				// コールバック
				// 初期化完了！
				console.info('Standby!');

			}
		);

		$(window).on('resize', function(){
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function(){
				if(pickles2ContentsEditor.redraw){
					pickles2ContentsEditor.redraw();
				}
			}, 500);
			return;
		});
	})();
</script>

</body>
</html>
<?php
		echo ob_get_clean();
		exit;
	}
}
