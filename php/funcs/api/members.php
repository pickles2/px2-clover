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
		$rtn['list'] = $this->clover->auth()->get_admin_user_list();

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}

	/**
	 * 新規で追加
	 */
	public function create_new( $user_info ){
		$rtn = $this->clover->auth()->create_admin_user( $user_info );

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}

	/**
	 * 更新
	 */
	public function update( $target_id, $user_info ){
		$rtn = $this->clover->auth()->update_admin_user_info( $target_id, $user_info );

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}

	/**
	 * 削除
	 */
	public function delete( $target_id ){
		$rtn = $this->clover->auth()->delete_admin_user_info( $target_id );

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}
}
