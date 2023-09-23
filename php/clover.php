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

	/** checkout */
	public function checkout(){
		$checkout = new helpers\checkout($this);
		return $checkout;
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


	// --------------------------------------
	// ディレクトリ取得

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
	 *
	 * @return string|boolean .git が置かれているディレクトリのパス。
	 * 見つからない場合に false を返します。
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
	 * Composer のルートディレクトリを取得する
	 *
	 * @return string|boolean composer.json が置かれているディレクトリのパス。
	 * 見つからない場合に false を返します。
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


	// --------------------------------------
	// 認可

	/**
	 * 許可されたメソッドのみ通過できる
	 * 
	 * 許可されないメソッドの場合は、 `405 Method Not Allowed` を出力して終了する。
	 *
	 * @param string|array $methodList 許可されるメソッド名、またはメソッド名のリスト
	 * @return boolean 許可されたメソッドの場合 true. 許可されないメソッドの場合は、終了するため返却されない。
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

	/**
	 * 認可を要求する
	 * 
	 * 認可が得られない場合は、 `unauthorized` 画面を表示して終了する。
	 *
	 * @param string $authority_name 検証する権限名
	 * @param string $format 認可が得られない場合に出力するエラー画面のフォーマット
	 * @return boolean 認可された場合 true. 認可されない場合は、終了するため返却されない。
	 */
	public function authorize_required($authority_name, $format = 'text/html'){
		if( !$this->px->authorizer->is_authorized($authority_name) ){
			$this->unauthorized($format);
			exit();
		}
		return true;
	}

	// --------------------------------------
	// エラー・強制終了

	/**
	 * 401 Unauthorized 画面を表示して終了する
	 *
	 * @param string $format 出力フォーマット
	 */
	public function unauthorized( $format = 'text/html' ){
		while (ob_get_level()) { ob_end_clean(); }
		$this->px->set_status(401);
		switch($format){
			case "json":
			case "text/json":
				$this->px->header('Content-type: text/json');
				echo json_encode(array(
					'result' => false,
					'message' => '401 Unauthorized.',
				));
				exit;
				break;
			default:
				break;
		}
		$this->px->header('Content-type: text/html');
		ob_start(); ?>
<!DOCTYPE html>
<html>
	<head>
		<title>401 Unauthorized</title>
	</head>
	<body>
		<p>401 Unauthorized</p>
	</body>
</html>
		<?php
		echo ob_get_clean();
		exit;
	}

	/**
	 * 403 Forbidden 画面を表示して終了する
	 *
	 * @param string $format 出力フォーマット
	 */
	public function forbidden( $format = 'text/html' ){
		while (ob_get_level()) { ob_end_clean(); }
		$this->px->set_status(403);
		switch($format){
			case "json":
			case "text/json":
				$this->px->header('Content-type: text/json');
				echo json_encode(array(
					'result' => false,
					'message' => '403 Forbidden.',
				));
				exit;
				break;
			default:
				break;
		}
		$this->px->header('Content-type: text/html');
		ob_start(); ?>
<!DOCTYPE html>
<html>
	<head>
		<title>403 Forbidden</title>
	</head>
	<body>
		<p>403 Forbidden</p>
	</body>
</html>
		<?php
		echo ob_get_clean();
		exit;
	}

	/**
	 * 404 Not Found 画面を表示して終了する
	 *
	 * @param string $format 出力フォーマット
	 */
	public function notfound( $format = 'text/html' ){
		while (ob_get_level()) { ob_end_clean(); }
		$this->px->set_status(404);
		switch($format){
			case "json":
			case "text/json":
				$this->px->header('Content-type: text/json');
				echo json_encode(array(
					'result' => false,
					'message' => '404 Not Found.',
				));
				exit;
				break;
			default:
				break;
		}
		$this->px->header('Content-type: text/html');
		ob_start(); ?>
<!DOCTYPE html>
<html>
	<head>
		<title>404 Not Found</title>
	</head>
	<body>
		<p>404 Not Found</p>
	</body>
</html>
		<?php
		echo ob_get_clean();
		exit;
	}
}
