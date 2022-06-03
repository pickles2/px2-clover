<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: ログ管理機能
 */
class logger{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** ログディレクトリ */
	private $realpath_logs;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $this->clover->px();

		// ログディレクトリ
		$this->realpath_logs = $this->clover->realpath_private_data_dir('/logs/');
		if( !is_dir($this->realpath_logs) ){
			$this->px->fs()->mkdir_r($this->realpath_logs);
		}
	}


	/**
	 * メッセージを記録する
	 */
	public function log(){
		$trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 1);
		$arg_list = func_get_args();
	
		$message = '';
		if( count($arg_list) == 1 && is_string($arg_list[0]) ){
			$message = $arg_list[0];
		}elseif( count($arg_list) == 1 ){
			$message = json_encode($arg_list[0]);
		}else{
			$message = json_encode($arg_list);
		}

		$log = array(
			date('Y-m-d H:i:s'), // 時刻
			getmypid(), // プロセスID
			$this->px->req()->get_session('ADMIN_USER_ID'), // ログインユーザーID (未ログイン時は null)
			$message, // ログメッセージ
			$trace[0]['file'], // 呼び出したスクリプトファイル
			$trace[0]['line'], // 呼び出した行番号
		);
		error_log( implode("\t", $log)."\n", 3, $this->realpath_logs.'log-'.date('Y-m-d').'.tsv' );
		return;
	}

	/**
	 * エラーメッセージを記録する
	 */
	public function error_log(){
		$trace = debug_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS, 1);
		$arg_list = func_get_args();
	
		$message = '';
		if( count($arg_list) == 1 && is_string($arg_list[0]) ){
			$message = $arg_list[0];
		}elseif( count($arg_list) == 1 ){
			$message = json_encode($arg_list[0]);
		}else{
			$message = json_encode($arg_list);
		}

		$log = array(
			date('Y-m-d H:i:s'), // 時刻
			getmypid(), // プロセスID
			$this->px->req()->get_session('ADMIN_USER_ID'), // ログインユーザーID (未ログイン時は null)
			$message, // ログメッセージ
			$trace[0]['file'], // 呼び出したスクリプトファイル
			$trace[0]['line'], // 呼び出した行番号
		);
		error_log( implode("\t", $log)."\n", 3, $this->realpath_logs.'errorlog-'.date('Y-m-d').'.tsv' );

		$log = array(
			date('Y-m-d H:i:s'), // 時刻
			getmypid(), // プロセスID
			$this->px->req()->get_session('ADMIN_USER_ID'), // ログインユーザーID (未ログイン時は null)
			'Error: '.$message, // ログメッセージ
			$trace[0]['file'], // 呼び出したスクリプトファイル
			$trace[0]['line'], // 呼び出した行番号
		);
		error_log( implode("\t", $log)."\n", 3, $this->realpath_logs.'log-'.date('Y-m-d').'.tsv' );
		return;
	}

}
