<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover: auth
 */
class auth{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** CSRFトークンの有効期限 */
	private $csrf_token_expire = 3600;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $this->clover->px();
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
		if( !$this->is_valid_csrf_token_given() ){
			return false;
		}
		return true;
	}

	/**
	 * ログイン画面を表示する
	 */
	public function login_page(){
		echo $this->clover->view()->bind(
			'/system/login.twig',
			array(
				'url_backto' => '?',
				'ADMIN_USER_ID' => $this->px->req()->get_param('ADMIN_USER_ID'),
				'csrf_token' => $this->get_csrf_token(),
			)
		);
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

		// --------------------------------------
		// CSRFトークンの検証を行わない場合
		$this->command = $this->px->get_px_command();
		if( !count($this->command) ){
			// プレビューリクエスト
			if( !isset($_SERVER['HTTP_X_REQUESTED_WITH']) || !strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest' ){
				if( $_SERVER['REQUEST_METHOD'] == 'GET' ){
					// AJAXではないGETのリクエストでは、CSRFトークンを要求しない
					return true;
				}
			}
		}elseif( $this->command[0] == 'admin' ){
			// px2-clover 管理画面
			$subCmd = (isset( $this->command[1] ) ? $this->command[1] : '');
			switch($subCmd){
				case '':
				case 'logout':
				case 'edit_contents':
					if( $_SERVER['REQUEST_METHOD'] == 'GET' ){
						// AJAXではないGETのリクエストでは、CSRFトークンを要求しない
						return true;
					}
					break;
			}
		}
		// / CSRFトークンの検証を行わない場合
		// --------------------------------------

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
