<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: プロフィール情報API
 */
class profile{

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

		// profile
		$rtn['profile'] = $this->clover->auth()->get_login_user_info();

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}

	/**
	 * 更新
	 */
	public function update(){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$new_profile = array(
			'id' => $this->px->req()->get_param('id'),
			'name' => $this->px->req()->get_param('name'),
			'lang' => $this->px->req()->get_param('lang'),
			'pw' => $this->px->req()->get_param('pw'),
		);
		$result = $this->clover->auth()->update_login_user_info($new_profile);

		// profile
		$rtn['profile'] = $this->clover->auth()->get_login_user_info();

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}
}
