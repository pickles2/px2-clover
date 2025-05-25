<?php
namespace tomk79\pickles2\px2clover\funcs\editModule;

/**
 * px2-clover: モジュール編集機能
 */
class editModule {

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** Authorize Helper オブジェクト */
	private $authorizeHelper;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
		$this->authorizeHelper = new \tomk79\pickles2\px2clover\helpers\authorizeHelper($this->clover);
	}

	/**
	 * コンテンツ編集画面
	 */
	public function start(){
		$backto = $this->px->req()->get_param('backto');

		if( !$this->authorizeHelper->is_authorized('server_side_scripting') ){
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

		$appearance = $this->clover->auth()->get_login_user_info()->appearance ?? '';
		switch($appearance){
			case "auto":
			case "light":
			case "dark":
				break;
			default:
				$appearance = "auto";
				break;
		}

		$px2ce_res = $this->px->internal_sub_request('/?PX=px2dthelper.px2ce.client_resources&dist='.urlencode($client_resources_dist.'edit-content/').'&appearance='.urlencode($appearance));
		$px2ce_res = json_decode($px2ce_res, true);

		$checkout_result = $this->clover->checkout()->start('content:'.$this->px->req()->get_request_file_path());
		if( !$checkout_result->result ){
			// 他のユーザーが編集中
			$holder_info = $this->clover->auth()->get_admin_user_info($checkout_result->holder_id);
			echo $this->clover->view()->bind(
				'/cont/editContent/editContentCheckoutFailed.twig',
				array(
					'title' => $this->px->site()->get_current_page_info()['title'] ?? '',
					'holder' => $holder_info,
					'start_at' => $checkout_result->start_at,
					'page_path' => $this->px->req()->get_request_file_path(),
					'backto' => $backto,
				)
			);
			exit;
		}

		echo $this->clover->view()->bind(
			'/cont/editContent/editContent.twig',
			array(
				'title' => $this->px->site()->get_current_page_info()['title'] ?? '',
				'path_client_resources' => $path_client_resources,
				'px2ce_res' => $px2ce_res,
				'target_mode' => 'module',
				'module_id' => $this->px->req()->get_param('module_id'),
				'backto' => $backto,
			)
		);
		exit;
	}

	/**
	 * サニタイズが望まれる記述が含まれるか？
	 *
	 * @return boolean 検査結果。望まれる記述が発見された場合に true, 無毒だった場合に false。
	 */
	private function is_sanitize_desired(){
		$result = false;
		$px2dthelper = new \tomk79\pickles2\px2dthelper\main( $this->px );
		$editor_mode = $px2dthelper->check_editor_mode();
		$realpath_files = $this->px->realpath_files();
		$path_content = $this->get_path_content( $this->px->req()->get_request_file_path() );
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
			if( $this->authorizeHelper->is_sanitize_desired_in_code($src) ){
				$result = true;
				break;
			}
		}

		return $result;
	}

	/**
	 * 現在のページの $path_content を計算する
	 *
	 * @return string $path_content
	 */
	private function get_path_content($request_file_path){
		$path_content = $request_file_path;
		$ext = $this->px->get_path_proc_type( $request_file_path );
		if($ext !== 'direct' && $ext !== 'pass'){
			if( is_object($this->px->site()) ){
				$current_page_info = $this->px->site()->get_page_info( $request_file_path );
				$path_content = null;
				if( is_array($current_page_info) && array_key_exists('content', $current_page_info) ){
					$path_content = $current_page_info['content'];
				}
				if( is_null( $path_content ) ){
					$path_content = $request_file_path;
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

		return $path_content;
	}
}
