<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: メンバー管理API
 */
class members{

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
	 * 一覧を取得
	 */
	public function get_list(){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		// members
		$rtn['members'] = array($this->clover->auth()->get_login_user_info());

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}

}
