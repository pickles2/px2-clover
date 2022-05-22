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
	 */
	public function commit(){
		$this->px->header('Content-type: text/json');

		$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
		$rtn = $gitHelper->commit();

		echo json_encode($rtn);
		exit;
	}

	/**
	 * 状態を知る
	 */
	public function status(){
		$this->px->header('Content-type: text/json');

		$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
		$rtn = $gitHelper->status();

		echo json_encode($rtn);
		exit;
	}

	/**
	 * フェッチする
	 */
	public function fetch(){
		$this->px->header('Content-type: text/json');

		$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
		$rtn = $gitHelper->fetch();

		echo json_encode($rtn);
		exit;
	}

	/**
	 * プルする
	 */
	public function pull(){
		$this->px->header('Content-type: text/json');

		$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
		$rtn = $gitHelper->fetch();
		$rtn = $gitHelper->pull();

		echo json_encode($rtn);
		exit;
	}

	/**
	 * プッシュする
	 */
	public function push(){
		$this->px->header('Content-type: text/json');

		$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
		$rtn = $gitHelper->fetch();
		$rtn = $gitHelper->push();

		echo json_encode($rtn);
		exit;
	}

}
