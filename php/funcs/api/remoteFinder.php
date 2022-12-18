<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: remote-finder
 */
class remoteFinder{

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
	 * remote-finder の GPI を実行する
	 */
	public function gpi(){
		$this->px->header('Content-type: text/json');
		$rtn = array(
			'result' => true,
			'message' => 'OK',
			'output' => null,
		);

		$realpath_git_root_dir = $this->clover->realpath_git_root();
		if( !$realpath_git_root_dir || !is_dir($realpath_git_root_dir) ){
			$rtn = array(
				'result' => false,
				'message' => 'Git root is not found.',
				'output' => null,
			);
			echo json_encode($rtn);
			exit;
		}

		$remoteFinder = new \tomk79\remoteFinder\main(array(
			'default' => $realpath_git_root_dir,
		), array(
			'paths_invisible' => array(
			),
			'paths_readonly' => array(
				'/vendor/*',
			),
		));

		$input = json_decode(json_encode($this->px->req()->get_param('input')));
		$rtn['output'] = $remoteFinder->gpi( $input );

		echo json_encode($rtn);
		exit;
	}
}
