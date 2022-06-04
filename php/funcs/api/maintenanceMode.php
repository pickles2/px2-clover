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

		// メンテナンスモード設定
		$this->realpath_maintenance_mode_config = $this->clover->realpath_private_data_dir('/maintenance_mode.json');
	}

	/**
	 * メンテナンスモードを開始する
	 */
	public function start(){
		$this->px->header('Content-type: text/json');
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$login_user = $this->clover->auth()->get_login_user_info();
		$maintenance_mode_settings = array(
			'started_at' => date('Y-m-d H:i:s'),
			'exit_at' => date('Y-m-d H:i:s', time() + 3600),
			'maintainer' => $login_user['id'],
		);

		$json_str = json_encode( $maintenance_mode_settings, JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE );
		$this->px->fs()->save_file( $this->realpath_maintenance_mode_config, $json_str );

		echo json_encode($rtn);
		exit;
	}

	/**
	 * メンテナンスモードを終了する
	 */
	public function exit(){
		$this->px->header('Content-type: text/json');

		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$login_user = $this->clover->auth()->get_login_user_info();

		if( is_file($this->realpath_maintenance_mode_config) ){
			$maintenance_mode_settings = json_decode( file_get_contents( $this->realpath_maintenance_mode_config ) );
			if( $maintenance_mode_settings->maintainer !== $login_user['id'] ){
				echo json_encode(array(
					'result' => false,
					'message' => 'You are not the maintainer.',
				));
				exit;
			}

			$this->px->fs()->rm( $this->realpath_maintenance_mode_config );
		}

		echo json_encode($rtn);
		exit;
	}
}
