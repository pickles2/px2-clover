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


		// クライアントリソースを公開ディレクトリに配置
		$client_resources_dist = $this->px->realpath_plugin_files('/');
		$this->px->fs()->copy_r(__DIR__.'/../resources/', $client_resources_dist);

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
