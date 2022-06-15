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
		$path_client_resources = $this->clover->path_files('/');
		$client_resources_dist = $this->clover->realpath_files('/edit-contents/');
		$this->px->fs()->mkdir_r($client_resources_dist); // ディレクトリが予め存在していないとファイル生成は失敗する。

		$px2ce_res = $this->px->internal_sub_request('/?PX=px2dthelper.px2ce.client_resources&dist='.urlencode($client_resources_dist));
		$px2ce_res = json_decode($px2ce_res, true);

		$backto = $this->px->req()->get_param('backto');

		echo $this->clover->view()->bind(
			'/cont/editContents/editContents.twig',
			array(
				'path_client_resources' => $path_client_resources,
				'px2ce_res' => $px2ce_res,
				'target_mode' => 'theme_layout',
				'theme_id' => $this->px->req()->get_param('theme_id'),
				'layout_id' => $this->px->req()->get_param('layout_id'),
				'backto' => $backto,
			)
		);
		exit;
	}
}
