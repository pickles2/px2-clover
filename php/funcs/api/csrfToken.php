<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: CSRFトークンの更新
 */
class csrfToken{

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
	 * 取得
	 */
	public function get(){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';
		$rtn['token'] = $this->clover->auth()->get_csrf_token();

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}
}
