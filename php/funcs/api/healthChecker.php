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

	/** タスクスケジューラヘルパーオブジェクト */
	private $schedulerHelper;

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
		$this->schedulerHelper = new schedulerHelper($clover);

		// タスクスケジューラ管理ディレクトリ
		$this->realpath_admin_scheduler = $this->schedulerHelper->realpath_admin_scheduler();
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
		if( $elapsed < (5 * 60) ){
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

}
