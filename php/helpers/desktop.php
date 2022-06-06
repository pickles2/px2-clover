<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: Desktop mode Helper
 */
class desktop{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
	}

	/**
	 * Open file
	 */
	public function open($filename){
		if( $this->clover->get_options()->app_mode != 'desktop' ){
			return false;
		}
		if( realpath('/') == '/' ){
			// Linux or macOS
			exec('open '.escapeshellarg($filename));
		}else{
			// Windows
			exec(escapeshellcmd('explorer '.escapeshellarg($filename)));
		}
		return true;
	}

}
