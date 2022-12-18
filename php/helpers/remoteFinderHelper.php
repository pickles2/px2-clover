<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: remote-finder Helper
 */
class remoteFinderHelper {

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
	 * ディレクトリ設定を取得する
	 */
	public function get_directory_settings( $directory_type ){
		$page_path = null;
		if( !is_string($directory_type) ){
			$page_path = $directory_type['page_path'];
			$directory_type = $directory_type['type'];
		}

		$rtn = (object) array(
			"realpath_root_dir" => null,
			"paths_invisible" => array(),
			"paths_readonly" => array(),
		);

		switch( $directory_type ){
			case "root":
				$realpath_git_root_dir = $this->clover->realpath_git_root();
				if( !$realpath_git_root_dir || !is_dir($realpath_git_root_dir) ){
					return false;
				}
				$rtn->realpath_root_dir = $realpath_git_root_dir;
				$rtn->paths_invisible = array(
				);
				$rtn->paths_readonly = array(
					'/.git/*',
					'/vendor/*',
					'/node_modules/*',
				);
				break;

			case "theme_collection":
				$realpath_homedir = $this->px->get_realpath_homedir();
				if( !$realpath_homedir || !is_dir($realpath_homedir) ){
					return false;
				}
				$realpath_theme_collection_dir = $realpath_homedir.'themes/';
				if( !$realpath_theme_collection_dir || !is_dir($realpath_theme_collection_dir) ){
					return false;
				}
				$rtn->realpath_root_dir = $realpath_theme_collection_dir;
				$rtn->paths_invisible = array(
				);
				$rtn->paths_readonly = array(
				);
				break;

			case "contents_resources":
				$px2dthelper = new \tomk79\pickles2\px2dthelper\main( $this->px );
				$realpath_files = $px2dthelper->realpath_files( $page_path );
				if( !$realpath_files || !is_dir($realpath_files) ){
					return false;
				}
				$rtn->realpath_root_dir = $realpath_files;
				$rtn->paths_invisible = array(
				);
				$rtn->paths_readonly = array(
				);
				break;

			default:
				$rtn = false;
				break;
		}

		return $rtn;
	}
}
