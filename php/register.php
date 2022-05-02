<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover
 */
class register{

	/** Picklesオブジェクト */
	private $px;

	/** プラグインオプション */
	private $options;

	/** px2-clover */
	private $clover;


	/**
	 * entry
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	static public function clover( $px = null, $options = null ){
		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}

		if( !$px->req()->is_cmd() ){
			(new clover( $px, $options ))->initializer()->initialize();
		}

		if( !$px->req()->is_cmd() ){
			$auth_needs = false;
			if( isset($options->protect_preview) && $options->protect_preview ){
				// プレビュー全体で認証を要求する
				$auth_needs = true;
			}
			if( is_string($px->req()->get_param('PX')) && strlen($px->req()->get_param('PX')) && $px->req()->get_param('PX') !== 'admin.logout' ){
				// PXコマンド全体で認証を要求する
				$auth_needs = true;
			}
			if( $auth_needs ){
				(new clover( $px, $options ))->auth()->auth();
			}
		}

		$px->conf()->funcs->before_content['px2-clover'] = __CLASS__.'::admin_console('.json_encode($options).')';
		$px->conf()->funcs->before_output['px2-clover'] = __CLASS__.'::before_output('.json_encode($options).')';

		return;
	}

	/**
	 * entry: CMS管理画面を登録する
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	static public function admin_console( $px = null, $options = null ){
		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}

		$command = $px->get_px_command();
		if( count($command) && $command[0] == 'admin' ){
			// クライアントリソースを公開ディレクトリに配置
			$client_resources_dist = $px->realpath_plugin_files('/');
			if( !is_file( $client_resources_dist.'cloverMain/cloverMain.js' ) || $px->fs()->is_newer_a_than_b(__DIR__.'/../public/resources/'.'cloverMain/cloverMain.js', $client_resources_dist.'cloverMain/cloverMain.js') ){
				$px->fs()->copy_r(__DIR__.'/../public/resources/', $client_resources_dist);
			}
		}

		$px->pxcmd()->register('admin', function($px) use ($options){
			(new self( $px, $options ))->route();
		});

		return;
	}

	/**
	 * entry: Before Output
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	static public function before_output( $px = null, $options = null ){
		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}
		if( $px->req()->get_param('PX') || $px->req()->get_param('PICKLES2_CONTENTS_EDITOR') ){
			return;
		}
		if( $px->is_publish_tool() ){
			return;
		}
		if( !preg_match('/(?:\.html?|\/)$/', $px->req()->get_request_file_path()) ){
			return;
		}

		$src = $px->bowl()->get( 'main' );

		ob_start(); ?>
<div style="position:fixed; right: 10px; bottom: 10px;">
<?php if( $px->conf()->allow_pxcommands ){ ?>
<button type="button" onclick="location.href='?PX=admin.page_info';">ページ情報</button>
<button type="button" onclick="location.href='?PX=admin.edit_contents&backto=preview';">記事編集</button>
<?php }else{ ?>
<p>Pickles 2 Clover を利用するには、<code>$conf-&gt;allow_pxcommands</code>フラグを <code>1</code> に設定してください。</p>
<?php } ?>
</div>
<?php
		$src .= ob_get_clean();

		$px->bowl()->replace( $src, 'main' );

		return;
	}


	/**
	 * Constructor
	 *
	 * @param object $px $pxオブジェクト
	 */
	private function __construct( $px, $options ){
		$this->px = $px;
		$this->clover = new clover( $this->px, $options );
	}


	/**
	 * CMS管理画面をルーティングする
	 */
	private function route(){
		$this->command = $this->px->get_px_command();

		if( !$this->px->req()->is_cmd() ){
			switch( isset($this->command[1]) ? $this->command[1] : '' ){
				case 'logout':
					// --------------------------------------
					// ログアウト
					$this->clover->auth()->logout();
					break;
			}
			$this->clover->auth()->auth();
		}

		if( !$this->px->req()->is_cmd() ){
			// --------------------------------------
			// ブラウザへの応答
			switch( isset($this->command[1]) ? $this->command[1] : '' ){
				case 'api':
					// --------------------------------------
					// API
					switch( isset($this->command[2]) ? $this->command[2] : '' ){
						case 'get_page_info':
							$app = new funcs\api\pageInfo($this->clover);
							$app->get();
							break;
						case 'get_profile':
							$app = new funcs\api\profile($this->clover);
							$app->get();
							break;
						case 'update_profile':
							$this->clover->allowed_method('post');
							$app = new funcs\api\profile($this->clover);
							$app->update();
							break;
					}

				case 'edit_contents':
					// --------------------------------------
					// コンテンツを編集
					$app = new funcs\editContents\editContents($this->clover);
					$app->start();
					break;

				default:
					// --------------------------------------
					// フロントエンド汎用テンプレート
					echo $this->clover->view()->bind(
						'/cont/cloverMain.twig',
						array(
							'url_backto' => $this->px->href( $this->px->req()->get_request_file_path() ),
						)
					);
					exit;
					break;
			}
		} else {
			// --------------------------------------
			// CLIへの応答 (非対応)
			echo '{"title":"Pickles 2 Clover",'."\n";
			echo '"result":false,'."\n";
			echo '"message":"Pickles 2 Clover is not support CLI."'."\n";
			echo '}'."\n";
			exit;
		}
	}
}
