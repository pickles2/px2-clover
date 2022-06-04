<?php
namespace tomk79\pickles2\px2clover\helpers;

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
	public function set(){
		$login_user = $this->clover->auth()->get_login_user_info();
		$maintenance_mode_settings = array(
			'start_at' => date('Y-m-d H:i:s'),
			'exit_at' => date('Y-m-d H:i:s', time() + 3600),
			'maintainer' => $login_user->id,
		);

		$json_str = json_encode( $maintenance_mode_settings, JSON_UNESCAPED_SLASHES|JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE );
		$this->px->fs()->save_file( $this->realpath_maintenance_mode_config, $json_str );

		return true;
	}

	/**
	 * メンテナンスモード設定を削除する
	 */
	public function clear(){
		$rtn = true;
		if( is_file($this->realpath_maintenance_mode_config) ){
			$rtn = $this->px->fs()->rm( $this->realpath_maintenance_mode_config );
		}
		return $rtn;
	}

	/**
	 * メンテナンスモード設定の状態を調べる
	 */
	public function get_status(){
		if( !is_file($this->realpath_maintenance_mode_config) ){
			return false;
		}
		$maintenance_mode_settings = json_decode( file_get_contents( $this->realpath_maintenance_mode_config ) );
		return $maintenance_mode_settings;
	}

	/**
	 * メンテナンスモードが有効か調べる
	 */
	private function is_maintenance_mode(){
		$maintenance_mode_settings = $this->get_status();
		if( !$maintenance_mode_settings ){
			return false;
		}

		$login_user = $this->clover->auth()->get_login_user_info();
		if( isset($login_user->id) && $maintenance_mode_settings->maintainer == $login_user->id ){
			return false;
		}

		$now = time();
		$start_at = strtotime( $maintenance_mode_settings->start_at );
		$exit_at = strtotime( $maintenance_mode_settings->exit_at );

		if( $start_at < $now && $now < $exit_at ){
			return true;
		}

		return false;
	}

	/**
	 * メンテナンスページを表示する
	 */
	public function maintenance_page(){
		if( !$this->is_maintenance_mode() ){
			return;
		}

		$this->px->set_status(503);

		$is_html_page = true; // TODO: パスによって振り分ける

		if( $is_html_page ){
			echo $this->clover->view()->bind(
				'/system/maintenance_mode.twig',
				array(
				)
			);
			exit;
		}

		$this->px->header('Content-type: application/json');
		echo json_encode(array(
			'result' => false,
			'message' => $this->px->get_status_message(),
		));
		exit;
	}
}
