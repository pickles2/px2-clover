<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover
 */
class clover{

	/** Picklesオブジェクト */
	private $px;

	/** 認証機能 */
	private $auth;

	/**
	 * Constructor
	 *
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $px ){
		$this->px = $px;
		$this->auth = new auth( $this->px );
	}


	/** auth */
	public function auth(){
		return $this->auth;
	}

	/** px */
	public function px(){
		return $this->px;
	}

}
