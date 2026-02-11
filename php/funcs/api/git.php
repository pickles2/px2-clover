<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: Git操作API
 */
class git{

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
	 * Gitコマンドを直接実行する
	 */
	public function git(){
		$this->px->header('Content-type: text/json');

		$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
		$json_git_command = $this->px->req()->get_param('git');
		$git_command_array = json_decode($json_git_command);
		$rtn = $gitHelper->git( $git_command_array );

		echo json_encode($rtn);
		exit;
	}

	/**
	 * コミットする
	 * autoCommit機能からコールされる
	 */
	public function commit(){
		$this->px->header('Content-type: text/json');

		$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
		$rtn = $gitHelper->commit();

		echo json_encode($rtn);
		exit;
	}

	// /**
	//  * 状態を知る
	//  */
	// public function status(){
	// 	$this->px->header('Content-type: text/json');

	// 	$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
	// 	$rtn = $gitHelper->status();

	// 	echo json_encode($rtn);
	// 	exit;
	// }

	// /**
	//  * フェッチする
	//  */
	// public function fetch(){
	// 	$this->px->header('Content-type: text/json');

	// 	$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
	// 	$rtn = $gitHelper->fetch();

	// 	echo json_encode($rtn);
	// 	exit;
	// }

	// /**
	//  * プルする
	//  */
	// public function pull(){
	// 	$this->px->header('Content-type: text/json');

	// 	$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
	// 	$rtn = $gitHelper->fetch();
	// 	$rtn = $gitHelper->pull();

	// 	echo json_encode($rtn);
	// 	exit;
	// }

	// /**
	//  * プッシュする
	//  */
	// public function push(){
	// 	$this->px->header('Content-type: text/json');

	// 	$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
	// 	$rtn = $gitHelper->fetch();
	// 	$rtn = $gitHelper->push();

	// 	echo json_encode($rtn);
	// 	exit;
	// }

	/**
	 * ワークツリーからファイルを取得する
	 */
	public function get_working_tree_file(){
		$this->px->header('Content-type: text/json');

		$filePath = $this->px->req()->get_param('filePath');
		if( !is_string($filePath) || !strlen($filePath) ){
			echo json_encode(array(
				'result' => false,
				'error' => true,
				'message' => 'File path is required.',
			));
			exit;
		}

		// セキュリティ: パス トラバーサル攻撃を防ぐ
		if( strpos($filePath, '..') !== false || strpos($filePath, '\\') !== false ){
			echo json_encode(array(
				'result' => false,
				'error' => true,
				'message' => 'Invalid file path.',
			));
			exit;
		}

		// Gitルートディレクトリを取得
		$gitRoot = $this->clover->realpath_git_root();
		if( !$gitRoot || !is_dir($gitRoot) ){
			echo json_encode(array(
				'result' => false,
				'error' => true,
				'message' => 'Git repository not found.',
			));
			exit;
		}

		// ファイルの絶対パスを構築
		$realpath = $gitRoot . DIRECTORY_SEPARATOR . ltrim($filePath, '/');
		$realpath = realpath($realpath);

		// セキュリティ: Gitルート外へのアクセスを防ぐ
		if( !$realpath || strpos($realpath, $gitRoot) !== 0 ){
			echo json_encode(array(
				'result' => false,
				'error' => true,
				'message' => 'File not found or access denied.',
			));
			exit;
		}

		// ファイルが存在し、読み取り可能かチェック
		if( !is_file($realpath) || !is_readable($realpath) ){
			echo json_encode(array(
				'result' => false,
				'error' => true,
				'message' => 'File not found or not readable.',
			));
			exit;
		}

		// ファイルを読み込んでBase64エンコード
		$content = file_get_contents($realpath);
		if( $content === false ){
			echo json_encode(array(
				'result' => false,
				'error' => true,
				'message' => 'Failed to read file.',
			));
			exit;
		}

		echo json_encode(array(
			'result' => true,
			'content' => base64_encode($content),
		));
		exit;
	}

}
