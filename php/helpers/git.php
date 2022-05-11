<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: Git操作Helper
 */
class git{

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
	 * コミットする
	 */
	public function commit(){
		$this->px->header('Content-type: text/json');

		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$res_cmd = $this->exec_git_command(array(
			'add',
			'.',
		));
		if( !$res_cmd['result'] ){
			return array(
				'result' => false,
				'message' => $res_cmd['stdout'].$res_cmd['stderr'],
			);
		}

		$res_cmd = $this->exec_git_command(array(
			'commit',
			'-m',
			'clover commit',
		));
		if( !$res_cmd['result'] ){
			return array(
				'result' => false,
				'message' => $res_cmd['stdout'].$res_cmd['stderr'],
			);
		}

		return $rtn;
	}


	/**
	 * Gitのルートディレクトリを取得する
	 */
	private function realpath_git_root(){
		$current_dir = $this->px->fs()->get_realpath('./');
		while( 1 ){
			if( file_exists( $current_dir.'/.git' ) ){
				return $current_dir;
			}
			if( file_exists( $current_dir.'/composer.json' ) ){
				break;
			}
			if( $current_dir == $this->px->fs()->get_realpath($current_dir.'../') ){
				// これ以上階層を上がれない場合
				break;
			}
			$current_dir = $this->px->fs()->get_realpath($current_dir.'../');
		}
		return false;
	}

	/**
	 * Gitコマンドを実行する
	 */
	private function exec_git_command( $git_sub_commands ){
		$rtn = array(
			'result' => null,
			'stdout' => null,
			'stderr' => null,
		);
		$realpath_git_root = $this->realpath_git_root();
		if( !$realpath_git_root ){
			return array(
				'result' => false,
				'stdout' => null,
				'stderr' => '.git is not found.',
			);
		}
		$cd = realpath('.');
		chdir($realpath_git_root);

		foreach($git_sub_commands as $key=>$val){
			$git_sub_commands[$key] = escapeshellarg($val);
		}

		$cmd = 'git '.implode( ' ', $git_sub_commands );

		// コマンドを実行
		ob_start();
		$proc = proc_open($cmd, array(
			0 => array('pipe','r'),
			1 => array('pipe','w'),
			2 => array('pipe','w'),
		), $pipes);
		$io = array();
		foreach($pipes as $idx=>$pipe){
			$io[$idx] = null;
			if( $idx >= 1 ){
				$io[$idx] = stream_get_contents($pipe);
			}
			fclose($pipe);
		}
		$return_var = proc_close($proc);
		ob_get_clean();

		$rtn['result'] = true;
		$rtn['stdout'] = $io[1]; // stdout
		if( strlen( ''.$io[2] ) ){
			$rtn['result'] = false;
			$rtn['stderr'] = $io[2]; // stderr
		}

		chdir($cd);
		return $rtn;
	}
}
