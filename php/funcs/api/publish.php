<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: パブリッシュ操作API
 */
class publish{

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
	 * 進行中のパブリッシュプロセスを停止する
	 */
	public function stop(){
		$this->px->header('Content-type: text/json');

		$realpath_tmp_publish = $this->px->get_realpath_homedir().'_sys/ram/publish/';
		$realpath_lockfile = $realpath_tmp_publish.'applock.txt';
		if( !is_file($realpath_lockfile) ){
			echo json_encode(array(
				"result" => false,
				"message" => "Publish is not progress.",
			));
			exit;
		}

		$src_lockfile = file_get_contents($realpath_lockfile);
		if( !preg_match('/ProcessID\=([0-9]+)/si', $src_lockfile, $matched) ){
			echo json_encode(array(
				"result" => false,
				"message" => "Failed to parse lockfile.",
			));
			exit;
		}

		$pid = intval( $matched[1] );
		if( !$pid ){
			echo json_encode(array(
				"result" => false,
				"message" => "Failed to parse lockfile.",
			));
			exit;
		}

		$cmd = implode(' ', array('kill', $pid));
		if( $this->px->fs()->is_windows() ){
			$cmd = implode(' ', array('taskkill', '/F', '/pid', $pid)); // Windows では 強制(/F)しないと落ちてくれなかった
		}

		// プロセスをkill
		exec( $cmd );

		// ロックファイルを削除
		unlink( $realpath_lockfile );

		echo json_encode(array(
			"result" => true,
			"message" => "OK",
		));
		exit;
	}

}
