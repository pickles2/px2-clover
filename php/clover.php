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

	/** View機能 */
	private $view;

	/**
	 * Constructor
	 *
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $px ){
		$this->px = $px;
		$this->auth = new auth( $this );
		$this->view = new view( $this );


		// クライアントリソースを公開ディレクトリに配置
		$client_resources_dist = $this->px->realpath_plugin_files('/');
		$this->px->fs()->copy_r(__DIR__.'/../public/resources/', $client_resources_dist);

	}


	/** px */
	public function px(){
		return $this->px;
	}

	/** auth */
	public function auth(){
		return $this->auth;
	}

	/** view */
	public function view(){
		return $this->view;
	}

}
