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
<p>Pickles 2 Clover</p>
<p>コンテンツ編集機能は開発中です。</p>
<p><a href="?PX=admin">戻る</a></p>
<p><a href="?PX=admin.logout">ログアウト</a></p>
<?php
		echo ob_get_clean();
		exit;
	}
}
