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

	/** Cryptオブジェクト */
	private $crypt;

	/** Clover設定オブジェクト */
	private $cloverConfig;

	/** Git Remote: URL */
	private $git_remote;

	/** Git Remote: ID */
	private $git_id;

	/** Git Remote: PW */
	private $git_pw;

	/**
	 * Constructor
	 *
	 * @param object $clover $cloverオブジェクト
	 */
	public function __construct( $clover ){
		$this->clover = $clover;
		$this->px = $clover->px();
		$this->crypt = new crypt( $this->clover );
		$this->cloverConfig = $this->clover->conf();

		if( isset($this->cloverConfig->history->git_remote) && strlen($this->cloverConfig->history->git_remote ?? '') ){
			$this->git_remote = $this->cloverConfig->history->git_remote;
		}
		if( isset($this->cloverConfig->history->git_id) && strlen($this->cloverConfig->history->git_id ?? '') ){
			$this->git_id = $this->cloverConfig->history->git_id;
		}
		if( isset($this->cloverConfig->history->git_pw) && strlen($this->crypt->decrypt($this->cloverConfig->history->git_pw ?? '')) ){
			$this->git_pw = $this->cloverConfig->history->git_pw;
		}
	}

	/**
	 * Gitのルートディレクトリを取得する
	 */
	private function realpath_git_root(){
		return $this->clover->realpath_git_root();
	}

	/**
	 * Gitコマンドのパスを取得する
	 */
	private function realpath_git_cmd(){
		return ($this->px->conf()->commands->git ?? 'git');
	}

	/**
	 * Gitリモートサーバーからデフォルトのブランチ名を取得する
	 */
	public function get_remote_default_branch_name( $git_url = null ) {
		$default = 'master';
		if( !strlen( $git_url ?? '' ) ){
			$git_url = $this->url_bind_confidentials($git_url);
		}
		if( !strlen( $git_url ?? '' ) ){
			return $default;
		}
		$realpath_git_command = $this->realpath_git_cmd();
		$result = shell_exec($realpath_git_command.' ls-remote --symref '.escapeshellarg($git_url).' HEAD');
		if(!is_string($result) || !strlen($result ?? '')){
			return $default;
		}

		if( !preg_match('/^ref\: refs\/heads\/([^\s]+)\s+HEAD/', $result, $matched) ){
			return $default;
		}

		return $matched[1];
	}

	/**
	 * Gitコマンドを直接実行する
	 *
	 * @param array $git_command_array Gitコマンドオプション
	 * @return array 実行結果
	 */
	public function git( $git_command_array = array() ){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		if( !is_array( $git_command_array ) || !count( $git_command_array ) ){
			return array(
				'result' => false,
				'message' => 'Invalid Command.',
				'stdout' => '',
				'stderr' => 'Internal Error: Invalid arguments are given.',
				'exitcode' => 1,
			);
		}

		if( !$this->is_valid_command($git_command_array) ){
			return array(
				'result' => false,
				'message' => 'Invalid Command.',
				'stdout' => '',
				'stderr' => 'Internal Error: Command not permitted.',
				'exitcode' => 1,
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
	 * コミットする
	 * autoCommit機能からコールされる
	 */
	public function commit(){
		$rtn = array();
		$rtn['result'] = true;
		$rtn['message'] = 'OK';

		$res_cmd = $this->exec_git_command(array(
			'add',
			'--all',
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
	 * origin をセットする
	 */
	public function set_remote_origin($git_url = null){
		if( !$this->has_valid_git_config() ){
			return false;
		}

		$git_remote = $this->url_bind_confidentials($git_url);
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

		if( isset($this->git_remote) && strlen($this->git_remote ?? '') ){
			$this->exec_git_command(array('remote', 'add', 'origin', $this->git_remote));
			$this->exec_git_command(array('remote', 'set-url', 'origin', $this->git_remote));
		}else{
			$this->exec_git_command(array('remote', 'remove', 'origin'));
		}
		return true;
	}

	/**
	 * 有効なGit設定がされているか？
	 */
	private function has_valid_git_config(){
		if( !isset($this->git_remote) || !strlen($this->git_remote ?? '') ){
			return false;
		}
		if( !preg_match( '/^(?:https?)\:\/\/(?:.+)\.git$/si', $this->git_remote ) ){
			return false;
		}
		return true;
	}

	/**
	 * URLに認証情報を埋め込む
	 */
	private function url_bind_confidentials($url = null, $user_name = null, $password = null){
		if( isset($this->git_remote) && !strlen($url ?? '') ){
			$url = $this->git_remote;
		}
		if( isset($this->git_id) && !strlen($user_name ?? '') ){
			$user_name = $this->git_id;
		}
		if( isset($this->git_pw) && strlen($this->crypt->decrypt($this->git_pw ?? '')) && !strlen($password ?? '') ){
			$password = $this->crypt->decrypt($this->git_pw);
		}
		if( !strlen($url ?? '') ){
			return null;
		}

		$parsed_git_url = parse_url($url);
		$rtn = '';
		$rtn .= $parsed_git_url['scheme'].'://';
		if( strlen($user_name ?? '') ){
			$rtn .= urlencode($user_name);
			if( strlen($password ?? '') ){
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
	 * Gitコマンドを実行する
	 *
	 * @param array $git_sub_commands Gitコマンドオプション
	 * @return array 実行結果
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

		if( !is_array($git_sub_commands) ){
			return array(
				'result' => false,
				'stdout' => '',
				'stderr' => 'Internal Error: Invalid arguments are given.',
				'exitcode' => 1,
			);
		}

		if( !$this->is_valid_command($git_sub_commands) ){
			return array(
				'result' => false,
				'stdout' => '',
				'stderr' => 'Internal Error: Command not permitted.',
				'exitcode' => 1,
			);
		}

		clearstatcache();

		if( !is_dir($realpath_git_root) || !is_dir($realpath_git_root.'.git/') ){
			if( $git_sub_commands[0] !== 'init' && $git_sub_commands[0] !== 'clone' ){
				// .git がなければ実行させない。
				return array(
					'result' => false,
					'stdout' => '',
					'stderr' => 'Git is not initialized.',
					'exitcode' => 1,
				);
			}
		}


		$cd = realpath('.');
		chdir($realpath_git_root);

		foreach($git_sub_commands as $idx=>$git_sub_commands_row){
			$git_sub_commands[$idx] = escapeshellarg($git_sub_commands_row);
		}

		$realpath_git_command = $this->realpath_git_cmd();
		$cmd = $realpath_git_command.' '.implode(' ', $git_sub_commands);

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
		$rtn['stdout'] = $io[1];
		if( strlen( $io[2] ?? '' ) ){
			$rtn['stderr'] = $io[2];
		}
		if( $rtn['exitcode'] ){
			$rtn['result'] = false;
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
