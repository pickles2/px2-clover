<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: Gitリポジトリを初期化する
 */
class gitInit{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;


	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
	}

	/**
	 * Gitリポジトリを初期化する
	 */
	public function git_init(){
		$this->px->header('Content-type: text/json');

		$realpath_git_root = $this->clover->realpath_git_root();
		if( $realpath_git_root && is_dir($realpath_git_root) ){
			$this->px->error('Git repository is already initialized.');
			echo json_encode(array(
				"result" => false,
				"message" => "Git repository is already initialized.",
			));
			exit;
		}


		// composer.json と同階層で初期化する
		$realpath_git_root = $this->clover->realpath_composer_root();
		if( !$realpath_git_root || !is_dir($realpath_git_root) ){
			$this->px->error('Composer root is not found.');
			echo json_encode(array(
				"result" => false,
				"message" => "Composer root is not found.",
			));
			exit;
		}

		$cd = realpath('.');
		chdir($realpath_git_root);

		shell_exec('git init');

		chdir($cd);

		clearstatcache();

		$realpath_git_root = $this->clover->realpath_git_root();
		if( $realpath_git_root && is_dir($realpath_git_root) ){
			$this->px->error('Failed to git init.');
			echo json_encode(array(
				"result" => false,
				"message" => "Failed to git init.",
			));
			exit;
		}

		echo json_encode(array(
			"result" => true,
			"message" => "OK",
		));
		exit;
	}

}
