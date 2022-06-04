<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: メンテナンスモードの管理
 */
class maintenanceMode{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** メンテナンスモードヘルパーオブジェクト */
	private $maintenanceModeHelper;

	/** メンテナンスモード設定ファイル */
	private $realpath_maintenance_mode_config;


	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();

		// メンテナンスモードヘルパー
		$this->maintenanceModeHelper = new \tomk79\pickles2\px2clover\helpers\maintenanceMode( $clover );

		// メンテナンスモード設定
		$this->realpath_maintenance_mode_config = $this->clover->realpath_private_data_dir('/maintenance_mode.json');
	}

	/**
	 * メンテナンスモードを開始する
	 */
	public function start(){
		$this->px->header('Content-type: text/json');
		$rtn = array(
			'result' => true,
			'message' => 'OK',
		);

		if(!$this->maintenanceModeHelper->set()){
			echo json_encode(array(
				'result' => false,
				'message' => 'Failed to set maintenance mode.',
			));
			exit;
		}

		echo json_encode($rtn);
		exit;
	}

	/**
	 * メンテナンスモードを終了する
	 */
	public function exit(){
		$this->px->header('Content-type: text/json');
		$rtn = array(
			'result' => true,
			'message' => 'OK',
		);

		$status = $this->maintenanceModeHelper->get_status();
		if( !$status ){
			echo json_encode($rtn);
			exit;
		}

		$login_user = $this->clover->auth()->get_login_user_info();
		if( $status->maintainer !== $login_user->id ){
			echo json_encode(array(
				'result' => false,
				'message' => 'You are not the maintainer.',
			));
			exit;
		}

		$result = $this->maintenanceModeHelper->clear();
		if( !$result ){
			echo json_encode(array(
				'result' => false,
				'message' => 'Failed to clear maintenance mode settings.',
			));
			exit;
		}

		echo json_encode($rtn);
		exit;
	}

	/**
	 * メンテナンスモード設定の状態を調べる
	 */
	public function status(){
		$this->px->header('Content-type: text/json');

		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';
		$rtn['start_at'] = null;
		$rtn['exit_at'] = null;
		$rtn['maintainer'] = null;

		$status = $this->maintenanceModeHelper->get_status();
		if( $status ){
			$rtn['start_at'] = $status->start_at;
			$rtn['exit_at'] = $status->exit_at;
			$rtn['maintainer'] = $status->maintainer;
		}

		echo json_encode($rtn);
		exit;
	}

}
