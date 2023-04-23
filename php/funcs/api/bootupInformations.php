<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: 起動時の情報取得
 */
class bootupInformations {

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** Clover Config オブジェクト */
	private $cloverConfig;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
		$this->cloverConfig = new \tomk79\pickles2\px2clover\helpers\config( $clover );
	}

	/**
	 * 取得
	 */
	public function get(){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

        $rtn['bootupInfo'] = array();
        // $rtn['bootupInfo']['cmd_available'] = array();
        // $rtn['bootupInfo']['cmd_available']['php'] = true;
        // $rtn['bootupInfo']['cmd_available']['composer'] = true;
        // $rtn['bootupInfo']['cmd_available']['git'] = true;

        $rtn['bootupInfo']['git'] = array();
        // $rtn['bootupInfo']['git']['available'] = !!$rtn['bootupInfo']['cmd_available']['git'];

        // git init 済みか？
        $realpath_git_root = $this->clover->realpath_git_root();
        $rtn['bootupInfo']['git']['is_init'] = (is_string($realpath_git_root) && strlen($realpath_git_root));

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}
}
