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
		$path_client_resources = $this->clover->path_files('/');
		$client_resources_dist = $this->clover->realpath_files('/');
		$this->px->fs()->mkdir_r($client_resources_dist.'edit-content/'); // ディレクトリが予め存在していないとファイル生成は失敗する。

		$px2ce_res = $this->px->internal_sub_request('/?PX=px2dthelper.px2ce.client_resources&dist='.urlencode($client_resources_dist.'edit-content/'));
		$px2ce_res = json_decode($px2ce_res, true);

		$backto = $this->px->req()->get_param('backto');

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
}
