<?php
namespace tomk79\pickles2\px2clover;

/**
 * px2-clover
 */
class register{

	/** Picklesオブジェクト */
	private $px;

	/** プラグインオプション */
	private $options;

	/** px2-clover */
	private $clover;


	/**
	 * entry
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	static public function clover( $px = null, $options = null ){
		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}

		// $options の正規化
		if( !is_object($options) ){
			$options = (object) $options;
		}
		if( !isset($options->app_mode) ){
			$options->app_mode = "web";
		}
		if( !isset($options->protect_preview) ){
			$options->protect_preview = false;
		}

		if( !$px->req()->is_cmd() ){

			// --------------------------------------
			// 初期化
			$clover = new clover( $px, $options );
			$clover->initializer()->initialize();

			// --------------------------------------
			// ガード: ループバックIP以外は desktop モードを利用できないようにする。
			if( !isset($_SERVER['REMOTE_ADDR']) ){
				// ユーザーのIPアドレスを取得できない場合、desktopモードは無効にする。
				$options->app_mode = 'web';
			}else{
				switch( $_SERVER['REMOTE_ADDR'] ){
					case '127.0.0.1':
					case '::1':
						break;
					default:
						// ユーザーのIPアドレスがループバックIPでない場合、desktopモードは無効にする。
						$options->app_mode = 'web';
						break;
				}
			}

			// --------------------------------------
			// ガード: デスクトップモードが無効だったら、他のパッケージのデスクトップモードも無効化する。
			if(
				$options->app_mode != 'desktop' &&
				(
					$px->req()->get_param('appMode') == 'desktop'
					|| $px->req()->get_param('app_mode') == 'desktop'
				)
			){
				$px->header('Content-type: application/json');
				echo json_encode(array(
					'result' => false,
					'message' => 'Disallowed parameters are given;',
				));
				exit;
			}

			// --------------------------------------
			// 認証
			$auth_needs = false;
			if( $px->req()->get_param('PX') === 'admin.logout' ){
				// ログアウト画面には認証を求めない
			}elseif( $options->protect_preview ){
				// プレビュー全体で認証を要求する
				$auth_needs = true;
			}elseif( is_string($px->req()->get_param('PX')) && strlen($px->req()->get_param('PX')) ){
				// PXコマンド全体で認証を要求する
				$auth_needs = true;
			}
			if( $auth_needs ){
				$clover->auth()->auth();
			}

			// --------------------------------------
			// メンテナンスモードの評価
			$maintenanceModeHelpers = new helpers\maintenanceMode( $clover );
			$maintenanceModeHelpers->maintenance_page();
		}

		$px->conf()->funcs->before_content['__console_resources'] = __CLASS__.'::admin_console('.json_encode($options).')';
		$px->conf()->funcs->before_output['__console_resources'] = __CLASS__.'::before_output('.json_encode($options).')';

		return;
	}

	/**
	 * entry: CMS管理画面を登録する
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	static public function admin_console( $px = null, $options = null ){
		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}

		if( !$px->is_publish_tool() ){
			$command = $px->get_px_command();
			$client_resources_dist = $px->realpath_plugin_files('/');
			if( is_array($command) && count($command) && $command[0] == 'admin' || !is_file( $client_resources_dist.'cloverMain/cloverMain.js' ) ){
				// クライアントリソースを公開ディレクトリに配置
				if(
					!is_file( $client_resources_dist.'cloverMain/cloverMain.js' ) ||
					$px->fs()->is_newer_a_than_b(__DIR__.'/../public/resources/'.'cloverMain/cloverMain.js', $client_resources_dist.'cloverMain/cloverMain.js') ||
					$px->fs()->is_newer_a_than_b(__DIR__.'/../public/resources/'.'cloverMain/cloverMain.css', $client_resources_dist.'cloverMain/cloverMain.css') ){
					$px->fs()->copy_r(__DIR__.'/../public/resources/', $client_resources_dist);
				}
			}
		}

		$px->pxcmd()->register('admin', function($px) use ($options){
			(new self( $px, $options ))->route();
		});

		return;
	}

	/**
	 * entry: Before Output
	 *
	 * @param object $px Picklesオブジェクト
	 * @param object $options プラグイン設定
	 */
	static public function before_output( $px = null, $options = null ){
		if( count(func_get_args()) <= 1 ){
			return __CLASS__.'::'.__FUNCTION__.'('.( is_array($px) ? json_encode($px) : '' ).')';
		}
		if( $px->req()->get_param('PX') || $px->req()->get_param('PICKLES2_CONTENTS_EDITOR') ){
			return;
		}
		if( $px->is_publish_tool() ){
			return;
		}
		if( !preg_match('/(?:\.html?|\/)$/', $px->req()->get_request_file_path()) ){
			return;
		}

		$src = $px->bowl()->get( 'main' );

		$clover = new clover( $px, $options );
		$src .= $clover->view()->bind(
			'/preview/footer.twig',
			array(
			)
		);

		$px->bowl()->replace( $src, 'main' );

		return;
	}


