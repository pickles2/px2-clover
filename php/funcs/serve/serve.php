<?php
namespace tomk79\pickles2\px2clover\funcs\serve;

/**
 * PX=admin.serve
 */
class serve {

	/** Picklesオブジェクト */
	private $px;

	/** PXコマンド名 */
	private $command = array();

	/** px2dtconfig */
	private $px2dtconfig;

	/**
	 * Constructor
	 *
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $px ){
		$this->px = $px;
	}

	/**
	 * サーバーを起動する
	 */
	public function start(){
		if( !$this->px->req()->is_cmd() ){
			return;
		}

		$conf = $this->px->conf();
		$realpath_entryScript = $_SERVER['SCRIPT_FILENAME'];
		$path_entryScript = $this->px->fs()->get_relatedpath($realpath_entryScript);
		$entryScriptBasename = basename($realpath_entryScript);
		$path_controot = $this->px->get_path_controot();
		$realpath_homedir = $this->px->get_realpath_homedir();
		$realpath_router = $realpath_homedir.'_sys/serve/route.php';
		$path_router = $this->px->fs()->get_relatedpath($realpath_router);
		$serverName = $this->px->req()->get_param('S');
		if( !is_string($serverName) || !strlen($serverName) ){
			$serverName = 'localhost:8080';
		}

		$realpath_htaccess = realpath('./.htaccess');
		$src_htaccess = '';
		$ext_ptn = 'html?|css|js';
		if( is_file($realpath_htaccess) ){
			$src_htaccess = file_get_contents($realpath_htaccess);
			if( preg_match( '/RewriteCond \%\{REQUEST\_URI\} \/\(\.\*\?\\\\\.\(\?\:(.+?)\)\)\?\$/', $src_htaccess, $matched ) ){
				$ext_ptn = $matched[1];
				$ext_ptn = str_replace('/', '\/', $ext_ptn);
			}
		}

		$pxc = $this->px->get_px_command();

		echo '---------'."\n";
		echo 'px2-clover: admin.server Starting Server...'."\n";
		echo 'http://'.$serverName.$path_controot."\n";
		echo ''."\n";

		if( isset($pxc[2]) && $pxc[2] == 'pub' ){
			// --------------------------------------
			// パブリッシュ環境をサーブする
			$realpath_router = $realpath_homedir.'_sys/serve/route_pub.php';
			$path_router = $this->px->fs()->get_relatedpath($realpath_router);
			if( !$conf->path_publish_dir ){
				echo '$conf->path_publish_dir is not set;'."\n";
				exit;
			}
			$src = '';
			$src .= '<'.'?php'."\n";
			$src .= 'return false;'."\n";

			$this->px->fs()->mkdir(dirname($realpath_router));
			$this->px->fs()->save_file($realpath_router, $src);


			// --------------------------------------
			// サーバーを起動する
			$path_docroot = $this->px->fs()->get_relatedpath( $conf->path_publish_dir );

			$cmd_serve = 'php -S '.escapeshellarg($serverName).' -t '.escapeshellarg($path_docroot).' '.escapeshellarg($path_router);
			passthru($cmd_serve);
			exit;
		}else{
			// --------------------------------------
			// プレビュー環境をサーブする (デフォルト)
			$src = '';
			$src .= '<'.'?php'."\n";
			$src .= 'chdir($_SERVER[\'DOCUMENT_ROOT\']);'."\n";
			$src .= '$path = $_SERVER[\'REQUEST_URI\'];'."\n";
			$src .= '$path_controot = '.var_export($path_controot, true).';'."\n";
			$src .= '$path = preg_replace(\'/^\'.preg_quote($path_controot, \'/\').\'/\', \'/\', $path);'."\n";
			$src .= '$path_entryScript = \'.\'.'.var_export($path_controot.$entryScriptBasename, true).';'."\n";
			$src .= '$script_name = '.var_export($this->px->fs()->normalize_path($this->px->fs()->get_realpath('/'.$path_controot.$entryScriptBasename)), true).';'."\n";
			$src .= '$querystring = \'\';'."\n";
			$src .= 'if( strpos($path, \'?\') !== false ){'."\n";
			$src .= '    list($path, $querystring) = preg_split(\'/\?/\', $path, 2);'."\n";
			$src .= '}'."\n";
			$src .= 'if( strrpos($path, \'/\') === strlen($path)-1 || preg_match(\'/\.(?:'.$ext_ptn.')$/\', $path) ){'."\n";
			$src .= '    $_SERVER[\'SCRIPT_FILENAME\'] = realpath($path_entryScript);'."\n";
			$src .= '    $_SERVER[\'SCRIPT_NAME\'] = $script_name;'."\n";
			$src .= '    $_SERVER[\'PATH_INFO\'] = $path;'."\n";
			$src .= '    $_SERVER[\'PHP_SELF\'] = $path_entryScript.$path;'."\n";
			$src .= '    include($path_entryScript);'."\n";
			$src .= '    return;'."\n";
			$src .= '}'."\n";
			$src .= 'return false;'."\n";

			$this->px->fs()->mkdir(dirname($realpath_router));
			$this->px->fs()->save_file($realpath_router, $src);


			// --------------------------------------
			// サーバーを起動する
			$realpath_controot = $this->px->fs()->get_realpath(dirname($realpath_entryScript).'/');
			$realpath_controot = preg_replace( '/'.preg_quote($path_controot, '/').'$/', '/', $realpath_controot );
			$path_docroot = $this->px->fs()->get_relatedpath( $realpath_controot );

			$cmd_serve = 'php -S '.escapeshellarg($serverName).' -t '.escapeshellarg($path_docroot).' '.escapeshellarg($path_router);
			passthru($cmd_serve);
			exit;
		}

	}
}
