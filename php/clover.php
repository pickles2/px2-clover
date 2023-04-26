<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover
 */
class clover{

	/** Picklesオブジェクト */
	private $px;

	/** プラグインオプション */
	private $options;

	/** 認証機能 */
	private $auth;

	/** View機能 */
	private $view;

	/** 言語機能 */
	private $lang;

	/** ログ管理機能 */
	private $logger;

	/**
	 * Constructor
	 *
	 * @param object $px $pxオブジェクト
	 * @param object $options プラグインオプション
	 */
	public function __construct( $px, $options ){
		$this->px = $px;
		$this->options = (object) $options;

		$this->auth = new helpers\auth( $this );
		$this->view = new view( $this );
		$this->lang = new helpers\lang( $this );
		$this->logger = new helpers\logger( $this );
	}


	/** px */
	public function px(){
		return $this->px;
	}

	/** initializer */
	public function initializer(){
		$initializer = new initializer( $this );
		return $initializer;
	}

	/** auth */
	public function auth(){
		return $this->auth;
	}

	/** view */
	public function view(){
		return $this->view;
	}

	/** lang */
	public function lang(){
		return $this->lang;
	}

	/** logger */
	public function logger(){
		return $this->logger;
	}

	/** プラグインオプションを取得 */
	public function get_options(){
		return $this->options;
	}

	/** Cloverの設定を取得する */
	public function conf(){
		$config = new helpers\config($this);
		return $config->get();
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

	/**
	 * Gitのルートディレクトリを取得する
	 */
	public function realpath_git_root(){
		$current_dir = $this->px->fs()->get_realpath('./');
		while( 1 ){
			if( file_exists( $current_dir.'/.git' ) ){
				// .git を見つけたら、それが答え。
				return $current_dir;
			}
			if( is_file( $current_dir.'/composer.json' ) ){
				// composer.json を見つけたら、それ以上深追いせず諦める。
				break;
			}
			if( $current_dir == $this->px->fs()->get_realpath($current_dir.'../') ){
				// これ以上階層を上がれない場合
				break;
			}

			$current_dir = $this->px->fs()->get_realpath($current_dir.'../');
		}
		return false;
	}

	/**
	 * Composerのルートディレクトリを取得する
	 */
	public function realpath_composer_root(){
		$current_dir = $this->px->fs()->get_realpath('./');
		while( 1 ){
			if( is_file( $current_dir.'/composer.json' ) && is_dir( $current_dir.'/vendor' ) ){
				// composer.json を見つけたら、それが答え。
				return $current_dir;
			}
			if( $current_dir == $this->px->fs()->get_realpath($current_dir.'../') ){
				// これ以上階層を上がれない場合
				break;
			}

			$current_dir = $this->px->fs()->get_realpath($current_dir.'../');
		}
		return false;
	}


	/**
	 * 許可されたメソッドのみ通過できる
	 */
	public function allowed_method( $methodList ){
		if( !is_array($methodList) ){
			$methodList = array($methodList);
		}
		foreach($methodList as $key=>$val){
			$methodList[$key] = strtolower($val);
		}
		if( array_search( strtolower($this->px->req()->get_method()), $methodList, true ) !== false ){
			return true;
		}

		$this->px->header('Content-type: text/json');
		$this->px->set_status(405);
		echo json_encode(array(
			'result' => false,
			'message' => '405 Method Not Allowed.',
		));
		exit;
	}
}
