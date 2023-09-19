<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: Language Helper
 */
class lang {

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** ログインユーザー情報 */
	private $loginUserInfo;

	/** LangBankオブジェクト */
	private $lb;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
		$this->loginUserInfo = $this->clover->auth()->get_login_user_info();
		$this->lb = new \tomk79\LangBank(__DIR__.'/../../data/language.csv');
		if( strlen($this->px->req()->get_param('ADMIN_USER_LANG') ?? '') ){
			$this->lb->setLang( $this->px->req()->get_param('ADMIN_USER_LANG') );
		}elseif( strlen($this->loginUserInfo->lang ?? '') ){
			$this->lb->setLang( $this->loginUserInfo->lang );
		}else{
			$this->lb->setLang( $this->px->lang() );
		}
	}

	/**
	 * get
	 */
	public function get($key){
		return $this->lb->get($key);
	}

}