	/**
	 * Constructor
	 *
	 * @param object $px $pxオブジェクト
	 */
	private function __construct( $px, $options ){
		$this->px = $px;
		$this->clover = new clover( $this->px, $options );
	}


	/**
	 * CMS管理画面をルーティングする
	 */
	private function route(){
		$command = $this->px->get_px_command();

		if( !$this->px->req()->is_cmd() ){
			switch( $command[1] ?? '' ){
				case 'logout':
					// --------------------------------------
					// ログアウト
					$this->clover->auth()->logout();
					break;
			}
			$this->clover->auth()->auth();
		}

		if( !$this->px->req()->is_cmd() ){
			// --------------------------------------
			// ブラウザへの応答
			switch( $command[1] ?? '' ){
				case 'api':
					// --------------------------------------
					// API
					switch( $command[2] ?? '' ){
						case 'get_bootup_informations':
							$app = new funcs\api\bootupInformations($this->clover);
							$app->get();
							break;
						case 'health_check':
							$app = new funcs\api\healthChecker($this->clover);
							$app->status();
							break;
						case 'csrf_token':
							$app = new funcs\api\csrfToken($this->clover);
							$app->get();
							break;
						case 'git_init':
							$app = new funcs\api\gitInit($this->clover);
							$this->clover->authorize_required('git_init', 'json');
							$app->git_init();
							break;
						case 'get_page_info':
							$app = new funcs\api\pageInfo($this->clover);
							$app->get();
							break;
						case 'get_profile':
							$this->clover->allowed_method('post');
							$app = new funcs\api\profile($this->clover);
							$app->get();
							break;
						case 'update_profile':
							$this->clover->allowed_method('post');
							$app = new funcs\api\profile($this->clover);
							$app->update();
							break;
						case 'get_members':
							$this->clover->allowed_method('post');
							$this->clover->authorize_required('members', 'json');
							$app = new funcs\api\members($this->clover);
							$app->get_list();
							break;
						case 'create_new_member':
							$this->clover->allowed_method('post');
							$this->clover->authorize_required('members', 'json');
							$params = array(
								'name' => $this->px->req()->get_param('name'),
								'id' => $this->px->req()->get_param('id'),
								'pw' => $this->px->req()->get_param('pw'),
								'pw_retype' => $this->px->req()->get_param('pw_retype'),
								'email' => $this->px->req()->get_param('email'),
								'lang' => $this->px->req()->get_param('lang'),
								'role' => $this->px->req()->get_param('role'),
							);
							$app = new funcs\api\members($this->clover);
							$app->create_new( $params, $this->px->req()->get_param('current_pw') );
							break;
						case 'update_member':
							$this->clover->allowed_method('post');
							$this->clover->authorize_required('members', 'json');
							$params = array(
								'name' => $this->px->req()->get_param('name'),
								'id' => $this->px->req()->get_param('id'),
								'pw' => $this->px->req()->get_param('pw'),
								'pw_retype' => $this->px->req()->get_param('pw_retype'),
								'email' => $this->px->req()->get_param('email'),
								'lang' => $this->px->req()->get_param('lang'),
								'role' => $this->px->req()->get_param('role'),
							);
							$app = new funcs\api\members($this->clover);
							$app->update( $this->px->req()->get_param('target_id'), $params, $this->px->req()->get_param('current_pw') );
							break;
						case 'delete_member':
							$this->clover->allowed_method('post');
							$this->clover->authorize_required('members', 'json');
							$app = new funcs\api\members($this->clover);
							$app->delete( $this->px->req()->get_param('target_id'), $this->px->req()->get_param('current_pw') );
							break;
						case 'git':
							$this->clover->allowed_method('post');
							$app = new funcs\api\git($this->clover);
							$app->git();
							break;
						case 'git_commit':
							$this->clover->allowed_method('post');
							$app = new funcs\api\git($this->clover);
							$app->commit();
							break;
						case 'publish_stop':
							$this->clover->allowed_method('post');
							$app = new funcs\api\publish($this->clover);
							$app->stop();
							break;
						case 'get_config':
							$app = new funcs\api\config($this->clover);
							$app->get();
							break;
						case 'update_config':
							$this->clover->allowed_method('post');
							$app = new funcs\api\config($this->clover);
							$app->update();
							break;
						case 'scheduler_setting_hint':
							$this->clover->allowed_method('post');
							$app = new funcs\api\scheduler($this->clover);
							$app->setting_hint();
							break;
						case 'scheduler_add_queue':
							$this->clover->allowed_method('post');
							$service = $this->px->req()->get_param('service');
							$time = $this->px->req()->get_param('time');
							$name = $this->px->req()->get_param('name');
							$options = array();
							$app = new funcs\api\scheduler($this->clover);
							$app->add_queue($service, $time, $name, $options);
							break;
						case 'scheduler_cancel_queue':
							$this->clover->allowed_method('post');
							$app = new funcs\api\scheduler($this->clover);
							$app->cancel_queue();
							break;
						case 'maintenance_mode_status':
							$this->clover->allowed_method('post');
							$app = new funcs\api\maintenanceMode($this->clover);
							$app->status();
							break;
						case 'start_maintenance_mode':
							$this->clover->allowed_method('post');
							$app = new funcs\api\maintenanceMode($this->clover);
							$app->start();
							break;
						case 'exit_maintenance_mode':
							$this->clover->allowed_method('post');
							$app = new funcs\api\maintenanceMode($this->clover);
							$app->exit();
							break;
						case 'open_sitemap_file':
							$filefullname = $this->px->req()->get_param('filefullname');
							$sitemap_dir = $this->px->get_realpath_homedir().'sitemaps/';
							$desktopHelper = new helpers\desktop($this->clover);
							$result = $desktopHelper->open( $sitemap_dir.$filefullname );
							$this->px->header('Content-type: application/json');
							echo json_encode(array(
								'result' => $result,
								'message' => ($result ? 'OK' : 'Failed to open file.'),
							));
							exit;
							break;
						case 'remote_finder':
							$this->clover->allowed_method('post');
							$this->clover->authorize_required('write_file_directly', 'json');
							$app = new funcs\api\remoteFinder($this->clover);
							$app->gpi();
							break;
						case 'common_file_editor':
							$this->clover->allowed_method('post');
							$this->clover->authorize_required('write_file_directly', 'json');
							$app = new funcs\api\commonFileEditor($this->clover);
							$app->gpi();
							break;
						case 'blogkit':
							// --------------------------------------
							// API: BlogKit Bypass

							$this->px->header('Content-type: application/json');
							$blog = $this->px->blog;
							if( !is_object( $blog ) ){
								echo json_encode(array(
									'result' => false,
									'message' => 'BlogKit is NOT loaded.',
								));
								exit;
							}

							switch( $command[3] ?? '' ){
								case 'get_blog_list':
									$blog_list = $blog->get_blog_list();
									echo json_encode(array(
										"result" => true,
										"blog_list" => $blog_list,
									));
									exit;
									break;
								case 'get_article_list':
									$blog_id = $this->px->req()->get_param('blog_id');
									$dpp = intval($this->px->req()->get_param('dpp') ?? 0);
									if( !$dpp ){
										$dpp = 50;
									}
									$p = intval($this->px->req()->get_param('p') ?? 0);
									if( !$p ){
										$p = 1;
									}
									$article_list = $blog->get_article_list($blog_id);
									$sliced_article_list = array_slice(
										$article_list,
										$dpp * ($p-1),
										$dpp
									);
									echo json_encode(array(
										"result" => true,
										"blog_id" => $blog_id,
										"count" => count($article_list),
										"dpp" => $dpp,
										"p" => $p,
										"article_list" => $sliced_article_list,
									));
									exit;
									break;
								case 'get_article_info':
									$path = $this->px->req()->get_param('path');
									$article_info = $blog->get_article_info($path);
									echo json_encode(array(
										"result" => true,
										"blog_id" => $article_info->blog_id ?? null,
										"article_info" => $article_info->article_info ?? null,
										"originated_csv" => $article_info->originated_csv ?? null,
									));
									exit;
									break;
								case 'get_blogmap_definition':
									$writer = new \pickles2\px2BlogKit\writer($this->px, $blog, $blog->get_options());
									$blog_id = $this->px->req()->get_param('blog_id');
									$blogmap_definition = $writer->get_blogmap_definition($blog_id);
									echo json_encode(array(
										"result" => true,
										"blogmap_definition" => $blogmap_definition,
									));
									exit;
									break;
								case 'get_sitemap_definition':
									$sitemap_definition = $this->px->site()->get_sitemap_definition();
									echo json_encode(array(
										"result" => true,
										"sitemap_definition" => $sitemap_definition,
									));
									exit;
									break;
								case 'create_new_blog':
									$writer = new \pickles2\px2BlogKit\writer($this->px, $blog, $blog->get_options());
									$blog_id = $this->px->req()->get_param('blog_id');
									$result = $writer->create_new_blog( $blog_id );
									echo json_encode(array(
										"result" => $result->result ?? null,
										"message" => $result->message ?? null,
										"errors" => $result->errors ?? null,
									));
									exit;
									break;
								case 'delete_blog':
									$writer = new \pickles2\px2BlogKit\writer($this->px, $blog, $blog->get_options());
									$blog_id = $this->px->req()->get_param('blog_id');
									$result = $writer->delete_blog( $blog_id );
									echo json_encode(array(
										"result" => $result->result ?? null,
										"message" => $result->message ?? null,
										"errors" => $result->errors ?? null,
									));
									exit;
									break;
								case 'create_new_article':
									$writer = new \pickles2\px2BlogKit\writer($this->px, $blog, $blog->get_options());
									$blog_id = $this->px->req()->get_param('blog_id');
									$fields = json_decode($this->px->req()->get_param('fields'));
									$result = $writer->create_new_article($blog_id, $fields ?? null);
									echo json_encode(array(
										"result" => $result->result ?? null,
										"message" => $result->message ?? null,
										"errors" => $result->errors ?? null,
									));
									exit;
									break;
								case 'update_article':
									$writer = new \pickles2\px2BlogKit\writer($this->px, $blog, $blog->get_options());
									$blog_id = $this->px->req()->get_param('blog_id');
									$path = $this->px->req()->get_param('path');
									$fields = json_decode($this->px->req()->get_param('fields'));
									$result = $writer->update_article($blog_id, $path, $fields ?? null);
									echo json_encode(array(
										"result" => $result->result ?? null,
										"message" => $result->message ?? null,
										"errors" => $result->errors ?? null,
									));
									exit;
									break;
								case 'delete_article':
									$writer = new \pickles2\px2BlogKit\writer($this->px, $blog, $blog->get_options());
									$blog_id = $this->px->req()->get_param('blog_id');
									$path = $this->px->req()->get_param('path');
									$result = $writer->delete_article($blog_id, $path);
									echo json_encode(array(
										"result" => $result->result ?? null,
										"message" => $result->message ?? null,
										"errors" => $result->errors ?? null,
										"blog_id" => $request->blog_id ?? null,
										"path" => $request->path ?? null,
									));
									exit;
									break;
							}
					}
					break;

				case 'edit_content':
					// --------------------------------------
					// コンテンツを編集
					$app = new funcs\editContent\editContent($this->clover);
					$app->start();
					break;

				case 'edit_theme_layout':
					// --------------------------------------
					// テーマレイアウトを編集
					$this->clover->authorize_required('write_file_directly', 'json');
					$app = new funcs\editThemeLayout\editThemeLayout($this->clover);
					$app->start();
					break;

				default:
					// --------------------------------------
					// フロントエンド汎用テンプレート
					echo $this->clover->view()->bind(
						'/cont/cloverMain.twig',
						array(
							'url_backto' => $this->px->href( $this->px->req()->get_request_file_path() ),
						)
					);
					exit;
					break;
			}

			echo '{"title":"Pickles 2 Clover",'."\n";
			echo '"result":false,'."\n";
			echo '"message":"Unknown API."'."\n";
			echo '}'."\n";
			exit;
		}
		// --------------------------------------
		// CLIへの応答
		switch( $command[1] ?? '' ){
			case 'api':
				// --------------------------------------
				// API
				switch( $command[2] ?? '' ){
					case 'scheduler_run':
						$this->clover->allowed_method(['command']);
						$app = new funcs\api\scheduler($this->clover);
						$app->run();
						break;
				}
				break;
		}

		echo '{"title":"Pickles 2 Clover",'."\n";
		echo '"result":false,'."\n";
		echo '"message":"Pickles 2 Clover is not support CLI."'."\n";
		echo '}'."\n";
		exit;
	}
}
