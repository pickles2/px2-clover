<?php
namespace tomk79\pickles2\px2clover\funcs\api;
use tomk79\pickles2\px2clover\helpers\scheduler as schedulerHelper;

/**
 * px2-clover: タスクスケジューラAPI
 */
class scheduler{

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
		catch(Exception $e){}

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
	 * タスクスケジュールを追加する
	 */
	public function add_queue($service, $time, $name, $options = array()){
		$this->px->header('Content-type: text/json');

		$result = $this->schedulerHelper->add_queue($service, $time, $name, $options);
		$errors = $this->px->get_errors();
		if( !$result ){
			echo json_encode(array(
				'result' => false,
				'message' => implode(', ', $errors),
			));
			exit;
		}

		echo json_encode(array(
			'result' => true,
			'message' => 'OK',
		));
		exit;
	}

	/**
	 * タスクスケジュールをキャンセルする
	 */
	public function cancel_queue( $name ){
		$this->px->header('Content-type: text/json');

		$result = $this->schedulerHelper->cancel_queue($name);
		$errors = $this->px->get_errors();
		if( !$result ){
			echo json_encode(array(
				'result' => false,
				'message' => implode(', ', $errors),
			));
			exit;
		}

		echo json_encode(array(
			'result' => true,
			'message' => 'OK',
		));
		exit;
	}

	/**
	 * タスクスケジュールを実行する
	 */
	public function run(){
		$started_time = time();
		$this->schedulerHelper->log('======== start: scheduler');

		$this->px->header('Content-type: text/json');

		$realpath_status_json = $this->realpath_admin_scheduler.'status.json';

		$json = array(
			'last_run_at' => date('Y-m-d H:i:s'),
		);
		$str_json = json_encode($json);
		if( !$this->px->fs()->save_file( $realpath_status_json, $str_json ) ){
			$this->schedulerHelper->log('--- Error: Failed to write status.json');
			echo json_encode(array(
				'result' => false,
				'message' => 'Failed to write status.json',
			));
			exit;
		}

		// 排他ロックの開始
		if( !$this->px->lock('px2-clover--task-scheduler', 60*30) ){
			$this->schedulerHelper->log('--- Exit: Application Locked.');
			echo json_encode(array(
				'result' => false,
				'message' => 'Application Locked.',
			));
			exit;
		}


		// タスクを実行する
		while( $nextTask = $this->schedulerHelper->checkout_next_task() ){
			if( !$nextTask ){
				break;
			}
			try {
				$this->schedulerHelper->execute_current_task($nextTask['basename']);
			}catch(Exception $e){
			}
			continue;
		}


		// 排他ロックの解除
		$this->px->unlock('px2-clover--task-scheduler');

		$this->schedulerHelper->log('--- Exit ('.(time() - $started_time).'sec)');
		echo json_encode(array(
			'result' => true,
			'message' => 'OK',
		));
		exit;
	}

}
