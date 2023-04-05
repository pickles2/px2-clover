<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: ページ情報API
 */
class pageInfo{

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

		// originated_csv
		$rtn['originated_csv'] = null;
		if( isset($rtn['current_page_info']['id']) ){
			$rtn['originated_csv'] = $this->px->site()->get_page_originated_csv( $rtn['current_page_info']['id'] );
		}


		// proc_type
		$rtn['proc_type'] = $this->px->get_path_proc_type();


		// editor_mode
		$px2dthelper = new \tomk79\pickles2\px2dthelper\main( $this->px );
		$rtn['editor_mode'] = $px2dthelper->check_editor_mode();


		// blog
		$rtn['blog'] = false;
		if( is_object($this->px->blog) ){
			$current_blog_article_info = $this->px->blog->get_article_info( $rtn['current_page_info']['path'] ?? null );
			$rtn['blog'] = array(
				"blog_id" => $current_blog_article_info->blog_id ?? null,
				"article_info" => $current_blog_article_info->article_info ?? null,
				"originated_csv" => $current_blog_article_info->originated_csv ?? null,
				"child_blogs" => array(),
			);

			$blog_list = $this->px->blog->get_blog_list();
			foreach( $blog_list as $blog_info ){
				$blog_info["logical_path"] = trim($blog_info["logical_path"] ?? '');
				if( !strlen($blog_info["logical_path"]) ){
					if( !strlen($rtn['current_page_info']['id']) ){
						array_push($rtn['blog']['child_blogs'], $blog_info);
					}
					continue;
				}
				$logical_path_ary = explode('>', $blog_info["logical_path"]);
				switch( $logical_path_ary[count($logical_path_ary) - 1] ){
					case $rtn['current_page_info']['id']??null:
					case $rtn['current_page_info']['path']??null:
						array_push($rtn['blog']['child_blogs'], $blog_info);
						break;
				}
			}
		}


		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}
}
