<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: Scheduler Helper
 */
class scheduler{

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

		// 管理ディレクトリの初期化
		$realpath_admin_scheduler = $this->realpath_admin_scheduler();
		if( !is_dir( $realpath_admin_scheduler ) ){
			$this->px->fs()->mkdir( $realpath_admin_scheduler );
		}
		if( !is_dir( $realpath_admin_scheduler.'queue/' ) ){
			$this->px->fs()->mkdir( $realpath_admin_scheduler.'queue/' );
		}
		if( !is_dir( $realpath_admin_scheduler.'progress/' ) ){
			$this->px->fs()->mkdir( $realpath_admin_scheduler.'progress/' );
		}
		if( !is_dir( $realpath_admin_scheduler.'done/' ) ){
			$this->px->fs()->mkdir( $realpath_admin_scheduler.'done/' );
		}
		if( !is_dir( $realpath_admin_scheduler.'logs/' ) ){
			$this->px->fs()->mkdir( $realpath_admin_scheduler.'logs/' );
		}
	}


	/**
	 * スケジューラ関連ファイルの管理ディレクトリを取得する
	 */
	public function realpath_admin_scheduler(){
		$realpath_admin_scheduler = $this->clover->realpath_private_data_dir('/scheduler/');
		return $realpath_admin_scheduler;
	}

	/**
	 * タスクスケジュールの実行ログを出力する
	 */
	public function log( $row ){
		$realpath_admin_scheduler = $this->realpath_admin_scheduler();
		$realpath_log = $realpath_admin_scheduler.'logs/scheduler-'.date('Y-m-d').'.txt';
		$log_row = array(
			date('Y-m-d H:i:s'),
			getmypid(),
			trim($row),
		);
		return file_put_contents( $realpath_log, implode('	', $log_row)."\n", FILE_APPEND|LOCK_EX );
	}

}
