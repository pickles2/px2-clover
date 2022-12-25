<?php
namespace tomk79\cmsTools\sample;
class main{

	/** $px */
	private $px;

	/** $json */
	private $json;

	/** $cceAgent */
	private $cceAgent;

	/** Constructor */
	public function __construct($px, $json, $cceAgent){
		$this->px = $px;
		$this->json = $json;
		$this->cceAgent = $cceAgent;
	}

	/** Label (Tool name) */
	public function get_label(){
		return 'サンプル機能拡張';
	}

	/** Resource directory */
	public function get_client_resource_base_dir(){
		return __DIR__.'/../client/';
	}

	/** Resource file list */
	public function get_client_resource_list(){
		$rtn = array();
		$rtn['css'] = array();
		array_push($rtn['css'], 'sample.css');
		$rtn['js'] = array();
		array_push($rtn['js'], 'sample.js');
		return $rtn;
	}

	/** JavaScript function name */
	public function get_client_initialize_function(){
		return 'window.tomk79CmsToolsSample';
	}

	/** General Purpose Interface */
	public function gpi($request){
		switch($request->command){
			case 'test-gpi-call':
				$this->cceAgent->async(array(
					'type'=>'gpi',
					'request' => array(
						'command' => 'test-async',
					),
				));
				return 'Test GPI Call Successful.';
			case 'test-async':
				$this->cceAgent->broadcast(array(
					'message'=>'Hello Broadcast Message !',
				));
				return 'Test Async Call Successful.';
				break;
		}
		return false;
	}
}
