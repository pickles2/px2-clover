<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: Git操作Helper
 */
class git {

	/** Cloverオブジェクト */
	private $clover;

	/** Picklesオブジェクト */
	private $px;

	/** Clover設定オブジェクト */
	private $cloverConfig;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 * @param object $px $pxオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
		$this->cloverConfig = $this->clover->conf();
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
		$this->set_remote_origin();
		$res_cmd = $this->exec_git_command( $git_command_array );
		$this->clear_remote_origin();

		if( !$res_cmd['result'] ){
			return array(
				'result' => false,
				'message' => $this->conceal_confidentials($res_cmd['stdout']).$this->conceal_confidentials($res_cmd['stderr']),
			);
		}

		$rtn['exitcode'] = $res_cmd['exitcode'];
		$rtn['stdout'] = $this->conceal_confidentials($res_cmd['stdout']);
		$rtn['stderr'] = $this->conceal_confidentials($res_cmd['stderr']);

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
				'message' => $this->conceal_confidentials($res_cmd['stdout']).$this->conceal_confidentials($res_cmd['stderr']),
			);
		}

		$rtn['status'] = $this->conceal_confidentials($res_cmd['stdout']).$this->conceal_confidentials($res_cmd['stderr']);

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
				'message' => $this->conceal_confidentials($res_cmd['stdout']).$this->conceal_confidentials($res_cmd['stderr']),
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
				'message' => $this->conceal_confidentials($res_cmd['stdout']).$this->conceal_confidentials($res_cmd['stderr']),
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

		$this->set_remote_origin();
		$res_cmd = $this->exec_git_command(array(
			'fetch',
			'--prune',
		));
		$this->clear_remote_origin();
		if( !$res_cmd['result'] ){
			return array(
				'result' => false,
				'message' => $this->conceal_confidentials($res_cmd['stdout']).$this->conceal_confidentials($res_cmd['stderr']),
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

		$this->set_remote_origin();
		$res_cmd = $this->exec_git_command(array(
			'pull',
		));
		$this->clear_remote_origin();
		if( !$res_cmd['result'] ){
			return array(
				'result' => false,
				'message' => $this->conceal_confidentials($res_cmd['stdout']).$this->conceal_confidentials($res_cmd['stderr']),
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

		$this->set_remote_origin();
		$res_cmd = $this->exec_git_command(array(
			'push',
		));
		$this->clear_remote_origin();
		if( !$res_cmd['result'] ){
			return array(
				'result' => false,
				'message' => $this->conceal_confidentials($res_cmd['stdout']).$this->conceal_confidentials($res_cmd['stderr']),
			);
		}

		return $rtn;
	}


	/**
	 * origin をセットする
	 */
	public function set_remote_origin(){
		if( !$this->has_valid_git_config() ){
			return false;
		}

		$git_remote = $this->url_bind_confidentials();
		if( !strlen($git_remote ?? '') ){
			return true;
		}
		$this->exec_git_command(array('remote', 'add', 'origin', $git_remote));
		$this->exec_git_command(array('remote', 'set-url', 'origin', $git_remote));
		return true;
	}

	/**
	 * origin を削除する
	 */
	public function clear_remote_origin(){
		if( !$this->has_valid_git_config() ){
			return false;
		}

		if( isset($this->cloverConfig->history->git_remote) && strlen($this->cloverConfig->history->git_remote ?? '') ){
			$git_remote = $this->cloverConfig->history->git_remote;
			$this->exec_git_command(array('remote', 'add', 'origin', $git_remote));
			$this->exec_git_command(array('remote', 'set-url', 'origin', $git_remote));
		}else{
			$this->exec_git_command(array('remote', 'remove', 'origin'));
		}
		return true;
	}

	/**
	 * 有効なGit設定がされているか？
	 */
	private function has_valid_git_config(){
		if( !isset($this->cloverConfig->history->git_remote) || !strlen($this->cloverConfig->history->git_remote ?? '') ){
			return false;
		}
		$git_remote = $this->cloverConfig->history->git_remote;
		if( !preg_match( '/^(?:https?)\:\/\/(?:.+)\.git$/si', $git_remote ) ){
			return false;
		}
		return true;
	}

	/**
	 * gitコマンドの結果から、秘匿な情報を隠蔽する
	 * @param string $str 出力テキスト
	 * @return string 秘匿情報を隠蔽加工したテキスト
	 */
	private function conceal_confidentials($str){
		if( !strlen($str ?? '') ){
			return $str;
		}

		// gitリモートリポジトリのURLに含まれるパスワードを隠蔽
		// ただし、アカウント名は残す。
		$str = preg_replace('/((?:[a-zA-Z\-\_]+))\:\/\/([^\s\/\\\\]*?\:)([^\s\/\\\\]*)\@/si', '$1://$2********@', $str);

		return $str;
	}

	/**
	 * URLに認証情報を埋め込む
	 */
	private function url_bind_confidentials($url = null, $user_name = null, $password = null){
		$crypt = new crypt( $this->clover );
		$this->cloverConfig = $this->clover->conf();
		if( isset($this->cloverConfig->history->git_remote) && !strlen($url ?? '') ){
			$url = $this->cloverConfig->history->git_remote;
		}
		if( isset($this->cloverConfig->history->git_id) && !strlen($user_name ?? '') ){
			$user_name = $this->cloverConfig->history->git_id;
		}
		if( isset($this->cloverConfig->history->git_pw) && strlen($crypt->decrypt($this->cloverConfig->history->git_pw ?? '')) && !strlen($password ?? '') ){
			$password = $crypt->decrypt($this->cloverConfig->history->git_pw);
		}
		if( !strlen($url) ){
			return null;
		}

		$parsed_git_url = parse_url($url);
		$rtn = '';
		$rtn .= $parsed_git_url['scheme'].'://';
		if( strlen($user_name) ){
			$rtn .= urlencode($user_name);
			if( strlen($password) ){
				$rtn .= ':'.urlencode($password);
			}
			$rtn .= '@';
		}
		$rtn .= $parsed_git_url['host'];
		if( array_key_exists('port', $parsed_git_url) && strlen($parsed_git_url['port'] ?? '') ){
			$rtn .= ':'.$parsed_git_url['port'];
		}
		$rtn .= $parsed_git_url['path'];
		if( array_key_exists('query', $parsed_git_url) && strlen($parsed_git_url['query'] ?? '') ){
			$rtn .= '?'.$parsed_git_url['query'];
		}
		return $rtn;
	}

	/**
	 * Gitのルートディレクトリを取得する
	 */
	private function realpath_git_root(){
		return $this->clover->realpath_git_root();
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

		$stat = array();
		do {
			$stat = proc_get_status($proc);
			// waiting
			usleep(1);
		} while( $stat['running'] );

		$return_var = proc_close($proc);
		ob_get_clean();

		$rtn['result'] = true;
		$rtn['exitcode'] = $stat['exitcode'];
		$rtn['stdout'] = $io[1]; // stdout
		if( isset($io[2]) && strlen( $io[2] ) ){
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
		switch( $git_sub_command[0] ?? null ){
			case 'init':
			case '--version':
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
		if( $git_sub_command[0] == '--version' && count($git_sub_command) != 1 ){
			return false;
		}

		return true;
	}

}
