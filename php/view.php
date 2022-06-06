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
			// 'cache' => $this->clover->realpath_private_cache('twig_cache/'),
		]);

		// 共通項目
		$data['clover_config'] = $this->clover->conf();
		$data['px2config'] = $this->px->conf();
		$data['plugin_options'] = $this->clover->get_options();
		$data['path_client_resources'] = $this->clover->path_files();
		$data['csrf_token'] = $this->clover->auth()->get_csrf_token();

		$rtn = $twig->render( $path_template, $data );
		return $rtn;
	}

}
