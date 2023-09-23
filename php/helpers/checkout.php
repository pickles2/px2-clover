<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: checkout
 */
class checkout{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** 編集ロックの期限 */
	private $lock_expire = 30 * 60;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $this->clover->px();
	}

	/**
	 * 編集を開始する
	 *
	 * @param string $item ロックする対象。
	 * - `content:${path}`: コンテンツ
	 * - `theme:${theme_id}/${layout_id}`: テーマ/レイアウト
	 * @return object 結果
	 * @return boolean $return->result 編集ロックに成功したら true, 失敗したら false
	 * @return string $return->holder_id 現在編集中のユーザーのID
	 * @return string $return->start_at 編集ロックを開始した時刻
	 */
	public function start( $item ){
		$private_data_dir = $this->clover->realpath_private_data_dir();
		if( !is_dir($private_data_dir) ){
			return (object) array(
				"result" => false,
				"holder_id" => null,
				"start_at" => null,
			);
		}

		clearstatcache();

		if( !is_dir($private_data_dir.'/checkout/') ){
			if( !$this->px->fs()->mkdir($private_data_dir.'/checkout/') ){
				return (object) array(
					"result" => false,
					"holder_id" => null,
					"start_at" => null,
				);
			}
		}

		$realpath_lock_file = $private_data_dir.'/checkout/'.urlencode($item).'.json.php';
		$login_user_info = $this->clover->auth()->get_login_user_info();
		if( is_file($realpath_lock_file) ){
			$data = dataDotPhp::read_json($realpath_lock_file);
			if( $data->holder_id != $login_user_info->id || strtotime($data->start_at) > time()+$this->lock_expire ){
				return (object) array(
					"result" => false,
					"holder_id" => $data->holder_id,
					"start_at" => $data->start_at,
				);
			}
		}

		// ロックする
		$write_data = (object) array(
			"holder_id" => $login_user_info->id,
			"start_at" => date('c'),
		);
		$result = dataDotPhp::write_json($realpath_lock_file, $write_data);
		if( !$result ){
			return (object) array(
				"result" => false,
				"holder_id" => null,
				"start_at" => null,
			);
		}

		return (object) array(
			"result" => true,
			"holder_id" => $write_data->holder_id,
			"start_at" => $write_data->start_at,
		);
	}

	/**
	 * 編集を終了し、開放する
	 */
	public function release( $item ){
		clearstatcache();
		$private_data_dir = $this->clover->realpath_private_data_dir();
		$realpath_lock_file = $private_data_dir.'/checkout/'.urlencode($item).'.json.php';
		$login_user_info = $this->clover->auth()->get_login_user_info();

		if( !is_file($realpath_lock_file) ){
			return true;
		}

		$data = dataDotPhp::read_json($realpath_lock_file);
		if( $data->holder_id != $login_user_info->id && strtotime($data->start_at) > time()+$this->lock_expire ){
			return false;
		}

		return unlink($realpath_lock_file);
	}
}
