<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: auth
 */
class authorizeHelper {

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

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
	 * 認可されているか調べる
	 */
	public function is_authorized($authority_name){
		$is_authorized= (
			is_object($this->px->authorizer)
				? $this->px->authorizer->is_authorized($authority_name)
				: true
		);
		return $is_authorized;
	}

	/**
	 * サニタイズが望まれる記述が含まれるか？
	 *
	 * @param string $src 検査対象のソースコード
	 * @return boolean 検査結果。望まれる記述が発見された場合に true, 無毒だった場合に false。
	 */
	public function is_sanitize_desired_in_code($src){
		// サニタイズパターン
		$patterns = array(
			array(
				'pattern' => '/\<\?php/',
				'replace_to' => '<!-- ?php',
			),
			array(
				'pattern' => '/\<\?\=/',
				'replace_to' => '<!-- ?=',
			),
			array(
				'pattern' => '/\<\?/',
				'replace_to' => '<!-- ?',
			),
			array(
				'pattern' => '/\?\>/',
				'replace_to' => '? -->',
			),
		);
		$result = false;
		foreach($patterns as $pattern){
			if( preg_match($pattern['pattern'], $src) ){
				$result = true;
				break;
			}
		}
		return $result;
	}

}
