<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover: crypt
 */
class crypt{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** 暗号キー */
	private $crypt_key;

	/** アルゴリズム */
	private $algo;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $this->clover->px();
		$this->crypt_key = getenv("APP_KEY");
		$this->algo = 'AES-128-ECB';
	}

	/**
	 * 可逆暗号化する
	 */
	public function encrypt( $data ){
		$rtn = openssl_encrypt($data, $this->algo, $this->crypt_key);
		return $rtn;
	}

	/**
	 * 可逆暗号を復号する
	 */
	public function decrypt( $crypted ){
		$rtn = openssl_decrypt($crypted, $this->algo, $this->crypt_key);
		return $rtn;
	}
}
