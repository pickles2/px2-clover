<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: 起動時の情報取得
 */
class bootupInformations {

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** Clover Config オブジェクト */
	private $cloverConfig;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
		$this->cloverConfig = new \tomk79\pickles2\px2clover\helpers\config( $clover );
	}

	/**
	 * faviconのパスを取得
	 *
	 * @return string|null faviconのパス(プロジェクトルートからの相対パス)、見つからない場合はnull
	 */
	private function get_favicon_path(){
		$realpath_docroot = $this->px->get_realpath_docroot();
		
		// 一般的なfaviconのファイル名パターン
		$favicon_patterns = array(
			'favicon.ico',
			'favicon.png',
			'favicon.jpg',
			'favicon.jpeg',
			'favicon.gif',
			'favicon.svg',
		);
		
		// ドキュメントルート直下を検索
		foreach($favicon_patterns as $pattern){
			$favicon_path = $realpath_docroot . $pattern;
			if( is_file($favicon_path) ){
				return '/' . $pattern;
			}
		}
		
		// 見つからなかった場合はnull
		return null;
	}

	/**
	 * 取得
	 */
	public function get(){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$rtn['bootupInfo'] = array();
		$rtn['bootupInfo']['cmd_version'] = array();

		// PHP version
		ob_start();
		passthru(($this->px->conf()->commands->php ?? 'php').' -v', $phpResultCode);
		$php_version = ob_get_clean();
		$rtn['bootupInfo']['cmd_version']['php'] = false;
		if( strlen($php_version ?? '') ){
			$rtn['bootupInfo']['cmd_version']['php'] = trim($php_version);
		}

		// composer version
		ob_start();
		passthru(($this->px->conf()->commands->composer ?? 'composer').' --version', $composerResultCode);
		$composer_version = ob_get_clean();
		$rtn['bootupInfo']['cmd_version']['composer'] = false;
		if( strlen($composer_version ?? '') ){
			$rtn['bootupInfo']['cmd_version']['composer'] = trim($composer_version);
		}

		// git version
		ob_start();
		passthru(($this->px->conf()->commands->git ?? 'git').' --version', $gitResultCode);
		$git_version = ob_get_clean();
		$rtn['bootupInfo']['cmd_version']['git'] = false;
		if( strlen($git_version ?? '') ){
			$rtn['bootupInfo']['cmd_version']['git'] = trim($git_version);
		}


		// git availability
		$rtn['bootupInfo']['git'] = array();

		// git init 済みか？
		$realpath_git_root = $this->clover->realpath_git_root();
		$rtn['bootupInfo']['git']['is_init'] = (is_string($realpath_git_root) && strlen($realpath_git_root));


		// Authorization
		$rtn['bootupInfo']['authorization'] = array();
		$rtn['bootupInfo']['authorization']['manage'] = $this->px->authorizer->is_authorized('manage');
		$rtn['bootupInfo']['authorization']['members'] = $this->px->authorizer->is_authorized('members');
		$rtn['bootupInfo']['authorization']['config'] = $this->px->authorizer->is_authorized('config');
		$rtn['bootupInfo']['authorization']['server_side_scripting'] = $this->px->authorizer->is_authorized('server_side_scripting');
		$rtn['bootupInfo']['authorization']['write_file_directly'] = $this->px->authorizer->is_authorized('write_file_directly');


		// favicon
		$rtn['bootupInfo']['favicon'] = $this->get_favicon_path();


		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}
}
