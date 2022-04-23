<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover
 */
class register{

	/** Picklesオブジェクト */
	private $px;

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
			$auth_needs = false;
			if( isset($options->protect_preview) && $options->protect_preview ){
				// プレビュー全体で認証を要求する
				$auth_needs = true;
			}
			if( !is_null($px->req()->get_param('PX')) && $px->req()->get_param('PX') !== 'admin.logout' ){
				// PXコマンド全体で認証を要求する
				$auth_needs = true;
			}
			if( $auth_needs ){
				(new clover( $px ))->auth()->auth();
			}
		}

		$px->conf()->funcs->before_content['px2-clover'] = __CLASS__.'::admin_console('.json_encode($options).')';

		array_push( $px->conf()->funcs->processor->html, __CLASS__.'::after_html('.json_encode($options).')' );

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

		$px->pxcmd()->register('admin', function($px){
			(new self( $px ))->route();
		});

		return;
	}

	/**
	 * entry: after HTML
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	static public function after_html( $px = null, $options = null ){
		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}
		if( $px->req()->get_param('PX') || $px->req()->get_param('PICKLES2_CONTENTS_EDITOR') ){
			return;
		}
		if( $px->is_publish_tool() ){
			return;
		}

		$src = $px->bowl()->get( 'main' );

		ob_start(); ?>
<div style="position:fixed; right: 10px; bottom: 10px;">
<?php if( $px->conf()->allow_pxcommands ){ ?>
<button type="button" onclick="location.href='?PX=admin';">Pickles 2 Clover</button>
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
	private function __construct( $px ){
		$this->px = $px;
		$this->clover = new clover( $this->px );
	}


	/**
	 * CMS管理画面をルーティングする
	 */
	private function route(){
		$this->command = $this->px->get_px_command();

		if( !$this->px->req()->is_cmd() ){
			switch( @$this->command[1] ){
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
			switch( @$this->command[1] ){
				case 'edit_contents':
					// --------------------------------------
					// コンテンツを編集
					$app = new funcs\editContents\editContents($this->clover);
					$app->start();
					break;

				default:
					// --------------------------------------
					// ダッシュボード
					echo $this->clover->view()->bind(
						'/cont/pageInfo/pageInfo.twig',
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
