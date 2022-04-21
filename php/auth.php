<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover: auth
 */
class auth{

	/** Picklesオブジェクト */
	private $px;

	/** CSRFトークンの有効期限 */
	private $csrf_token_expire = 3600;

	/**
	 * Constructor
	 *
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $px ){
		$this->px = $px;
	}


	/**
	 * 認証プロセス
	 */
	public function auth(){

		// TODO: ID/PWは管理画面から設定できるようにする
		$admin_id = 'admin';
		$admin_pw = 'admin';

		if( $this->px->req()->get_param('ADMIN_USER_FLG') ){
			if( $_SERVER['REQUEST_METHOD'] !== 'POST' ){
				$this->login_page();
				exit;
			}
			if( !$this->is_valid_csrf_token_given() ){
				$this->login_page();
				exit;
			}
			if( $this->px->req()->get_param('ADMIN_USER_ID') == $admin_id && $this->px->req()->get_param('ADMIN_USER_PW') == $admin_pw ){
				$this->px->req()->set_session('ADMIN_USER_ID', $this->px->req()->get_param('ADMIN_USER_ID'));
				header('Location:'.'?PX='.htmlspecialchars(''.$this->px->req()->get_param('PX') ));
				exit;
			}
		}
		if( !$this->is_login() ){
			$this->login_page();
			exit;
		}
	}

	/**
	 * ログアウトする
	 */
	public function logout(){
		$pxcmd = $this->px->req()->get_param('PX');
		if( !$this->is_login() && $pxcmd == 'admin.logout' ){
			ob_start(); ?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>ログアウトしました</title>
</head>
<body>
<p>ログアウトしました。</p>
<p><a href="<?= htmlspecialchars($this->px->href( $this->px->req()->get_request_file_path() )); ?>">戻る</a></p>
</body>
</html>
<?php
			$src = ob_get_clean();
			echo $src;
			exit;
		}


		$this->px->req()->delete_session('ADMIN_USER_ID');
		header('Location:'.$this->px->href( $this->px->req()->get_request_file_path().'?PX='.htmlspecialchars(''.$pxcmd) ));
		exit;
	}

	/**
	 * ログインしているか確認する
	 */
	public function is_login(){
		$ADMIN_USER_ID = $this->px->req()->get_session('ADMIN_USER_ID');
		if( !is_string($ADMIN_USER_ID) || !strlen($ADMIN_USER_ID) ){
			return false;
		}
		if( !$this->is_valid_csrf_token_given() ){
			return false;
		}
		return true;
	}

	/**
	 * ログイン画面を表示する
	 */
	public function login_page(){
		ob_start(); ?>
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>LOGIN</title>
</head>
<body>
<p>ログインしてください。</p>
<form action="" method="post">
	<div>ID: <input type="text" name="ADMIN_USER_ID" value="<?= htmlspecialchars( ''.$this->px->req()->get_param('ADMIN_USER_ID') ); ?>" /></div>
	<div>PW: <input type="password" name="ADMIN_USER_PW" value="" /></div>
	<div><button>ログイン</button></div>
	<input type="hidden" name="ADMIN_USER_FLG" value="1" />
	<input type="hidden" name="ADMIN_USER_CSRF_TOKEN" value="<?= htmlspecialchars($this->get_csrf_token()); ?>" />
</form>
<p><a href="<?= htmlspecialchars($this->px->href( $this->px->req()->get_request_file_path() )); ?>">戻る</a></p>
</body>
</html>
<?php
		$src = ob_get_clean();
		echo $src;
		exit;
	}


	/**
	 * CSRFトークンを取得する
	 */
	public function get_csrf_token(){
		$ADMIN_USER_CSRF_TOKEN = $this->px->req()->get_session('ADMIN_USER_CSRF_TOKEN');
		if( !is_array($ADMIN_USER_CSRF_TOKEN) ){
			$ADMIN_USER_CSRF_TOKEN = array();
		}
		if( !count($ADMIN_USER_CSRF_TOKEN) ){
			return $this->create_csrf_token();
		}
		foreach( $ADMIN_USER_CSRF_TOKEN as $token ){
			if( $token['created_at'] < time() - $this->csrf_token_expire ){
				continue; // 有効期限が切れていたら評価できない
			}
			return $token['hash'];
		}
		return $this->create_csrf_token();
	}

	/**
	 * 新しいCSRFトークンを発行する
	 */
	private function create_csrf_token(){
		$ADMIN_USER_CSRF_TOKEN = $this->px->req()->get_session('ADMIN_USER_CSRF_TOKEN');
		if( !is_array($ADMIN_USER_CSRF_TOKEN) ){
			$ADMIN_USER_CSRF_TOKEN = array();
		}

		$id = $this->px->req()->get_param('ADMIN_USER_ID');
		$rand = uniqid('clover'.$id, true);
		$hash = md5( $rand );
		array_push($ADMIN_USER_CSRF_TOKEN, array(
			'hash' => $hash,
			'created_at' => time(),
		));
		$this->px->req()->set_session('ADMIN_USER_CSRF_TOKEN', $ADMIN_USER_CSRF_TOKEN);
		return $hash;
	}

	/**
	 * 有効なCSRFトークンを受信したか
	 */
	private function is_valid_csrf_token_given(){
		if( !isset($_SERVER['HTTP_X_REQUESTED_WITH']) || !strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest' ){
			if( $_SERVER['REQUEST_METHOD'] == 'GET' ){
				// AJAXではないGETのリクエストでは、CSRFトークンを要求しない
				return true;
			}
		}
		$csrf_token = $this->px->req()->get_param('ADMIN_USER_CSRF_TOKEN');
		if( !$csrf_token ){
			$headers = getallheaders();
			foreach($headers as $header_name=>$header_val){
				if( strtolower($header_name) == 'x-px2-clover-admin-csrf-token' ){
					$csrf_token = $header_val;
					break;
				}
			}
		}
		if( !$csrf_token ){
			return false;
		}

		$ADMIN_USER_CSRF_TOKEN = $this->px->req()->get_session('ADMIN_USER_CSRF_TOKEN');
		if( !is_array($ADMIN_USER_CSRF_TOKEN) ){
			$ADMIN_USER_CSRF_TOKEN = array();
		}
		foreach( $ADMIN_USER_CSRF_TOKEN as $token ){
			if( $token['created_at'] < time() - $this->csrf_token_expire ){
				continue; // 有効期限が切れていたら評価できない
			}
			if( $token['hash'] == $csrf_token ){
				return true;
			}
		}

		return false;
	}
}
