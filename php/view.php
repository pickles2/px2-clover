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
<style>
:root {
	--px2-main-color: #00a0e6;
	--px2-text-color: #333;
	--px2-background-color: #f9f7f5;
}
</style>
<style>
@layer base;
@layer px2style;
</style>
<!-- jquery -->
<script><?= ( file_get_contents(__DIR__.'/../public/resources/jquery-3.6.0.min.js') ); ?></script>
<!-- px2style -->
<style><?= ( file_get_contents(__DIR__.'/../public/resources/px2style/px2style.css') ); ?></style>
<style><?= ( file_get_contents(__DIR__.'/../public/resources/px2style/themes/default.css') ); ?></style>
<script><?= ( file_get_contents(__DIR__.'/../public/resources/px2style/px2style.js') ); ?></script>
<!-- cloverCommon -->
<style><?= ( file_get_contents(__DIR__.'/../public/resources/cloverCommon/cloverCommon.css') ); ?></style>
<script><?= ( file_get_contents(__DIR__.'/../public/resources/cloverCommon/cloverCommon.js') ); ?></script>
<!-- appearance -->
<?php
		switch( $this->clover->auth()->get_login_user_info()->appearance ?? '' ){
			case "light":
				break;

			case "dark":
				?><style><?= ( file_get_contents(__DIR__.'/../public/resources/cloverCommon/appearance/darkmode.css') ); ?></style><?php
				break;

			case "":
			default:
				?><style>@media (prefers-color-scheme: dark) { <?= ( file_get_contents(__DIR__.'/../public/resources/cloverCommon/appearance/darkmode.css') ); ?> }</style><?php
				break;
		}
?>
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
		$data['lb'] = $this->clover->lang();
		$data['current_page_info'] = ($this->px->site() ? $this->px->site()->get_current_page_info() : null);

		$rtn = $twig->render( $path_template, $data );
		return $rtn;
	}

}
