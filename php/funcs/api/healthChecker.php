<?php
namespace tomk79\pickles2\px2clover\funcs\api;
use tomk79\pickles2\px2clover\helpers\scheduler as schedulerHelper;

/**
 * px2-clover: 状態チェックAPI
 */
class healthChecker{

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
	 * タスクスケジュールの状態を確認する
	 */
	public function status(){
		$this->px->header('Content-type: text/json');

		// --------------------------------------
		// スケジューラ関連の情報収集
		$schedulerHelper = new schedulerHelper($this->clover);
		$realpath_admin_scheduler = $schedulerHelper->realpath_admin_scheduler();
		$realpath_status_json = $realpath_admin_scheduler.'/status.json';

		$scheduler_status_json = (object) array();
		if( is_file($realpath_status_json) ){
			$str_json = file_get_contents($realpath_status_json);
			$scheduler_status_json = json_decode( $str_json );
		}
		if( !is_object($scheduler_status_json) ){
			$scheduler_status_json = (object) array();
		}
		if( !isset($scheduler_status_json->last_run_at) || !is_string($scheduler_status_json->last_run_at) ){
			$scheduler_status_json->last_run_at = null;
		}

		$scheduler_is_available = false;
		$timestamp_last_run_at = null;
		$scheduler_elapsed = null;
		if( $scheduler_status_json->last_run_at ){
			$timestamp_last_run_at = strtotime( $scheduler_status_json->last_run_at );
			$scheduler_elapsed = time() - $timestamp_last_run_at;
			if( $scheduler_elapsed < (5 * 60) ){
				$scheduler_is_available = true;
			}
		}

		$scheduler_queue_files = $this->px->fs()->ls($realpath_admin_scheduler.'queue/');
		$scheduler_progress_files = $this->px->fs()->ls($realpath_admin_scheduler.'progress/');


		// --------------------------------------
		// パブリッシュ関連の情報収集
		$realpath_tmp_publish = $this->px->get_realpath_homedir().'_sys/ram/publish/';
		$publish_is_running = false;
		if( is_file( $realpath_tmp_publish.'applock.txt' ) ){
			$publish_is_running = true;
		}

		echo json_encode(array(
			'result' => true,
			'message' => 'OK',
			'scheduler' => array(
				'elapsed' => $scheduler_elapsed, // 最後の実行からの経過秒
				'is_available' => $scheduler_is_available, // スケジューラが利用可能か
				'last_run_at' => $scheduler_status_json->last_run_at, // 最終実行時刻
				'queue' => $scheduler_queue_files,
				'progress' => $scheduler_progress_files,
			),
			'publish' => array(
				'is_running' => $publish_is_running,
			),
		));
		exit;
	}

}
