<?php
namespace tomk79\pickles2\px2clover\funcs\editContent;

/**
 * px2-clover: コンテンツ編集機能
 */
class editContent {

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
	 * コンテンツ編集画面
	 */
	public function start(){
		$is_authorized_write_file_directly = (
			is_object($this->px->authorizer)
				? $this->px->authorizer->is_authorized('write_file_directly')
				: true
		);

		$backto = $this->px->req()->get_param('backto');

		if( !$is_authorized_write_file_directly ){
			if( $this->is_sanitize_desired() ){
				echo $this->clover->view()->bind(
					'/cont/editContent/editContentUnauthorized.twig',
					array(
						'title' => $this->px->site()->get_current_page_info()['title'] ?? '',
						'page_path' => $this->px->req()->get_request_file_path(),
						'backto' => $backto,
					)
				);
				exit;
			}
		}

		$path_client_resources = $this->clover->path_files('/');
		$client_resources_dist = $this->clover->realpath_files('/');
		$this->px->fs()->mkdir_r($client_resources_dist.'edit-content/'); // ディレクトリが予め存在していないとファイル生成は失敗する。

		$px2ce_res = $this->px->internal_sub_request('/?PX=px2dthelper.px2ce.client_resources&dist='.urlencode($client_resources_dist.'edit-content/'));
		$px2ce_res = json_decode($px2ce_res, true);

		echo $this->clover->view()->bind(
			'/cont/editContent/editContent.twig',
			array(
				'title' => $this->px->site()->get_current_page_info()['title'] ?? '',
				'path_client_resources' => $path_client_resources,
				'px2ce_res' => $px2ce_res,
				'target_mode' => 'page_content',
				'page_path' => $this->px->req()->get_request_file_path(),
				'backto' => $backto,
			)
		);
		exit;
	}

	/**
	 * サニタイズが望まれる記述が含まれるか？
	 *
	 * @param string $src 検査対象のソースコード
	 * @return boolean 検査結果。望まれる記述が発見された場合に true, 無毒だった場合に false。
	 */
	private function is_sanitize_desired(){
		$result = false;
		$px2dthelper = new \tomk79\pickles2\px2dthelper\main( $this->px );
		$editor_mode = $px2dthelper->check_editor_mode();
		$realpath_files = $this->px->realpath_files();
		list($path_content, $proc_type) = $this->assemble_path_content_and_proc_type();
		$target_files = array();

		if( $editor_mode == '.not_exists' ){
			return false;
		}

		if( $editor_mode == "html.gui" ){
			// Broccoli Editor
			if( is_file($realpath_files.'guieditor.ignore/data.json') ){
				array_push($target_files, $realpath_files.'guieditor.ignore/data.json');
			}
		}else{
			// Default Editor
			if( is_file('./'.$path_content) ){
				array_push($target_files, './'.$path_content);
			}
		}

		if( is_file($realpath_files.'contents.css.scss') ){
			array_push($target_files, $realpath_files.'contents.css.scss');
		}
		if( is_file($realpath_files.'contents.css') ){
			array_push($target_files, $realpath_files.'contents.css');
		}
		if( is_file($realpath_files.'contents.js') ){
			array_push($target_files, $realpath_files.'contents.js');
		}

		foreach($target_files as $realpath){
			$src = file_get_contents($realpath);
			if( preg_match('/\.json$/i', $realpath) ){
				$src = json_encode($src, JSON_PRETTY_PRINT|JSON_UNESCAPED_SLASHES|JSON_UNESCAPED_UNICODE);
			}
			if( $this->is_sanitize_desired_code($src) ){
				$result = true;
				break;
			}
		}

		return $result;
	}

	/**
	 * サニタイズが望まれる記述が含まれるか？
	 *
	 * @param string $src 検査対象のソースコード
	 * @return boolean 検査結果。望まれる記述が発見された場合に true, 無毒だった場合に false。
	 */
	private function is_sanitize_desired_code($src){
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


	/**
	 * $path_content を計算する
	 * ※ via: px-fw-2.x/px.php
	 *
	 * @return array $path_content, $proc_type
	 */
	private function assemble_path_content_and_proc_type(){
		$path_content = $this->px->req()->get_request_file_path();
		$ext = $this->px->get_path_proc_type( $this->px->req()->get_request_file_path() );
		if($ext !== 'direct' && $ext !== 'pass'){
			if( is_object($this->px->site()) ){
				$current_page_info = $this->px->site()->get_page_info( $this->px->req()->get_request_file_path() );
				$path_content = null;
				if( is_array($current_page_info) && array_key_exists('content', $current_page_info) ){
					$path_content = $current_page_info['content'];
				}
				if( is_null( $path_content ) ){
					$path_content = $this->px->req()->get_request_file_path();
				}
				unset($current_page_info);
			}

		}

		foreach( array_keys( get_object_vars( $this->px->conf()->funcs->processor ) ) as $tmp_ext ){
			if( $this->px->fs()->is_file( './'.$path_content.'.'.$tmp_ext ) ){
				$ext = $tmp_ext;
				$path_content = $path_content.'.'.$tmp_ext;
				break;
			}
		}

		$proc_type = $ext;
		unset($ext);
		return array($path_content, $proc_type);
	}

}
