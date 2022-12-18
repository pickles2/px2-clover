<?php
namespace tomk79\pickles2\px2clover\funcs\api;

/**
 * px2-clover: common-file-editor
 */
class commonFileEditor{

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
	 * common-file-editor の GPI を実行する
	 */
    public function gpi(){
		$this->px->header('Content-type: text/json');
		$rtn = array(
			'result' => true,
			'message' => 'OK',
            'output' => null,
		);

		$fs = $this->px->fs();
		$realpath_basedir = './';
		if( !strlen($this->px->req()->get_param('filename')) ){
			return json_encode(false);
		}
		$filename = $fs->normalize_path( $fs->get_realpath('/'.$this->px->req()->get_param('filename')) );
		if( !strlen($filename) || $filename == '/' ){
			return json_encode(false);
		}
		if(
			$filename == '/.git' || preg_match( '/^\/\.git(?:\/.*)?$/', $filename ) ||
			$filename == '/vendor' || preg_match( '/^\/vendor(?:\/.*)?$/', $filename ) ||
			$filename == '/node_modules' || preg_match( '/^\/node_modules(?:\/.*)?$/', $filename )
		){
			return json_encode(false);
		}
		$realpath_filename = $fs->normalize_path( $fs->get_realpath( $realpath_basedir.$filename) );


		if( $this->px->req()->get_param('method') == 'read' ){
			$bin = file_get_contents( $realpath_filename );
			$rtn['base64'] = base64_encode($bin);

		}elseif( $this->px->req()->get_param('method') == 'write' ){
			$bin = '';
			if( strlen($this->px->req()->get_param('base64')) ){
				$bin = base64_decode( $this->px->req()->get_param('base64') );
			}elseif( strlen($this->px->req()->get_param('bin')) ){
				$bin = $this->px->req()->get_param('bin');
			}
			$rtn['result'] = file_put_contents( $realpath_filename, $bin );

		}elseif( $this->px->req()->get_param('method') == 'copy' ){
			$realpath_copyto = $realpath_basedir.$fs->get_realpath('/'.$request->to);
			$rtn['result'] = $fs->copy_r( $realpath_filename, $realpath_copyto );

		}elseif( $this->px->req()->get_param('method') == 'rename' ){
			$realpath_copyto = $realpath_basedir.$fs->get_realpath('/'.$request->to);
			$rtn['result'] = $fs->rename_f( $realpath_filename, $realpath_copyto );

		}elseif( $this->px->req()->get_param('method') == 'is_file' ){
			$rtn['result'] = is_file( $realpath_filename );

		}elseif( $this->px->req()->get_param('method') == 'is_dir' ){
			$rtn['result'] = is_dir( $realpath_filename );

		}elseif( $this->px->req()->get_param('method') == 'exists' ){
			$rtn['result'] = file_exists( $realpath_filename );

		}elseif( $this->px->req()->get_param('method') == 'remove' ){
			$fs->chmod_r( $realpath_filename, 0777 );
			$rtn['result'] = $fs->rm( $realpath_filename );

		}elseif( $this->px->req()->get_param('method') == 'px_command' ){
			$rtn['result'] = $this->px->internal_sub_request(
				( strlen($filename) ? $filename : '/' ).'?PX='.urlencode($request->px_command)
			);
			$rtn['result'] = json_decode($rtn['result']);

		}elseif( $this->px->req()->get_param('method') == 'initialize_data_dir' ){
			$json = $this->px->internal_sub_request(
				( strlen($filename) ? $filename : '/' ).'?PX=px2dthelper.get.all'
			);
			$json = json_decode($json);

			$rtn['result'] = false;
			if( $fs->mkdir_r( $json->realpath_data_dir ) ){
				if( $fs->save_file( $json->realpath_data_dir.'data.json', '{}' ) ){
					$rtn['result'] = true;
				}
			}

		}

		echo json_encode($rtn);
		exit;
    }
}
