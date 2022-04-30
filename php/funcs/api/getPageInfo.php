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

		// current page
		$rtn['current_page_info'] = $this->px->site()->get_current_page_info();

		// parent
		$rtn['parent'] = $this->px->site()->get_parent();
		if( is_string($rtn['parent']) ){
			$rtn['parent'] = $this->px->site()->get_page_info( $rtn['parent'] );
		}

		// bros
		$rtn['bros'] = array();
		$bros = $this->px->site()->get_bros(null, array('filter'=>false));
		if( is_array($bros) ){
			foreach($bros as $bro){
				array_push( $rtn['bros'], $this->px->site()->get_page_info($bro) );
			}
		}

		// children
		$rtn['children'] = array();
		$children = $this->px->site()->get_children(null, array('filter'=>false));
		if( is_array($children) ){
			foreach($children as $child){
				array_push( $rtn['children'], $this->px->site()->get_page_info($child) );
			}
		}

		// breadcrumb
		$rtn['breadcrumb'] = array();
		$breadcrumb = $this->px->site()->get_breadcrumb_array();
		if( is_array($breadcrumb) ){
			foreach($breadcrumb as $page_id){
				array_push( $rtn['breadcrumb'], $this->px->site()->get_page_info($page_id) );
			}
		}

		header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}
}
