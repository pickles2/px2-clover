<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover: view
 */
class view{

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
	 * テンプレートにデータをバインドする
	 */
	public function bind($path_template, $data){
		$loader = new \Twig\Loader\FilesystemLoader(__DIR__.'/../templates/');
		$twig = new \Twig\Environment($loader, [
			// 'cache' => $this->px->realpath_plugin_private_cache('twig_cache/'),
		]);
		$rtn = $twig->render( $path_template, $data );
		return $rtn;
	}

}
