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

		$remote_addr = null;
		if( isset($_SERVER["REMOTE_ADDR"]) ){
			$remote_addr = $_SERVER["REMOTE_ADDR"];
		}

		$log = array(
			date('c'), // 時刻
			getmypid(), // プロセスID
			$this->px->req()->get_session('ADMIN_USER_ID'), // ログインユーザーID (未ログイン時は null)
			$message, // ログメッセージ
			$trace[0]['file'], // 呼び出したスクリプトファイル
			$trace[0]['line'], // 呼び出した行番号
			$remote_addr, // IPアドレス
		);

		dataDotPhp::write_a( $this->realpath_logs.'log-'.gmdate('Y-m-d').'Z.csv.php', $this->px->fs()->mk_csv( array($log) ) );
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

		$remote_addr = null;
		if( isset($_SERVER["REMOTE_ADDR"]) ){
			$remote_addr = $_SERVER["REMOTE_ADDR"];
		}

		$log_datetime = date('c');
		$log_date = gmdate('Y-m-d').'Z';

		$log = array(
			$log_datetime, // 時刻
			getmypid(), // プロセスID
			$this->px->req()->get_session('ADMIN_USER_ID'), // ログインユーザーID (未ログイン時は null)
			$message, // ログメッセージ
			$trace[0]['file'], // 呼び出したスクリプトファイル
			$trace[0]['line'], // 呼び出した行番号
			$remote_addr, // IPアドレス
		);
		dataDotPhp::write_a( $this->realpath_logs.'errorlog-'.$log_date.'.csv.php', $this->px->fs()->mk_csv( array($log) ) );

		$log = array(
			$log_datetime, // 時刻
			getmypid(), // プロセスID
			$this->px->req()->get_session('ADMIN_USER_ID'), // ログインユーザーID (未ログイン時は null)
			'Error: '.$message, // ログメッセージ
			$trace[0]['file'], // 呼び出したスクリプトファイル
			$trace[0]['line'], // 呼び出した行番号
			$remote_addr, // IPアドレス
		);
		dataDotPhp::write_a( $this->realpath_logs.'log-'.$log_date.'.csv.php', $this->px->fs()->mk_csv( array($log) ) );
		return;
	}

}
