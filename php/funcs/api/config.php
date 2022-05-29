<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: プロフィール情報API
 */
class config{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** Clover Config オブジェクト */
	private $cloverConfig;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
		$this->cloverConfig = new \tomk79\pickles2\px2clover\helpers\config( $clover );
	}

	/**
	 * 取得
	 */
	public function get(){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		// config
		$rtn['config'] = $this->cloverConfig->get();

		// 秘匿情報を削除
		unset( $rtn['config']['history']['git_pw'] );

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}

	/**
	 * 更新
	 */
	public function update(){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$new_config = array(
			'history' => array(),
		);

		if( !is_null( $this->px->req()->get_param('history->git_remote') ) ){ $new_config['history']['git_remote'] = $this->px->req()->get_param('history->git_remote'); }
		if( !is_null( $this->px->req()->get_param('history->git_id') ) ){ $new_config['history']['git_id'] = $this->px->req()->get_param('history->git_id'); }
		if( !is_null( $this->px->req()->get_param('history->git_pw') ) ){ $new_config['history']['git_pw'] = $this->px->req()->get_param('history->git_pw'); }
		if( !is_null( $this->px->req()->get_param('history->auto_commit') ) ){ $new_config['history']['auto_commit'] = !!$this->px->req()->get_param('history->auto_commit'); }

		$result = $this->cloverConfig->update($new_config);
		if( !$result ){
			$rtn['result'] = false;
			$rtn['message'] = 'Failed to update config.';
		}

		// config
		$rtn['config'] = $this->get();

		$this->px->header('Content-type: text/json');
		echo json_encode($rtn);
		exit;
	}
}
