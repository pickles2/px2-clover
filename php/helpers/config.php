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
	private $realpath_config_json_php;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $this->clover->px();

		$this->realpath_config_json = $this->clover->realpath_private_data_dir('/config.json');
		$this->realpath_config_json_php = $this->realpath_config_json.'.php';
	}


	/**
	 * 取得する
	 */
	public function get(){
		if( is_file( $this->realpath_config_json_php ) ){
			$json = dataDotPhp::read_json( $this->realpath_config_json_php );
			return $json;
		}
		if( is_file( $this->realpath_config_json ) ){
			$src_json = $this->px->fs()->read_file( $this->realpath_config_json );
			$json = json_decode($src_json);
			return $json;
		}

		$login_user_info = $this->clover->auth()->get_login_user_info();

		return (object) array(
			'lang' => ( isset($login_user_info->lang) ? $login_user_info->lang : 'ja' ),
			'history' => (object) array(
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
		if( is_array($new_config) ){
			$new_config = json_decode( json_encode($new_config) );
		}

		$config = $this->get();
		$crypt = new crypt( $this->clover );

		if( isset($new_config->history->git_remote) ){ $config->history->git_remote = $new_config->history->git_remote; }
		if( isset($new_config->history->git_id) ){ $config->history->git_id = $new_config->history->git_id; }
		if( isset($new_config->history->git_pw) ){ $config->history->git_pw = $crypt->encrypt($new_config->history->git_pw); }
		if( isset($new_config->history->auto_commit) ){ $config->history->auto_commit = $new_config->history->auto_commit; }

		$result = dataDotPhp::write_json($this->realpath_config_json_php, $config);
		if( !$result ){
			return false;
		}
		$this->px->fs()->chmod($this->realpath_config_json_php, 0700);

		if( is_file($this->realpath_config_json) ){
			unlink($this->realpath_config_json); // 素のJSONがあったら削除する
		}
		return $result;
	}

}
