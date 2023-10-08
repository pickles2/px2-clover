<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: Authentication
 *
 * @author Tomoya Koyanagi <tomk79@gmail.com>
 */
class auth {

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** filesystem */
	private $fs;

	/** request */
	private $req;

	/** 管理ユーザー定義ディレクトリ */
	private $realpath_admin_user_dir;

	/** アカウントロック情報格納ディレクトリ */
	private $realpath_account_lock;

	/** CSRFトークンの有効期限 */
	private $csrf_token_expire = 60 * 60;

	/** Session Key: id */
	private $session_key_id;

	/** Session Key: pw */
	private $session_key_pw;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $this->clover->px();
		$this->fs = $this->px->fs();
		$this->req = $this->px->req();

		// セッションキー
		$this->session_key_id = 'ADMIN_USER_ID';
		$this->session_key_pw = 'ADMIN_USER_PW';

		// 管理ユーザー定義ディレクトリ
		$this->realpath_admin_user_dir = $this->clover->realpath_private_data_dir('/admin_users/');
		if( $this->clover->get_options()->realpath_admin_user_dir ?? null ){
			$this->realpath_admin_user_dir = $this->clover->get_options()->realpath_admin_user_dir;
		}
		if( is_string($this->realpath_admin_user_dir ?? null) && !is_dir($this->realpath_admin_user_dir) ){
			$this->fs->mkdir_r($this->realpath_admin_user_dir);
		}

