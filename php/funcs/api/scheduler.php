<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: プロフィール情報API
 */
class scheduler{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** タスクスケジューラ管理ディレクトリ */
	private $realpath_admin_scheduler;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();

		// タスクスケジューラ管理ディレクトリ
		$this->realpath_admin_scheduler = $this->clover->realpath_private_data_dir('/scheduler/');
	}

	/**
	 * タスクスケジュールの状態を確認する
	 */
	public function status(){
		$this->px->header('Content-type: text/json');

		$realpath_status_json = $this->realpath_admin_scheduler.'/status.json';
		if( !is_file($realpath_status_json) ){
			echo json_encode(array(
				'result' => false,
				'message' => 'Task Scheduler is not active.',
			));
			exit;
		}

		$str_json = file_get_contents($realpath_status_json);
		$json = json_decode( $str_json );
		if( !is_object($json) || !isset($json->last_run_at) || !is_string($json->last_run_at) ){
			echo json_encode(array(
				'result' => false,
				'message' => 'Task Scheduler is not active.',
			));
			exit;
		}

		$is_available = false;
		$timestamp_last_run_at = strtotime( $json->last_run_at );
		$elapsed = time() - $timestamp_last_run_at;
		if( $elapsed < (60 * 10) ){
			$is_available = true;
		}

		echo json_encode(array(
			'result' => true,
			'message' => 'OK',
			'elapsed' => $elapsed, // 最後の実行からの経過秒
			'is_available' => $is_available, // スケジューラが利用可能か
			'last_run_at' => $json->last_run_at, // 最終実行時刻
		));
		exit;
	}

	/**
	 * 設定のためのヒント情報を取得する
	 */
	public function setting_hint(){
		$this->px->header('Content-type: text/json');

		$script_filename = null;
		if( isset($_SERVER['SCRIPT_FILENAME']) && strlen($_SERVER['SCRIPT_FILENAME']) ){
			$script_filename = $_SERVER['SCRIPT_FILENAME'];
		}

		$path_php = 'php';
		if( isset($this->px->conf()->commands->php) && strlen($this->px->conf()->commands->php) ){
			$path_php = $this->px->conf()->commands->php;
		}

		$user = null;
		$group = null;

		try {
			$user = exec('whoami');
			// $group = exec('groups ' .$user);
			// $group = explode(' ', $group);
		}
		catch(e){}

		echo json_encode(array(
			'result' => true,
			'message' => 'OK',
			'path_php' => $path_php,
			'script_filename' => $script_filename,
			'user' => $user,
			// 'group' => $group,
		));
		exit;
	}

	/**
	 * タスクスケジュールを実行する
	 */
	public function run(){
		$started_time = time();
		$this->log('======== start: scheduler');

		$this->px->header('Content-type: text/json');

		if( !is_dir( $this->realpath_admin_scheduler ) ){
			$this->px->fs()->mkdir( $this->realpath_admin_scheduler );
		}
		$realpath_status_json = $this->realpath_admin_scheduler.'status.json';

		$json = array(
			'last_run_at' => date('Y-m-d H:i:s'),
		);
		$str_json = json_encode($json);
		if( !$this->px->fs()->save_file( $realpath_status_json, $str_json ) ){
			$this->log('--- Error: Failed to write status.json');
			echo json_encode(array(
				'result' => false,
				'message' => 'Failed to write status.json',
			));
			exit;
		}

		// 排他ロックの開始
		if( !$this->px->lock('px2-clover--task-scheduler', 60*30) ){
			$this->log('--- Exit: Application Locked.');
			echo json_encode(array(
				'result' => false,
				'message' => 'Application Locked.',
			));
			exit;
		}

		if( !is_dir( $this->realpath_admin_scheduler.'queue/' ) ){
			$this->px->fs()->mkdir( $this->realpath_admin_scheduler.'queue/' );
		}
		if( !is_dir( $this->realpath_admin_scheduler.'progress/' ) ){
			$this->px->fs()->mkdir( $this->realpath_admin_scheduler.'progress/' );
		}
		if( !is_dir( $this->realpath_admin_scheduler.'done/' ) ){
			$this->px->fs()->mkdir( $this->realpath_admin_scheduler.'done/' );
		}
		if( !is_dir( $this->realpath_admin_scheduler.'logs/' ) ){
			$this->px->fs()->mkdir( $this->realpath_admin_scheduler.'logs/' );
		}

		// 排他ロックの解除
		$this->px->unlock('px2-clover--task-scheduler');

		$this->log('--- Exit ('.(time() - $started_time).')');
		echo json_encode(array(
			'result' => true,
			'message' => 'OK',
		));
		exit;
	}

	/**
	 * タスクスケジュールの実行ログを出力する
	 */
	private function log( $row ){
		if( !is_dir( $this->realpath_admin_scheduler.'logs/' ) ){
			$this->px->fs()->mkdir( $this->realpath_admin_scheduler.'logs/' );
		}
		$realpath_log = $this->realpath_admin_scheduler.'logs/scheduler-'.date('Y-m-d').'.txt';
		$log_row = array(
			date('Y-m-d H:i:s'),
			getmypid(),
			trim($row),
		);
		file_put_contents( $realpath_log, implode('	', $log_row)."\n", FILE_APPEND|LOCK_EX );
		return;
	}

}
