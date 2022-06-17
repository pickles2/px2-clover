<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: config
 */
class config{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** Config JSON のパス */
	private $realpath_config_json;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $this->clover->px();

		$this->realpath_config_json = $this->clover->realpath_private_data_dir('/config.json');
	}


	/**
	 * 取得する
	 */
	public function get(){
		if( is_file( $this->realpath_config_json ) ){
			$src_json = $this->px->fs()->read_file( $this->realpath_config_json );
			$json = json_decode($src_json, true);
			return $json;
		}

		$login_user_info = $this->clover->auth()->get_login_user_info();

		return array(
			'lang' => ( isset($login_user_info->lang) ? $login_user_info->lang : 'ja' ),
			'history' => array(
				'git_remote' => null,
				'git_id' => null,
				'git_pw' => null,
				'auto_commit' => null,
			),
		);
	}

	/**
	 * 設定を更新する
	 */
	public function update( $new_config ){

		$config = $this->get();
		$crypt = new crypt( $this->clover );

		if( isset($new_config['history']['git_remote']) ){ $config['history']['git_remote'] = $new_config['history']['git_remote']; }
		if( isset($new_config['history']['git_id']) ){ $config['history']['git_id'] = $new_config['history']['git_id']; }
		if( isset($new_config['history']['git_pw']) ){ $config['history']['git_pw'] = $crypt->encrypt($new_config['history']['git_pw']); }
		if( isset($new_config['history']['auto_commit']) ){ $config['history']['auto_commit'] = $new_config['history']['auto_commit']; }


		$src_json = json_encode( $config, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE );
		$result = $this->px->fs()->save_file( $this->realpath_config_json, $src_json );

	}

}
