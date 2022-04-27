<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: コンテンツ編集機能
 */
class getPageInfo{

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
	 * コンテンツ編集画面
	 */
	public function start(){
		$rtn = array();

		$rtn['current_page_info'] = $this->px->site()->get_current_page_info();
		$rtn['parent'] = $this->px->site()->get_parent();
		$rtn['bros'] = $this->px->site()->get_bros();
		$rtn['children'] = $this->px->site()->get_children();

		header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}
}
