<?php
namespace tomk79\pickles2\px2clover\funcs\editThemeLayout;

/**
 * px2-clover: テーマレイアウト編集機能
 */
class editThemeLayout{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** Authorize Helper オブジェクト */
	private $authorizeHelper;

	/** テーマID */
	private $theme_id;

	/** レイアウトID */
	private $layout_id;

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

		$this->theme_id = $this->px->req()->get_param('theme_id') ?? $this->px->req()->get_param('THEME') ?? $this->px->req()->get_cookie('THEME');
		if( !strlen($this->theme_id ?? '') ){
			$tmp_multithemePluginOptionsJson = $this->px->internal_sub_request(
				'/?PX=px2dthelper.plugins.get_plugin_options&func_div=processor.html&plugin_name='.urlencode('tomk79\\pickles2\\multitheme\\theme::exec')
			);
			$multithemePluginOptions = json_decode($tmp_multithemePluginOptionsJson, true);
			$this->theme_id = $multithemePluginOptions[0]['options']['default_theme_id'] ?? null;
		}
		$this->layout_id = $this->px->req()->get_param('layout_id') ?? $this->px->site()->get_current_page_info('layout');
	}

	/**
	 * コンテンツ編集画面
	 */
	public function start(){
		$backto = $this->px->req()->get_param('backto');
		if( !$backto ){
			$backto = 'close';
		}

		$theme_id = $this->theme_id;
		$layout_id = $this->layout_id;

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
		$client_resources_dist = $this->clover->realpath_files('/edit-content/');
		$this->px->fs()->mkdir_r($client_resources_dist); // ディレクトリが予め存在していないとファイル生成は失敗する。

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

		$px2ce_res = $this->px->internal_sub_request('/?PX=px2dthelper.px2ce.client_resources&dist='.urlencode($client_resources_dist).'&appearance='.urlencode($appearance));
		$px2ce_res = json_decode($px2ce_res, true);

		$checkout_result = $this->clover->checkout()->start('theme:'.$theme_id.'/'.$layout_id);
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
				'path_client_resources' => $path_client_resources,
				'px2ce_res' => $px2ce_res,
				'target_mode' => 'theme_layout',
				'theme_id' => $theme_id,
				'layout_id' => $layout_id,
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
		$target_files = array();

		$theme_id = $this->theme_id;
		$layout_id = $this->layout_id;

		$px2dthelper = new \tomk79\pickles2\px2dthelper\main( $this->px );
		$realpath_theme_collection_dir = $px2dthelper->get_realpath_theme_collection_dir();
		$realpath_theme_dir = $realpath_theme_collection_dir.urlencode($theme_id).'/';
		$realpath_layout = $realpath_theme_dir.urlencode($layout_id).'.html';
		$realpath_layout_datajson = $realpath_theme_dir.'guieditor.ignore/'.urlencode($layout_id).'/data/data.json';

		$editor_mode = ".not_exists";
		if(is_file($realpath_layout_datajson)){
			$editor_mode = "html.gui";
		}elseif(is_file($realpath_layout)){
			$editor_mode = "html";
		}

		if( $editor_mode == '.not_exists' ){
			return false;
		}

		if( $editor_mode == "html.gui" ){
			// Broccoli Editor
			if( is_file($realpath_layout_datajson) ){
				array_push($target_files, $realpath_layout_datajson);
			}
		}else{
			// Default Editor
			if( is_file($realpath_layout) ){
				array_push($target_files, $realpath_layout);
			}
		}

		if( is_file($realpath_theme_dir.'theme_files/layouts/'.urlencode($layout_id).'/style.css.scss') ){
			array_push($target_files, $realpath_theme_dir.'theme_files/layouts/'.urlencode($layout_id).'/style.css.scss');
		}
		if( is_file($realpath_theme_dir.'theme_files/layouts/'.urlencode($layout_id).'/style.css') ){
			array_push($target_files, $realpath_theme_dir.'theme_files/layouts/'.urlencode($layout_id).'/style.css');
		}
		if( is_file($realpath_theme_dir.'theme_files/layouts/'.urlencode($layout_id).'/script.js') ){
			array_push($target_files, $realpath_theme_dir.'theme_files/layouts/'.urlencode($layout_id).'/script.js');
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
}