		// アカウントロック情報格納ディレクトリ
		$this->realpath_account_lock = $this->clover->realpath_private_data_dir('/account_lock/');
		if( !is_dir($this->realpath_account_lock) ){
			$this->fs->mkdir_r($this->realpath_account_lock);
		}
	}

	/** $lang */
	private function lang(){
		return $this->clover->lang();
	}

	/** $logger */
	private function logger(){
		return $this->clover->logger();
	}

	/**
	 * 認証プロセス
	 */
	public function auth(){
		if( $this->is_csrf_token_required() && !$this->is_valid_csrf_token_given() ){
			$this->login_page('csrf_token_expired');
			exit;
		}

		if( $this->req->get_param('ADMIN_USER_FLG') ){
			$login_challenger_id = $this->req->get_param('ADMIN_USER_ID');
			$login_challenger_pw = $this->req->get_param('ADMIN_USER_PW');
			if( strtoupper($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' ){
				$this->login_page();
				exit;
			}

			if( !strlen($login_challenger_id ?? '') ){
				// User ID が未指定
				$this->logger()->error_log('Failed to login. User ID is not set.');
				$this->login_page('user_id_is_required');
				exit;
			}

			if( !$this->validate_admin_user_id($login_challenger_id) ){
				// 不正な形式のID
				$this->logger()->error_log('Failed to login as user \''.$login_challenger_id.'\'. Invalid user ID format.');
				$this->login_page('invalid_user_id');
				exit;
			}

			if( $this->is_account_locked( $login_challenger_id ) ){
				// アカウントがロックされている
				$this->admin_user_login_failed( $login_challenger_id );
				$this->logger()->error_log('Failed to login as user \''.$login_challenger_id.'\'. Account is LOCKED.');
				$this->login_page('account_locked');
				exit;
			}

			$user_info = $this->get_admin_user_info_full( $login_challenger_id );
			if( !is_object($user_info) ){
				// 不正なユーザーデータ
				$this->admin_user_login_failed( $login_challenger_id );
				$this->logger()->error_log('Failed to login as user \''.$login_challenger_id.'\'. User undefined.');
				$this->login_page('failed');
				exit;
			}
			$admin_id = $user_info->id;
			$admin_pw = $user_info->pw;

			if( strlen($login_challenger_id ?? '') && strlen($login_challenger_pw ?? '') ){
				// ログイン評価
				if( $login_challenger_id == $admin_id && password_verify($login_challenger_pw, $admin_pw) ){
					$this->admin_user_login_successful( $login_challenger_id );
					$this->req->set_session($this->session_key_id, $login_challenger_id);
					$this->req->set_session($this->session_key_pw, $user_info->pw);

					$redirect_to = '?';
					if( is_string($this->req->get_param('PX')) ){
						$redirect_to = '?PX='.htmlspecialchars( $this->req->get_param('PX') );
					}
					$this->req->set_cookie('LANG', $user_info->lang);
					$this->logger()->log('User \''.$login_challenger_id.'\' logged in.');
					$this->px->header('Location:'.$redirect_to);
					exit;
				}
			}

			if( !$this->is_login() ){
				$this->admin_user_login_failed( $login_challenger_id );
				$this->logger()->error_log('Failed to login as user \''.$login_challenger_id.'\'.');
				$this->login_page('failed');
				exit;
			}
		}

		if( !$this->is_login() ){
			$this->login_page();
			exit;
		}

		return;
	}

	/**
	 * ユーザーのパスワードを検証する
	 */
	public function verify_admin_user_password( $user_pw, $user_id = null ){
		if( is_null($user_id) ){
			$user_id = $this->req->get_session($this->session_key_id);
		}
		if( !strlen($user_id ?? '') ){
			return false;
		}

		$user_info = $this->get_admin_user_info_full( $user_id );
		if( !$user_info ){
			return false;
		}
		if( !is_string($user_pw) || !strlen($user_pw) || !password_verify($user_pw, $user_info->pw) ){
			return false;
		}
		return true;
	}

	/**
	 * ログアウトする
	 */
	public function logout(){
		$pxcmd = $this->req->get_param('PX');
		if( !$this->is_login() && $pxcmd == 'admin.logout' ){
			echo $this->clover->view()->bind(
				'/system/logout.twig',
				array(
					'url_backto' => $this->px->href( $this->req->get_request_file_path() ),
				)
			);
			exit;
		}

		$user_id = $this->req->get_session($this->session_key_id);
		$this->req->delete_session($this->session_key_id);
		$this->req->delete_session($this->session_key_pw);
		$this->logger()->log('User \''.$user_id.'\' logged out.');
		header('Location:'.$this->px->href( $this->req->get_request_file_path().'?PX='.htmlspecialchars(''.$pxcmd) ));
		exit;
	}

	/**
	 * ログインしているか確認する
	 */
	public function is_login(){
		$ADMIN_USER_ID = $this->req->get_session($this->session_key_id);
		$ADMIN_USER_PW = $this->req->get_session($this->session_key_pw);
		if( !is_string($ADMIN_USER_ID) || !strlen($ADMIN_USER_ID) ){
			return false;
		}
		if( $this->is_csrf_token_required() && !$this->is_valid_csrf_token_given() ){
			return false;
		}

		$admin_user_info = $this->get_admin_user_info_full( $ADMIN_USER_ID );
		if( !is_object($admin_user_info) || !isset($admin_user_info->id) ){
			return false;
		}
		if( $ADMIN_USER_ID !=$admin_user_info->id ){
			return false;
		}
		if( $ADMIN_USER_PW != $admin_user_info->pw ){
			return false;
		}
		return true;
	}

	/**
	 * パスワードをハッシュ化する
	 */
	public function password_hash($password){
		if( !is_string($password) ){
			return false;
		}
		return password_hash($password, PASSWORD_BCRYPT);
	}

	/**
	 * ログイン画面を表示する
	 */
	private function login_page( $error_message = null ){
		$this->px->set_status(403);

		$is_html_page = false;

		$command = $this->px->get_px_command();
		if( !isset($command[0]) ){
			// プレビューにはHTMLを返す
			$is_html_page = true;
		}elseif( $command[0] == 'admin' && (!isset($command[1]) || $command[1] != 'api') ){
			// 管理画面(api以外)にはHTMLを返す
			$is_html_page = true;
		}

		if( $is_html_page ){
			echo $this->clover->view()->bind(
				'/system/login.twig',
				array(
					'url_backto' => '?',
					'ADMIN_USER_ID' => $this->req->get_param('ADMIN_USER_ID'),
					'csrf_token' => $this->get_csrf_token(),
					'error_message' => ($error_message ? $this->lang()->get('login_error.'.$error_message) : ''),
				)
			);
			exit;
		}

		$this->px->header('Content-type: application/json');
		echo json_encode(array(
			'result' => false,
			'message' => ($error_message ? $this->lang()->get('login_error.'.$error_message) : ''),
		));
		exit;

	}


	// --------------------------------------
	// アカウントロック制御

	/**
	 * 管理ユーザーアカウントがロックされているか確認する
	 */
	private function is_account_locked( $user_id ){
		$realpath_json_php = $this->realpath_account_lock.urlencode($user_id).'.json.php';
		$data = new \stdClass;
		if( is_file($realpath_json_php) ){
			$data = dataDotPhp::read_json($realpath_json_php);
		}

		if( !is_array($data->failed_log ?? null) ){
			return false;
		}

		$counter = 0;
		foreach( $data->failed_log as $log ){
			$time = strtotime( $log->at );
			if( $time > time() - (60 * 60) ){
				// 60分以内の失敗ログがあればカウントする
				$counter ++;
			}
			if( $counter >= 5 ){
				// 失敗ログ 5回 でロックする
				return true;
			}
		}

		return false;
	}

	/**
	 * 管理ユーザーがログインに失敗したことを記録する
	 */
	private function admin_user_login_failed( $user_id ){
		$realpath_json_php = $this->realpath_account_lock.urlencode($user_id).'.json.php';
		$data = new \stdClass;
		if( is_file($realpath_json_php) ){
			$data = dataDotPhp::read_json($realpath_json_php);
		}

		if( !is_array($data->failed_log ?? null) ){
			$data->last_failed = null;
			$data->failed_log = array();
		}
		$failed_date = date('c');
		$data->last_failed = $failed_date;
		array_push($data->failed_log, (object) array(
			"at" => $failed_date,
			"client_ip" => $_SERVER['REMOTE_ADDR'] ?? null,
		));

		$result = dataDotPhp::write_json($realpath_json_php, $data);
		return true;
	}

	/**
	 * 管理ユーザーがログインに成功したことを記録する
	 */
	private function admin_user_login_successful( $user_id ){
		$realpath_json_php = $this->realpath_account_lock.urlencode($user_id).'.json.php';
		$this->fs->rm( $realpath_json_php );
		return true;
	}


	// --------------------------------------
	// 管理ユーザー情報操作

	/**
	 * 管理ユーザーを作成する
	 *
	 * @param array|object $new_profile 作成するユーザー情報
	 * @param string $login_password ログインしているユーザーの現在のパスワード
	 */
	public function create_admin_user( $new_profile, $login_password ){
		$result = (object) array(
			'result' => true,
			'message' => 'OK',
			'errors' => (object) array(),
		);

		$admin_user_list = $this->get_admin_user_list();
		$new_profile = json_decode(json_encode($new_profile));
		if( count($admin_user_list) ){
			// NOTE: 始めてのユーザーを作成するときは、現在のパスワードを求めない。ログインしていることを前提にしない。
			if( !$this->verify_admin_user_password($login_password) ){
				// 現在のパスワードを確認
				return (object) array(
					'result' => false,
					'message' => 'Authentication Failed.',
					'errors' => (object) array(
						'current_pw' => array('現在のログインパスワードを正しく入力してください。'),
					),
				);
			}
		}

		if( $this->admin_user_data_exists( $new_profile->id ) ){
			return (object) array(
				'result' => false,
				'message' => 'そのユーザーIDはすでに存在します。',
				'errors' => (object) array(
					'id' => array('そのユーザーIDはすでに存在します。')
				),
			);
		}

		if( (strlen($new_profile->pw ?? '') || strlen($new_profile->pw_retype ?? '')) && $new_profile->pw !== $new_profile->pw_retype ){
			return (object) array(
				'result' => false,
				'message' => 'Password not matched.',
				'errors' => (object) array(
					'pw_retype' => array('パスワードが一致しません。'),
				),
			);
		}

		$user_info_validated = $this->validate_admin_user_info($new_profile);
		if( !$user_info_validated->is_valid ){
			// 不正な形式のユーザー情報
			return (object) array(
				'result' => false,
				'message' => $user_info_validated->message,
				'errors' => $user_info_validated->errors,
			);
		}

		$new_profile->pw = $this->password_hash($new_profile->pw);
		if( !$this->write_admin_user_data($new_profile->id, $new_profile) ){
			return (object) array(
				'result' => false,
				'message' => 'ユーザー情報の保存に失敗しました。',
				'errors' => (object) array(),
			);
		}
		return $result;
	}

	/**
	 * 現在のログインユーザーの情報を取得する
	 *
	 * NOTE: このメソッドは、ユーザーパスワードのハッシュ情報を含まない情報を返します。
	 *
	 * @return object 現在のユーザーの情報 (ただしパスワードハッシュを含まない)
	 */
	public function get_login_user_info(){
		$login_user_id = $this->req->get_session($this->session_key_id);
		if( !is_string($login_user_id) || !strlen($login_user_id) ){
			// ログインしていない
			return null;
		}

		if( !$this->validate_admin_user_id($login_user_id) ){
			// 不正な形式のID
			return null;
		}

		$user_info = $this->get_admin_user_info( $login_user_id );
		if( !is_object($user_info) ){
			return null;
		}
		unset( $user_info->pw ); // パスワードハッシュは出さない
		unset( $user_info->pw_retype ); unset( $user_info->current_pw ); // 存在しないはずだが、不具合があったときの保険
		return $user_info;
	}

	/**
	 * 管理者ユーザーの一覧を取得する
	 */
	public function get_admin_user_list(){
		if( !is_dir($this->realpath_admin_user_dir) ){
			return array();
		}
		$filelist = $this->fs->ls($this->realpath_admin_user_dir);
		$rtn = array();
		foreach( $filelist as $basename ){
			$user_id = preg_replace( '/\.json(?:\.php)?$/si', '', $basename );
			$json = (array) $this->read_admin_user_data( $user_id );
			unset($json['pw']); // パスワードハッシュはクライアントに送出しない
			unset($json['pw_retype'], $json['current_pw']); // 存在しないはずだが、不具合があったときの保険
			array_push($rtn, $json);
		}
		return $rtn;
	}


	/**
	 * 管理者ユーザーの情報を取得する
	 *
	 * NOTE: このメソッドは、ユーザーパスワードのハッシュ情報を含まない情報を返します。
	 *
	 * @param string $user_id 対象のユーザーID
	 * @return object 対象のユーザー情報 (パスワードハッシュを含まない)
	 */
	public function get_admin_user_info($user_id){
		$user_info = $this->get_admin_user_info_full($user_id);
		if( !$user_info ){
			return null;
		}
		unset( $user_info->pw ); // パスワードハッシュは出さない
		unset( $user_info->pw_retype ); unset( $user_info->current_pw ); // 存在しないはずだが、不具合があったときの保険
		return $user_info;
	}

	/**
	 * 管理者ユーザーの情報を取得する
	 *
	 * *Attention*: このメソッドの戻り値には、パスワードハッシュが含まれます。
	 *
	 * @param string $user_id 対象のユーザーID
	 * @return object 対象のユーザー情報 (パスワードハッシュを含む)
	 */
	private function get_admin_user_info_full($user_id){
		if( !$this->validate_admin_user_id($user_id) ){
			// 不正な形式のID
			return null;
		}

		$user_info = null;
		if( strlen($this->realpath_admin_user_dir ?? '') && is_dir($this->realpath_admin_user_dir) && $this->fs->ls($this->realpath_admin_user_dir) ){
			if( $this->admin_user_data_exists( $user_id ) ){
				$user_info = $this->read_admin_user_data( $user_id );
				if( !isset($user_info->id) || $user_info->id != $user_id ){
					// ID値が不一致だったら
					return null;
				}
			}
		}
		return is_null($user_info) ? $user_info : (object) $user_info;
	}

	/**
	 * 現在のログインユーザー自身の情報を更新する
	 *
	 * @param array|object $new_profile 変更する新しいユーザー情報
	 * @param string $login_password ログインしているユーザーの現在のパスワード
	 */
	public function update_login_user_info( $new_profile, $login_password ){
		$new_profile = json_decode(json_encode($new_profile));
		$login_user_id = $this->req->get_session($this->session_key_id);
		if( !is_string($login_user_id) || !strlen($login_user_id) ){
			// ログインしていない
			return (object) array(
				'result' => false,
				'message' => 'Authentication failed.',
				'errors' => (object) array(),
			);
		}

		$allow_profile_keys = array(
			'id',
			'name',
			'lang',
			'pw',
			'pw_retype',
			'email',
			'appearance',
			// 'role', // 自分のロールは変更できない
		);
		foreach( $new_profile as $key=>$val ){
			if( array_search($key, $allow_profile_keys) === false ){
				unset($new_profile->{$key}); // 変更できないキーを削除する
			}
		}
		if( !strlen($new_profile->pw || '') && !strlen($new_profile->pw_retype || '') ){
			unset($new_profile->pw);
			unset($new_profile->pw_retype);
		}
		$rtn = $this->update_admin_user_info( $login_user_id, $new_profile, $login_password );

		if( $rtn->result ){
			// ログインユーザーの情報を更新
			$new_login_user_id = $login_user_id;
			if( isset($new_profile->id) && is_string($new_profile->id) ){
				$new_login_user_id = $new_profile->id;
			}
			$this->req->set_session($this->session_key_id, $new_login_user_id);
			if( isset($new_profile->pw) && is_string($new_profile->pw) && strlen($new_profile->pw) ){
				$new_user_info = $this->get_admin_user_info_full($new_login_user_id);
				$this->req->set_session($this->session_key_pw, $new_user_info->pw);
			}
		}

		return $rtn;
	}

	/**
	 * 管理者ユーザーの情報を更新する
	 *
	 * @param string $target_user_id 変更対象のユーザーID
	 * @param array|object $new_profile 変更する新しいユーザー情報
	 * @param string $login_password ログインしているユーザーの現在のパスワード
	 */
	public function update_admin_user_info( $target_user_id, $new_profile, $login_password ){
		$new_profile = json_decode(json_encode($new_profile));
		$result = (object) array(
			'result' => true,
			'message' => 'OK',
			'errors' => (object) array(),
		);

		if( !$this->verify_admin_user_password($login_password) ){
			// 現在のパスワードを確認
			return (object) array(
				'result' => false,
				'message' => 'Authentication Failed.',
				'errors' => (object) array(
					'current_pw' => array('現在のログインパスワードを正しく入力してください。'),
				),
			);
		}

		if( !is_string($target_user_id) || !strlen($target_user_id) ){
			// 更新対象が未指定
			return (object) array(
				'result' => false,
				'message' => 'Target not set.',
				'errors' => (object) array(),
			);
		}

		if( !$this->validate_admin_user_id($target_user_id) ){
			// 不正な形式のID
			return (object) array(
				'result' => false,
				'message' => 'Invalid Login User ID.',
				'errors' => (object) array(),
			);
		}

		$user_info = $this->get_admin_user_info_full( $target_user_id );
		if( !is_object($user_info) ){
			return (object) array(
				'result' => false,
				'message' => 'Failed to get user information.',
				'errors' => (object) array(),
			);
		}

		if( (strlen($new_profile->pw ?? '') || strlen($new_profile->pw_retype ?? '')) && $new_profile->pw !== $new_profile->pw_retype ){
			return (object) array(
				'result' => false,
				'message' => 'Password not matched.',
				'errors' => (object) array(
					'pw_retype' => array('パスワードが一致しません。'),
				),
			);
		}

		$profile_keys = array(
			'id',
			'name',
			'lang',
			'pw',
			'email',
			'appearance',
			'role',
		);
		foreach( $profile_keys as $key ){
			// 変更項目の整理
			if( !property_exists($new_profile, $key) ){
				continue;
			}
			$val = $new_profile->{$key} ?? null;
			if( $key == 'pw' ){
				if( !is_string($val) || !strlen($val) ){
					continue;
				}
				$user_info->{$key} = $this->password_hash($val);
				continue;
			}

			$user_info->{$key} = $val;
		}

		$user_info_validated = $this->validate_admin_user_info($user_info);
		if( !$user_info_validated->is_valid ){
			// 不正な形式のユーザー情報
			return (object) array(
				'result' => false,
				'message' => $user_info_validated->message,
				'errors' => $user_info_validated->errors,
			);
		}


		if( $target_user_id != $user_info->id && $this->admin_user_data_exists($user_info->id) ){
			// 既に存在します。
			return (object) array(
				'result' => false,
				'message' => '新しいユーザーIDは既に存在します。',
				'errors' => (object) array(
					'id' => array('新しいユーザーIDは既に存在します。'),
				),
			);
		}

		// 新しいIDのためにファイル名を変更
		$res_rename = $this->rename_admin_user_data($target_user_id, $user_info->id);
		if( !$res_rename ){
			return (object) array(
				'result' => false,
				'message' => 'ユーザーIDの変更に失敗しました。',
				'errors' => (object) array(),
			);
		}

		if( !$this->write_admin_user_data($user_info->id, $user_info) ){
			return (object) array(
				'result' => false,
				'message' => 'ユーザー情報の保存に失敗しました。',
				'errors' => (object) array(),
			);
		}

		$log_message = 'Admin user \''.$user_info->id.'\' info updated.';
		if($target_user_id != $user_info->id){
			$log_message .= '; ID changed \''.$target_user_id.'\' to \''.$user_info->id.'\'';
		}
		if(isset($new_profile->pw) && is_string($new_profile->pw) && strlen($new_profile->pw)){
			$log_message .= '; Password changed';
		}
		$this->logger()->log($log_message);

		return $result;
	}


	/**
	 * 管理者ユーザーの情報を削除する
	 *
	 * @param string $target_user_id 削除対象のユーザーID
	 * @param string $login_password ログインしているユーザーの現在のパスワード
	 */
	public function delete_admin_user_info( $target_user_id, $login_password ){

		if( !$this->verify_admin_user_password($login_password) ){
			// 現在のパスワードを確認
			return (object) array(
				'result' => false,
				'message' => 'Authentication Failed.',
				'errors' => (object) array(
					'current_pw' => array('現在のログインパスワードを正しく入力してください。'),
				),
			);
		}

		$result = (object) array(
			'result' => true,
			'message' => 'OK',
			'errors' => (object) array(),
		);
		if( !is_string($target_user_id) || !strlen($target_user_id) ){
			// 削除対象が未指定
			return (object) array(
				'result' => false,
				'message' => '削除対象を指定してください。',
				'errors' => (object) array(),
			);
		}

		if( !$this->validate_admin_user_id($target_user_id) ){
			// 不正な形式のID
			return (object) array(
				'result' => false,
				'message' => 'ログインユーザーのIDが不正です。',
				'errors' => (object) array(),
			);
		}

		$user_info = $this->get_admin_user_info_full( $target_user_id );
		if( !is_object($user_info) ){
			return (object) array(
				'result' => false,
				'message' => 'ユーザー情報の取得に失敗しました。',
				'errors' => (object) array(),
			);
		}

		if( !$this->remove_admin_user_data($user_info->id) ){
			return (object) array(
				'result' => false,
				'message' => 'ユーザー情報の削除に失敗しました。',
				'errors' => (object) array(),
			);
		}

		return $result;
	}



	/**
	 * Validation: ユーザーID
	 */
	private function validate_admin_user_id( $user_id ){
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
	private function validate_admin_user_info( $user_info ){
		$rtn = (object) array(
			'is_valid' => true,
			'message' => null,
			'errors' => (object) array(),
		);
		$user_info = (object) $user_info;

		if( !strlen($user_info->id ?? '') ){
			// IDが未指定
			$rtn->is_valid = false;
			$rtn->errors->id = array($this->lang()->get('error_message.required_user_id'));
		}elseif( !$this->validate_admin_user_id($user_info->id) ){
			// 不正な形式のID
			$rtn->is_valid = false;
			$rtn->errors->id = array($this->lang()->get('error_message.invalid_user_id'));
		}
		if( !isset($user_info->name) || !strlen($user_info->name) ){
			$rtn->is_valid = false;
			$rtn->errors->name = array($this->lang()->get('error_message.required'));
		}
		if( !isset($user_info->pw) || !strlen($user_info->pw) ){
			$rtn->is_valid = false;
			$rtn->errors->pw = array($this->lang()->get('error_message.required'));
		}
		if( !isset($user_info->lang) || !strlen($user_info->lang) ){
			$rtn->is_valid = false;
			$rtn->errors->lang = array($this->lang()->get('error_message.required_select'));
		}
		if( isset($user_info->email) && is_string($user_info->email) && strlen($user_info->email) ){
			if( !preg_match('/^[^@\/\\\\]+\@[^@\/\\\\]+$/', $user_info->email) ){
				$rtn->is_valid = false;
				$rtn->errors->email = array($this->lang()->get('error_message.invalid_email'));
			}
		}
		if( !isset($user_info->role) || !strlen($user_info->role) ){
			$rtn->is_valid = false;
			$rtn->errors->role = array($this->lang()->get('error_message.required_select'));
		}
		switch( $user_info->role ){
			case 'admin':
			case 'member':
				break;
			default:
				$rtn->is_valid = false;
				$rtn->errors->role = array($this->lang()->get('error_message.invalid_role'));
				break;
		}
		if( $rtn->is_valid ){
			$rtn->message = 'OK';
		}else{
			$rtn->message = $this->lang()->get('error_message.invalid');
		}
		return $rtn;
	}


	// --------------------------------------
	// 管理ユーザーデータファイルの読み書き

	/**
	 * 管理ユーザーデータファイルの読み込み
	 */
	private function read_admin_user_data( $user_id ){
		$realpath_json = $this->realpath_admin_user_dir.urlencode($user_id).'.json';
		$realpath_json_php = $realpath_json.'.php';
		if( is_file($realpath_json_php) ){
			$data = dataDotPhp::read_json($realpath_json_php);
			return $data;
		}
		if( is_file($realpath_json) ){
			$data = json_decode(file_get_contents($realpath_json));
			return $data;
		}
		return false;
	}

	/**
	 * 管理ユーザーデータファイルが存在するか確認する
	 */
	private function admin_user_data_exists( $user_id ){
		$realpath_json = $this->realpath_admin_user_dir.urlencode($user_id).'.json';
		$realpath_json_php = $realpath_json.'.php';
		if( is_file( $realpath_json ) || is_file($realpath_json_php) ){
			return true;
		}
		return false;
	}

	/**
	 * 管理ユーザーデータファイルの書き込み
	 */
	private function write_admin_user_data( $user_id, $new_profile ){
		// deepcopy
		$new_profile = json_decode( json_encode($new_profile) );

		if( !is_string($user_id) || !strlen($user_id ?? '') ){
			return false;
		}
		if( !is_object($new_profile) ){
			return false;
		}
		if( $new_profile->id !== $user_id ){
			return false;
		}

		$write_data = (object) array();
		$write_data->name = $new_profile->name ?? null;
		$write_data->id = $new_profile->id ?? null;
		$write_data->pw = $new_profile->pw ?? null;
		$write_data->lang = $new_profile->lang ?? null;
		$write_data->email = $new_profile->email ?? null;
		$write_data->role = $new_profile->role ?? null;
		$write_data->appearance = $new_profile->appearance ?? null;

		$realpath_json = $this->realpath_admin_user_dir.urlencode($user_id).'.json';
		$realpath_json_php = $realpath_json.'.php';
		$result = dataDotPhp::write_json($realpath_json_php, $write_data);
		if( !$result ){
			return false;
		}
		$this->fs->chmod_r($this->realpath_admin_user_dir, 0700, 0700);

		if( is_file($realpath_json) ){
			unlink($realpath_json); // 素のJSONがあったら削除する
		}
		return $result;
	}

	/**
	 * 管理ユーザーデータファイルを改名
	 */
	private function rename_admin_user_data( $user_id, $new_user_id ){
		$realpath_json = $this->realpath_admin_user_dir.urlencode($user_id).'.json';
		$realpath_json_php = $realpath_json.'.php';

		$realpath_new_json = $this->realpath_admin_user_dir.urlencode($new_user_id).'.json';
		$realpath_new_json_php = $realpath_new_json.'.php';

		$result = true;

		if( is_file( $realpath_json ) ){
			$res_rename = $this->fs->rename(
				$realpath_json,
				$realpath_new_json
			);
			if( !$res_rename ){
				$result = false;
			}
		}

		if( is_file( $realpath_json_php ) ){
			$res_rename = $this->fs->rename(
				$realpath_json_php,
				$realpath_new_json_php
			);
			if( !$res_rename ){
				$result = false;
			}
		}

		return $result;
	}

	/**
	 * 管理ユーザーデータファイルを削除
	 */
	private function remove_admin_user_data( $user_id ){
		$realpath_json = $this->realpath_admin_user_dir.urlencode($user_id).'.json';
		$realpath_json_php = $realpath_json.'.php';
		$result = true;
		if( is_file($realpath_json) ){
			if(!unlink($realpath_json)){
				$result = false;
			}
		}
		if( is_file($realpath_json_php) ){
			if(!unlink($realpath_json_php)){
				$result = false;
			}
		}
		return $result;
	}


	// --------------------------------------
	// CSRFトークン

	/**
	 * CSRFトークンを取得する
	 */
	public function get_csrf_token(){
		$CSRF_TOKEN = $this->req->get_session('ADMIN_USER_CSRF_TOKEN');
		if( !is_array($CSRF_TOKEN) ){
			$CSRF_TOKEN = array();
		}
		if( !count($CSRF_TOKEN) ){
			return $this->create_csrf_token();
		}
		foreach( $CSRF_TOKEN as $token ){
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
		$CSRF_TOKEN = $this->req->get_session('ADMIN_USER_CSRF_TOKEN');
		if( !is_array($CSRF_TOKEN) ){
			$CSRF_TOKEN = array();
		}

		$hash = bin2hex(random_bytes(32));
		array_push($CSRF_TOKEN, array(
			'hash' => $hash,
			'created_at' => time(),
		));
		$this->req->set_session('ADMIN_USER_CSRF_TOKEN', $CSRF_TOKEN);
		return $hash;
	}

	/**
	 * CSRFトークンの検証を行わない条件を調査
	 */
	private function is_csrf_token_required(){
		$command = $this->px->get_px_command();
		if( !is_array($command) || !count($command) || (count($command) == 1 && !strlen($command[0])) ){
			// --------------------------------------
			// プレビューリクエスト
			// PXコマンドなしのリクエストでは、CSRFトークンを要求しない (POSTでも要求しない)
			// NOTE: PXコマンドがないリクエストは、管理画面ではなくウェブサイト側の処理なので、cloverが制御するべきではない。 Paprika に委ねるべき。
			return false;

		}elseif( $command[0] == 'admin' ){
			// --------------------------------------
			// px2-clover 管理画面
			$subCmd = (isset( $command[1] ) ? $command[1] : '');
			switch($subCmd){
				case '':
				case 'logout':
				case 'config':
				case 'page_info':
				case 'blog':
				case 'sitemap':
				case 'theme':
				case 'edit_content':
				case 'edit_theme_layout':
				case 'publish':
				case 'clearcache':
				case 'modules':
				case 'history':
				case 'cce':
					if( strtoupper($_SERVER['REQUEST_METHOD'] ?? '') == 'GET' ){
						// 既知の特定の画面へのGETのリクエストでは、CSRFトークンを要求しない
						return false;
					}
					break;
			}
		}else{
			// --------------------------------------
			// その他のPXコマンドではCSRFトークンが必要
		}
		return true;
	}

	/**
	 * 有効なCSRFトークンを受信したか
	 */
	public function is_valid_csrf_token_given(){

		$CSRF_TOKEN = $this->req->get_param('ADMIN_USER_CSRF_TOKEN');
		if( !$CSRF_TOKEN ){
			$headers = getallheaders();
			foreach($headers as $header_name=>$header_val){
				if( strtolower($header_name) == 'x-px2-clover-admin-csrf-token' ){
					$CSRF_TOKEN = $header_val;
					break;
				}
			}
		}
		if( !$CSRF_TOKEN ){
			return false;
		}

		$CSRF_TOKEN_LIST = $this->req->get_session('ADMIN_USER_CSRF_TOKEN');
		if( !is_array($CSRF_TOKEN_LIST) ){
			$CSRF_TOKEN_LIST = array();
		}
		foreach( $CSRF_TOKEN_LIST as $idx => $token ){
			if( $token['created_at'] < time() - $this->csrf_token_expire ){
				// 有効期限が切れていたら評価できない。
				// 配列から削除する。
				unset($CSRF_TOKEN_LIST[$idx]);
				$this->req->set_session('ADMIN_USER_CSRF_TOKEN', $CSRF_TOKEN_LIST);
				continue;
			}
			if( $token['hash'] == $CSRF_TOKEN ){
				return true;
			}
		}

		return false;
	}
}
