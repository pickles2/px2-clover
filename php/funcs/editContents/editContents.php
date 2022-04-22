<?php
namespace tomk79\pickles2\px2clover\funcs\editContents;

/**
 * px2-clover: コンテンツ編集機能
 */
class editContents{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;


	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
	}

	public function start(){
		ob_start(); ?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<title>contents editor</title>
<?php

		$path_client_resources = $this->px->path_plugin_files('/');
		$client_resources_dist = $this->px->realpath_plugin_files('/edit-contents/');
		$this->px->fs()->mkdir_r($client_resources_dist); // ディレクトリが予め存在していないとファイル生成は失敗する。

		// jQuery
		echo '<script src="'.htmlspecialchars($path_client_resources.'jquery-3.6.0.min.js').'"></script>'."\n";

		// Ace Editor
		echo '<script src="'.htmlspecialchars($path_client_resources.'ace/ace.js').'"></script>'."\n";

		// Bootstrap 5
		echo '<script src="'.htmlspecialchars($path_client_resources.'bootstrap5/js/bootstrap.min.js').'"></script>'."\n";

		// Summernote Editor
		echo '<script src="'.htmlspecialchars($path_client_resources.'summernote/summernote.js').'"></script>'."\n";

		// Keypress
		echo '<script src="'.htmlspecialchars($path_client_resources.'dmauro-Keypress/keypress-2.1.5.min.js').'"></script>'."\n";

		echo '<link rel="stylesheet" href="'.htmlspecialchars($path_client_resources.'px2style/dist/px2style.css').'" />'."\n";
		echo '<script src="'.htmlspecialchars($path_client_resources.'px2style/dist/px2style.js').'"></script>'."\n";


		$res = $this->px->internal_sub_request('/?PX=px2dthelper.px2ce.client_resources&dist='.urlencode($client_resources_dist));
		$res = json_decode($res, true);
		foreach( $res['css'] as $css ){
			echo '<link rel="stylesheet" href="'.htmlspecialchars($path_client_resources.'edit-contents/'.$css).'" />'."\n";
		}
		foreach( $res['js'] as $js ){
			echo '<script src="'.htmlspecialchars($path_client_resources.'edit-contents/'.$js).'"></script>'."\n";
		}
?>
	<style>
		:root {
			--px2-main-color: #00a0e6;
			--px2-text-color: #333;
			--px2-background-color: #f9f9f9;
		}
		html, body {
			padding: 0; margin: 0;
			height: 100%;
		}
		body {
			display: flex;
			justify-content: center;
			align-items: stretch;
			align-content: stretch;
		}
		.pickles2-contents-editor--toolbar {
			box-sizing: border-box; /* TODO: px2ceの側に書くべき */
		}
		#cont-canvas {
			width: 100%;
			height: 100%;
		}
	</style>
</head>
<body>

<div id="cont-canvas"></div>


<script type="text/javascript">
	(function(){
		var page_path = <?= json_encode($this->px->req()->get_request_file_path(), JSON_UNESCAPED_SLASHES); ?>;
		var theme_id = '';
		var layout_id = '';
		var target_mode = 'page_content';
		// .envよりプレビューサーバーのURLを取得
		var preview_url = '?';
		var resizeTimer;
		var csrf_token = <?= json_encode($this->clover->auth()->get_csrf_token(), JSON_UNESCAPED_SLASHES); ?>;

		if( page_path ){
			target_mode = 'page_content';
		}else if( theme_id && layout_id ){
			target_mode = 'theme_layout';
			page_path = '/'+theme_id+'/'+layout_id+'.html';
		}

		function base64_encode(orig) { return new Promise(function(rlv){
			var r = new FileReader();
			r.onload = function(){
				var offset = r.result.indexOf(",");
				rlv(r.result.slice(offset+1));
			};
			r.readAsDataURL(new Blob([orig]));
		}); }

		// Px2CE の初期化
		var pickles2ContentsEditor = new Pickles2ContentsEditor(); // px2ce client
		pickles2ContentsEditor.init(
			{
				// いろんな設定値
				// これについては Px2CE の README を参照
				// https://github.com/pickles2/node-pickles2-contents-editor
				'page_path': page_path , // <- 編集対象ページのパス
				'elmCanvas': document.getElementById('cont-canvas'), // <- 編集画面を描画するための器となる要素
				'preview':{
					'origin': preview_url// プレビュー用サーバーの情報を設定します。
				},
				'lang': 'ja', // language
				'gpiBridge': function(input, callback){
					console.log('====== GPI Request:', input);
					console.log(JSON.stringify(input));
					base64_encode( JSON.stringify(input) ).then((encodedInput) => {
						$.ajax({
							"url": '?PX=px2dthelper.px2ce.gpi', // TODO: GPIのパス
							"method": 'post',
							'data': {
								'data': encodedInput,
								'ADMIN_USER_CSRF_TOKEN': csrf_token,
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
					});
					return;
				},
				'complete': function(){
					window.location.href = '?PX=admin';
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
