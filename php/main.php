<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover
 */
class main{

	/** Picklesオブジェクト */
	private $px;

	/** PXコマンド名 */
	private $command = array();

	/** px2dtconfig */
	private $px2dtconfig;

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

		array_push(
			$px->conf()->funcs->before_content,
			__CLASS__.'::'.__FUNCTION__.'_pxcmd()'
		);

		array_push(
			$px->conf()->funcs->processor->html,
			__CLASS__.'::'.__FUNCTION__.'_after_html()'
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
		}, true);

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

		$src = $px->bowl()->get( 'main' );

		ob_start(); ?>
<div style="position:fixed; right: 10px; bottom: 10px;">
<button type="button" onclick="location.href='?PX=admin';">Pickles 2 Clover</button>
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
	}

	/**
	 * CMS管理画面を実行する
	 */
	private function kick(){
		if( !$this->px->req()->is_cmd() ){
			ob_start(); ?>
<p>Pickles 2 Clover</p>
<p><a href="<?= htmlspecialchars($this->px->href( $this->px->req()->get_request_file_path() )); ?>">戻る</a></p>
<?php
			echo ob_get_clean();
			exit;
		}
	
		echo '{"title":"Pickles 2 Clover",'."\n";
		echo '"result":false,'."\n";
		echo '"message":"No Contents."'."\n";
		echo '}'."\n";
		exit;
	}
}
