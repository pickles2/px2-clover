<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: Git操作API
 */
class git{

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

	/**
	 * コミットする
	 */
	public function commit(){
		$this->px->header('Content-type: text/json');

		// TODO: git コマンドは Web SAPI から直接実行できないようなので、 scheduler queue に登録する処理を書く。

		$rtn = array();
		$rtn['result'] = false;
		$rtn['message'] = 'Under construction.';

		echo json_encode($rtn);
		exit;
	}

}
