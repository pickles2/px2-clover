<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: auth
 */
class auth{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** 管理ユーザー定義ディレクトリ */
	private $realpath_admin_users;

	/** CSRFトークンの有効期限 */
	private $csrf_token_expire = 3600;

	/** 初期デフォルトアカウント */
	private $default_admin_user_id = 'admin';
	private $default_admin_user_pw = 'admin';

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $this->clover->px();

		// 管理ユーザー定義ディレクトリ
		$this->realpath_admin_users = $this->clover->realpath_private_data_dir('/admin_users/');
		if( !is_dir($this->realpath_admin_users) ){
			$this->px->fs()->mkdir_r($this->realpath_admin_users);
		}
	}


	/**
	 * 認証プロセス
	 */
	public function auth(){

		if( $this->px->req()->get_param('ADMIN_USER_FLG') ){
			if( $_SERVER['REQUEST_METHOD'] !== 'POST' ){
				$this->login_page();
				exit;
			}
			if( $this->is_csrf_token_required() && !$this->is_valid_csrf_token_given() ){
				$this->login_page('csrf_token_expired');
				exit;
			}

			$login_challenger_id = $this->px->req()->get_param('ADMIN_USER_ID');
			if( !$this->validate_user_id($login_challenger_id) ){
				// 不正な形式のID
				$this->login_page('invalid_user_id');
				exit;
			}

			$user_info = $this->get_admin_user_info( $login_challenger_id );
			if( !is_array($user_info) ){
				// 不正なユーザーデータ
				$this->login_page('failed');
				exit;
			}
			$admin_id = $user_info['id'];
			$admin_pw = $user_info['pw'];

			if( $login_challenger_id == $admin_id && password_verify($this->px->req()->get_param('ADMIN_USER_PW'), $admin_pw) ){
				$this->px->req()->set_session('ADMIN_USER_ID', $login_challenger_id);
				$redirect_to = '?';
				if( is_string($this->px->req()->get_param('PX')) ){
					$redirect_to = '?PX='.htmlspecialchars( $this->px->req()->get_param('PX') );
				}
				$this->px->header('Location:'.$redirect_to);
				exit;
			}

			if( !$this->is_login() ){
				$this->login_page('failed');
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
			echo $this->clover->view()->bind(
				'/system/logout.twig',
				array(
					'url_backto' => $this->px->href( $this->px->req()->get_request_file_path() ),
				)
			);
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
		if( $this->is_csrf_token_required() && !$this->is_valid_csrf_token_given() ){
			return false;
		}
		return true;
	}

	/**
	 * パスワードをハッシュ化する
	 */
	public function password_hash($password){
		return password_hash($password, PASSWORD_BCRYPT);
	}

	/**
	 * ログイン画面を表示する
	 */
	private function login_page( $error_message = null ){
		$this->px->set_status(403);

		$command = $this->px->get_px_command();
		if( isset($command[0]) && $command[0] == 'admin' ){
			if( isset($command[1]) && $command[1] == 'api' ){
				$this->px->header('Content-type: application/json');
				echo json_encode(array(
					'result' => false,
					'message' => $this->px->get_status_message(),
				));
				exit;
			}
		}

		echo $this->clover->view()->bind(
			'/system/login.twig',
			array(
				'url_backto' => '?',
				'ADMIN_USER_ID' => $this->px->req()->get_param('ADMIN_USER_ID'),
				'csrf_token' => $this->get_csrf_token(),
				'error_message' => $error_message ? $this->clover->lang()->get('login_error.'.$error_message) : null,
			)
		);
		exit;
	}


	// --------------------------------------
	// 管理ユーザー情報

	/**
	 * 現在のログインユーザーの情報を取得する
	 */
	public function get_login_user_info(){
		$login_user_id = $this->px->req()->get_session('ADMIN_USER_ID');
		if( !is_string($login_user_id) || !strlen($login_user_id) ){
			// ログインしていない
			return null;
		}

		if( !$this->validate_user_id($login_user_id) ){
			// 不正な形式のID
			return null;
		}

		$user_info = $this->get_admin_user_info( $login_user_id );
		if( !is_array($user_info) ){
			return null;
		}
		unset( $user_info['pw'] ); // パスワードハッシュは出さない
		return $user_info;
	}

	/**
	 * 現在のログインユーザーの情報を取得する
	 */
	public function update_login_user_info( $new_profile ){
		$login_user_id = $this->px->req()->get_session('ADMIN_USER_ID');
		if( !is_string($login_user_id) || !strlen($login_user_id) ){
			// ログインしていない
			return false;
		}

		if( !$this->validate_user_id($login_user_id) ){
			// 不正な形式のID
			return false;
		}

		$user_info = $this->get_admin_user_info( $login_user_id );
		if( !is_array($user_info) ){
			return false;
		}
		foreach( $new_profile as $key=>$val ){
			if( $key == 'pw' ){
				if( !is_string($val) || !strlen($val) ){
					continue;
				}
				$user_info[$key] = $this->password_hash($val);
				continue;
			}

			$user_info[$key] = $val;
		}

		if( !$this->validate_user_id($user_info['id']) ){
			// 不正な形式のID
			return false;
		}
		if( !$this->validate_user_info($user_info) ){
			// 不正な形式のユーザー情報
			return false;
		}


		// 新しいIDのためにファイル名を変更
		$result = $this->px->fs()->rename(
			$this->realpath_admin_users.urlencode($login_user_id).'.json',
			$this->realpath_admin_users.urlencode($user_info['id']).'.json'
		);
		if( !$result ){
			return false;
		}

		$realpath_json = $this->realpath_admin_users.urlencode($user_info['id']).'.json';
		$json_str = json_encode( $user_info, JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE );
		if( !$this->px->fs()->save_file($realpath_json, $json_str) ){
			return false;
		}

		// ログインユーザーの情報を更新
		$this->px->req()->set_session('ADMIN_USER_ID', $user_info['id']);
		$user_info = $this->get_admin_user_info( $user_info['id'] );
		return $user_info;
	}


	/**
	 * 管理者ユーザーの情報を取得する
	 *
	 * このメソッドの戻り値には、パスワードハッシュが含まれます。
	 */
	private function get_admin_user_info($user_id){
		if( !$this->validate_user_id($user_id) ){
			// 不正な形式のID
			return null;
		}

		$user_info = null;
		if( is_dir($this->realpath_admin_users) && $this->px->fs()->ls($this->realpath_admin_users) ){
			$filename = $user_id.'.json';
			if( $this->px->fs()->is_file( $this->realpath_admin_users.$filename ) ){
				$user_info = json_decode( file_get_contents($this->realpath_admin_users.$filename), true );
				if( $user_info['id'] != $user_id ){
					// ID値が不一致だったら
					return null;
				}
			}
		}elseif( $user_id == $this->default_admin_user_id ){
			// デフォルトユーザー
			$user_info = array(
				'id' => $this->default_admin_user_id,
				'pw' => $this->password_hash($this->default_admin_user_pw),
				'name' => 'Administrator',
				'lang' => 'ja',
			);
		}
		return $user_info;
	}

	/**
	 * 管理ユーザーを作成する
	 *
	 * @param array|object $user_info 作成するユーザー情報
	 */
	public function create_admin_user( $user_info ){
		$user_info = (object) $user_info;
		if( !$this->validate_user_id($user_info->id) ){
			return false;
		}
		$realpath_json = $this->realpath_admin_users.'/'.urlencode($user_info->id).'.json';
		if( is_file( $realpath_json ) ){
			return false;
		}
		if( !$this->validate_user_info($user_info) ){
			// 不正な形式のユーザー情報
			return false;
		}

		$user_info->pw = $this->clover->auth()->password_hash($user_info->pw);
		$json_str = json_encode( $user_info, JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE );
		if( !$this->px->fs()->save_file($realpath_json, $json_str) ){
			return false;
		}
		return true;
	}

	/**
	 * Validation: ユーザーID
	 */
	private function validate_user_id( $user_id ){
		if( !is_string($user_id) || !strlen($user_id) ){
			return false;
		}
		if( !preg_match('/^[a-zA-Z0-9\_\-]+$/', $user_id) ){
			// 不正な形式
			return false;
		}
		return true;
	}
	/**
	 * Validation: ユーザー情報
	 */
	private function validate_user_info( $user_info ){
		$user_info = (array) $user_info;

		if( !$this->validate_user_id($user_info['id']) ){
			// 不正な形式のID
			return false;
		}
		if( !isset($user_info['name']) || !strlen($user_info['name']) ){
			return false;
		}
		if( !isset($user_info['pw']) || !strlen($user_info['pw']) ){
			return false;
		}
		if( !isset($user_info['lang']) || !strlen($user_info['lang']) ){
			return false;
		}
		return true;
	}


	// --------------------------------------
	// CSRFトークン

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
			if( $token['created_at'] < time() - ($this->csrf_token_expire / 2) ){
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
	 * CSRFトークンの検証を行わない条件を調査
	 */
	private function is_csrf_token_required(){
		$this->command = $this->px->get_px_command();
		if( !is_array($this->command) || !count($this->command) || (count($this->command) == 1 && !strlen($this->command[0])) ){
			// --------------------------------------
			// プレビューリクエスト
			if( $_SERVER['REQUEST_METHOD'] == 'GET' ){
				// PXコマンドなしのGETのリクエストでは、CSRFトークンを要求しない
				return false;
			}
		}elseif( $this->command[0] == 'admin' ){
			// --------------------------------------
			// px2-clover 管理画面
			// その他のPXコマンドではCSRFトークンが必要
			$subCmd = (isset( $this->command[1] ) ? $this->command[1] : '');
			switch($subCmd){
				case '':
				case 'logout':
				case 'config':
				case 'page_info':
				case 'sitemap':
				case 'edit_contents':
				case 'publish':
				case 'clearcache':
				case 'history':
					if( $_SERVER['REQUEST_METHOD'] == 'GET' ){
						// 既知の特定の画面へのGETのリクエストでは、CSRFトークンを要求しない
						return false;
					}
					break;
			}
		}
		return true;
	}

	/**
	 * 有効なCSRFトークンを受信したか
	 */
	public function is_valid_csrf_token_given(){

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
