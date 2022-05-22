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
	 * Gitコマンドを直接実行する
	 */
	public function git( $git_command_array = array() ){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		if( !is_array( $git_command_array ) || !count( $git_command_array ) ){
			return array(
				'result' => false,
				'message' => 'Invalid Command.',
			);
		}
		if( !$this->is_valid_command($git_command_array) ){
			return array(
				'result' => true,
				'message' => 'Invalid Command.',
			);
		}

		// Gitコマンドを実行する
		$res_cmd = $this->exec_git_command( $git_command_array );
		if( !$res_cmd['result'] ){
			return array(
				'result' => false,
				'message' => $res_cmd['stdout'].$res_cmd['stderr'],
			);
		}

		$rtn['exitcode'] = 0;
		$rtn['stdout'] = $res_cmd['stdout'];
		$rtn['stderr'] = $res_cmd['stderr'];

		return $rtn;
	}

	/**
	 * 状態を知る
	 */
	public function status(){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$res_cmd = $this->exec_git_command(array(
			'status',
		));
		if( !$res_cmd['result'] ){
			return array(
				'result' => false,
				'message' => $res_cmd['stdout'].$res_cmd['stderr'],
			);
		}

		$rtn['status'] = $res_cmd['stdout'].$res_cmd['stderr'];

		return $rtn;
	}

	/**
	 * コミットする
	 */
	public function commit(){
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
	 * フェッチする
	 */
	public function fetch(){
		$this->px->header('Content-type: text/json');

		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$res_cmd = $this->exec_git_command(array(
			'fetch',
			'--prune',
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
	 * プルする
	 */
	public function pull(){
		$this->px->header('Content-type: text/json');

		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$res_cmd = $this->exec_git_command(array(
			'pull',
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
	 * プッシュする
	 */
	public function push(){
		$this->px->header('Content-type: text/json');

		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$res_cmd = $this->exec_git_command(array(
			'push',
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

	/**
	 * Gitコマンドに不正がないか確認する
	 */
	private function is_valid_command( $git_sub_command ){

		if( !is_array($git_sub_command) ){
			// 配列で受け取る
			return false;
		}

		// 許可されたコマンド
		switch( $git_sub_command[0] ){
			case 'init':
			case 'clone':
			case 'config':
			case 'status':
			case 'branch':
			case 'log':
			case 'diff':
			case 'show':
			case 'remote':
			case 'fetch':
			case 'checkout':
			case 'add':
			case 'rm':
			case 'reset':
			case 'clean':
			case 'commit':
			case 'merge':
			case 'push':
			case 'pull':
				break;
			default:
				return false;
				break;
		}

		// 不正なオプション
		foreach( $git_sub_command as $git_sub_command_row ){
			if( preg_match( '/^\-\-output(?:\=.*)?$/', $git_sub_command_row ) ){
				return false;
			}
		}

		return true;
	}

}
