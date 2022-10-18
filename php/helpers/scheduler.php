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
	 * タスクスケジュールを追加する
	 */
	public function add_queue($service, $time, $name, $options = array()){
		$realpath_queue = $this->realpath_admin_scheduler().'queue/';
		$options = (object) $options;

		// service
		switch( $service ){
			case 'publish':
			case 'git-commit':
				break;
			default:
				$this->px->error('Service undefined.');
				return false;
		}

		// name
		if( !preg_match( '/^[a-z0-9\_\-]*$/', $name ) ){
			$this->px->error('Queue name "'.$name.'" is illegal format.');
			return false;
		}
		$queued_queue = $this->find_queue_by_name( $name );
		if( $queued_queue ){
			$this->px->error('Queue "'.$name.'" is already queued.');
			return false;
		}

		// time
		if( is_string($time) ){
			$time = strtotime($time);
		}
		if( !$time ){
			$time = time();
		}

		// create new queue
		// NOTE: タイムゾーン設定があとから変更されても設定時刻が変わらないように、ファイル名中の時刻情報は GMT で命名する。
		$filename = gmdate('Ymd_His', $time).'_'.urlencode($name).'.json';
		$filename_php = $filename.'.php';
		$data = array(
			'service' => $service,
			'time' => $time,
			'name' => $name,
			'options' => $options,
		);

		$result = dataDotPhp::write_json($realpath_queue.$filename_php, $data);
		return $result;
	}

	/**
	 * タスクスケジュールをキャンセルする
	 */
	public function cancel_queue( $name ){
		$realpath_queue = $this->realpath_admin_scheduler().'queue/';

		// name
		if( !preg_match( '/^[a-z0-9\_\-]*$/', $name ) ){
			$this->px->error('Queue name "'.$name.'" is illegal format.');
			return false;
		}
		$queued_queue = $this->find_queue_by_name( $name );
		if( !$queued_queue ){
			$this->px->error('Queue "'.$name.'" is not queued.');
			return false;
		}

		// remove queue
		$filename = $queued_queue['basename'];
		$result = $this->px->fs()->rm($realpath_queue.$filename);
		return !!$result;
	}

	/**
	 * キュー名から、キューを探す
	 */
	public function find_queue_by_name( $name ){
		$realpath_queue = $this->realpath_admin_scheduler().'queue/';
		$ls = $this->px->fs()->ls($realpath_queue);
		foreach($ls as $basename){
			if( preg_match('/^([0-9]{8})\_([0-9]{6})\_(.*)\.json(?:\.php)?$/s', $basename, $matched) ){
				if( $matched[3] == $name ){
					$json = dataDotPhp::read_json($realpath_queue.$basename);
					return array(
						"basename" => $basename,
						"queue" => $json,
					);
				}
			}
		}
		return false;
	}

	/**
	 * 次の実行可能なキューをチェックアウトする
	 */
	public function checkout_next_task(){
		$realpath_progress = $this->realpath_admin_scheduler().'progress/';
		$realpath_queue = $this->realpath_admin_scheduler().'queue/';
		$ls = $this->px->fs()->ls($realpath_queue);
		foreach($ls as $basename){
			if( preg_match('/^([0-9]{4})([0-9]{2})([0-9]{2})\_([0-9]{2})([0-9]{2})([0-9]{2})\_(.*)\.json(?:\.php)?$/s', $basename, $matched) ){

				// NOTE: タイムゾーン設定があとから変更されても設定時刻が変わらないように、ファイル名中の時刻情報は GMT で命名されている。
				$tmp_datetime = new \DateTime($matched[1].'-'.$matched[2].'-'.$matched[3].' '.$matched[4].':'.$matched[5].':'.$matched[6], new \DateTimeZone('UTC'));
				$time = $tmp_datetime->getTimestamp();
				unset($tmp_datetime);

				if( $time < time() ){
					$json = dataDotPhp::read_json($realpath_queue.$basename);
					$result_checkout = $this->px->fs()->rename(
						$realpath_queue.$basename,
						$realpath_progress.$basename
					);
					if( !$result_checkout ){
						return false;
					}
					return array(
						"basename" => $basename,
						"queue" => $json,
					);
				}
			}
		}
		return false;
	}

	/**
	 * タスクを実行する
	 */
	public function execute_current_task( $basename ){
		clearstatcache();
		$realpath_progress = $this->realpath_admin_scheduler().'progress/';
		if( !is_file($realpath_progress.$basename) ){
			return false;
		}
		$json = dataDotPhp::read_json($realpath_progress.$basename);

		$rtn = array(
			"result" => true,
			"completed" => null,
		);

		switch( $json->service ){
			case "publish":
				$this->px->internal_sub_request(
					'/?PX=publish.run'
				);
				break;
			case "git-commit":
				$gitHelper = new \tomk79\pickles2\px2clover\helpers\git( $this->clover );
				$result = $gitHelper->commit();
				break;
			default:
				break;
		}

		$rtn["completed"] = $this->complete_current_task( $basename );
		return $rtn;
	}

	/**
	 * タスクを完了する
	 */
	private function complete_current_task( $basename ){
		$realpath_progress = $this->realpath_admin_scheduler().'progress/';
		$realpath_done = $this->realpath_admin_scheduler().'done/';
		if( !is_file($realpath_progress.$basename) ){
			return false;
		}
		$result_complete = $this->px->fs()->rename(
			$realpath_progress.$basename,
			$realpath_done.$basename
		);
		if( !$result_complete ){
			return false;
		}
		return true;
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
		$realpath_log = $realpath_admin_scheduler.'logs/scheduler-'.date('Y-m-d').'.log.php';
		$log_row = array(
			date('Y-m-d H:i:s'),
			getmypid(),
			trim($row),
		);
		$result = dataDotPhp::write_a($realpath_log, implode('	', $log_row)."\n");
		return $result;
	}

}
