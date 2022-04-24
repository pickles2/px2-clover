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

		$this->command = $this->px->get_px_command();
		if( count($this->command) && $this->command[0] == 'admin' ){
			// クライアントリソースを公開ディレクトリに配置
			$client_resources_dist = $this->px->realpath_plugin_files('/');
			$this->px->fs()->copy_r(__DIR__.'/../public/resources/', $client_resources_dist);
		}
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

	/** プラグイン専有の公開ディレクトリのパスを取得する */
	public function path_files( $localpath = null ){
		$rtn = $this->px->path_plugin_files($localpath);
		return $rtn;
	}

	/** プラグイン専有の公開ディレクトリの内部パスを取得する */
	public function realpath_files( $localpath = null ){
		$rtn = $this->px->realpath_plugin_files($localpath);
		return $rtn;
	}

	/** プラグイン専有の非公開データディレクトリの内部パスを取得する */
	public function realpath_private_data_dir( $localpath = null ){
		$rtn = $this->px->get_realpath_homedir();
		$rtn .= '_sys/ram/data/';
		$rtn .= 'px2-clover/';
		if( !is_dir($rtn) ){
			$this->px->fs()->mkdir_r($rtn);
		}
		$rtn = $this->px->fs()->get_realpath($rtn.$localpath);
		return $rtn;
	}

	/** プラグイン専有の非公開キャッシュディレクトリの内部パスを取得する */
	public function realpath_private_cache( $localpath = null ){
		$rtn = $this->px->realpath_plugin_private_cache($localpath);
		return $rtn;
	}

}
