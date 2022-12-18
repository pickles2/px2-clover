<?php
namespace tomk79\pickles2\px2clover\funcs\api;
use tomk79\pickles2\px2clover\helpers\remoteFinderHelper;

/**
 * px2-clover: remote-finder
 */
class remoteFinder{

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** remote-finder Helper */
	private $remoteFinderHelper;


	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
		$this->remoteFinderHelper = new remoteFinderHelper($clover);
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

		$dir_settings = $this->remoteFinderHelper->get_directory_settings( $this->px->req()->get_param('mode') );
		if( !$dir_settings ){
			$rtn = array(
				'result' => false,
				'message' => 'Unknown directory setting.',
				'output' => null,
			);
			echo json_encode($rtn);
			exit;
		}

		$remoteFinder = new \tomk79\remoteFinder\main(array(
			'default' => $dir_settings->realpath_root_dir,
		), array(
			'paths_invisible' => $dir_settings->paths_invisible,
			'paths_readonly' => $dir_settings->paths_readonly,
		));

		$input = json_decode(json_encode($this->px->req()->get_param('input')));
		$rtn['output'] = $remoteFinder->gpi( $input );

		echo json_encode($rtn);
		exit;
	}
}
