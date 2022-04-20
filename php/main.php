<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover
 */
class main{

	/** Picklesオブジェクト */
	private $px;

	/** 認証機能 */
	private $auth;


	/**
	 * entry
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	static public function register( $px = null, $options = null ){
		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}

		if( !$px->req()->is_cmd() ){
			if( isset($options->protect_preview) && $options->protect_preview ){
				(new auth( $px ))->auth();
			}
			if( !is_null($px->req()->get_param('PX')) && $px->req()->get_param('PX') !== 'admin.logout' ){
				(new auth( $px ))->auth();
			}
		}

		array_push(
			$px->conf()->funcs->before_content,
			__CLASS__.'::'.__FUNCTION__.'_pxcmd('.json_encode($options).')'
		);

		array_push(
			$px->conf()->funcs->processor->html,
			__CLASS__.'::'.__FUNCTION__.'_after_html('.json_encode($options).')'
		);

		return;
	}

	/**
	 * entry: pxcmd
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	static public function register_pxcmd( $px = null, $options = null ){
		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}

		$px->pxcmd()->register('admin', function($px){
			(new self( $px ))->kick();
		});

		return;
	}

	/**
	 * entry: after HTML
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	static public function register_after_html( $px = null, $options = null ){
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
		$this->auth = new auth( $this->px );
	}

	/**
	 * CMS管理画面を実行する
	 */
	private function kick(){
		$this->command = $this->px->get_px_command();

		if( !$this->px->req()->is_cmd() ){
			switch( @$this->command[1] ){
				case 'logout':
					// --------------------------------------
					// ログアウト
					$this->auth->logout();
					break;
			}
			$this->auth->auth();
		}

		if( !$this->px->req()->is_cmd() ){
			// --------------------------------------
			// ブラウザへの応答
			switch( @$this->command[1] ){
				case 'edit_contents':
					// --------------------------------------
					// コンテンツを編集
					$app = new funcs\editContents\editContents($this->px);
					$app->start();
					break;

				default:
					// --------------------------------------
					// ダッシュボード
					ob_start(); ?>
<p>Pickles 2 Clover</p>
<p><a href="?PX=admin.edit_contents">コンテンツを編集する</a></p>
<p><a href="<?= htmlspecialchars($this->px->href( $this->px->req()->get_request_file_path() )); ?>">戻る</a></p>
<p><a href="?PX=admin.logout">ログアウト</a></p>
<?php
					echo ob_get_clean();
					exit;
					break;
			}
		} else {
			// --------------------------------------
			// CLIへの応答 (非対応)
			echo '{"title":"Pickles 2 Clover",'."\n";
			echo '"result":false,'."\n";
			echo '"message":"No Contents."'."\n";
			echo '}'."\n";
			exit;
		}
	}
}
