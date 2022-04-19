<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover: auth
 */
class auth{

	/** Picklesオブジェクト */
	private $px;


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
		if( $this->px->req()->get_param('ADMIN_USER_FLG') ){
			if( $this->px->req()->get_param('ADMIN_USER_ID') == 'admin' && $this->px->req()->get_param('ADMIN_USER_PW') == 'admin' ){
				$this->px->req()->set_session('ADMIN_USER_ID', $this->px->req()->get_param('ADMIN_USER_ID'));
				header('Location:'.$this->px->href( $this->px->req()->get_request_file_path().'?PX='.htmlspecialchars(''.$this->px->req()->get_param('PX')) ));
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
		$this->px->req()->delete_session('ADMIN_USER_ID');
		$pxcmd = $this->px->req()->get_param('PX');
		if( $pxcmd == 'admin.logout' ){
			$pxcmd = 'admin';
		}
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
</form>
<p><a href="<?= htmlspecialchars($this->px->href( $this->px->req()->get_request_file_path() )); ?>">戻る</a></p>
</body>
</html>
<?php
		$src = ob_get_clean();
		echo $src;
		exit;
	}
}
