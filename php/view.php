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

		$cloverCommon = '';
		ob_start(); ?>
<script><?= ( file_get_contents(__DIR__.'/../public/resources/jquery-3.6.0.min.js') ); ?></script>
<style><?= ( file_get_contents(__DIR__.'/../public/resources/px2style/px2style.css') ); ?></style>
<style><?= ( file_get_contents(__DIR__.'/../public/resources/px2style/themes/default.css') ); ?></style>
<script><?= ( file_get_contents(__DIR__.'/../public/resources/px2style/px2style.js') ); ?></script>
<style><?= ( file_get_contents(__DIR__.'/../public/resources/cloverCommon/cloverCommon.css') ); ?></style>
<script><?= ( file_get_contents(__DIR__.'/../public/resources/cloverCommon/cloverCommon.js') ); ?></script>
<?php
		$cloverCommon .= ob_get_clean();
		$cloverCommon = preg_replace('/\/\*\#\ sourceMappingURL\=.*?\*\//', '', $cloverCommon);
		$cloverCommon = preg_replace('/\/\/\#\ sourceMappingURL\=.*?\.map/', '', $cloverCommon);

		// 共通項目
		$data['clover_config'] = $this->clover->conf();
		$data['common_resources'] = $cloverCommon;
		$data['px2config'] = $this->px->conf();
		$data['plugin_options'] = $this->clover->get_options();
		$data['path_client_resources'] = $this->clover->path_files();
		$data['csrf_token'] = $this->clover->auth()->get_csrf_token();

		$rtn = $twig->render( $path_template, $data );
		return $rtn;
	}

}
