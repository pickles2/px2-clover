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

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}
}
