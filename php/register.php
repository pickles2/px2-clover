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
		if( !isset($options->protect_preview) ){
			$options->protect_preview = false;
		}
		if( !is_string($options->realpath_admin_user_dir ?? null) || !strlen($options->realpath_admin_user_dir ?? '') ){
			$options->realpath_admin_user_dir = null;
		}

		// NOTE: `app_mode` オプションは、 px2-clover v0.3.0 で廃止されました。
		$options->app_mode = "web";

		if( !$px->req()->is_cmd() ){

			// --------------------------------------
			// 初期化
			$clover = new clover( $px, $options );
			$clover->initializer()->initialize();

			// --------------------------------------
			// ガード: 他のパッケージのデスクトップモードを無効化する。
			if( $px->req()->get_param('appMode') == 'desktop' || $px->req()->get_param('app_mode') == 'desktop' ){
				$px->set_status(403);
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
			// $px->authorizer を初期化する
			if( $px->get_px_command() ){
				$login_user_info = $clover->auth()->get_login_user_info();
				\tomk79\pickles2\px2dthelper\authorizer::initialize($px, $login_user_info->role ?? null);
			}

			// --------------------------------------
			// メンテナンスモードの評価
			$maintenanceModeHelpers = new helpers\maintenanceMode( $clover );
			$maintenanceModeHelpers->maintenance_page();

			// --------------------------------------
			// 他パッケージのPXコマンドに対する干渉
			self::route_expackages($clover);
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

		if( $this->px->req()->is_cmd() ){
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

				case 'serve':
					// --------------------------------------
					// 開発用ローカルサーバーを起動する
					$app = new funcs\serve\serve($this->px);
					$app->start();
					break;
			}

			echo '{"title":"Pickles 2 Clover",'."\n";
			echo '"result":false,'."\n";
			echo '"message":"Pickles 2 Clover is not support CLI."'."\n";
			echo '}'."\n";
			exit;
		}

		// --------------------------------------
		// ブラウザへの応答
		switch( $command[1] ?? '' ){
			case 'logout':
				// --------------------------------------
				// ログアウト
				$this->clover->auth()->logout();
				break;
		}
		$this->clover->auth()->auth();


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
						$this->clover->authorize_required('manage', 'json');
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
							'appearance' => $this->px->req()->get_param('appearance'),
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
							'appearance' => $this->px->req()->get_param('appearance'),
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
						$this->clover->authorize_required('config', 'json');
						$this->clover->authorize_required('server_side_scripting', 'json');
						$app = new funcs\api\config($this->clover);
						$app->update();
						break;
					case 'scheduler_setting_hint':
						$this->clover->allowed_method('post');
						$this->clover->authorize_required('config', 'json');
						$this->clover->authorize_required('server_side_scripting', 'json');
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
						$this->clover->authorize_required('config', 'json');
						$app = new funcs\api\maintenanceMode($this->clover);
						$app->start();
						break;
					case 'exit_maintenance_mode':
						$this->clover->allowed_method('post');
						$this->clover->authorize_required('config', 'json');
						$app = new funcs\api\maintenanceMode($this->clover);
						$app->exit();
						break;
					case 'remote_finder':
						$this->clover->allowed_method('post');
						$this->clover->authorize_required('write_file_directly', 'json');
						$this->clover->authorize_required('server_side_scripting', 'json');
						$app = new funcs\api\remoteFinder($this->clover);
						$app->gpi();
						break;
					case 'common_file_editor':
						$this->clover->allowed_method('post');
						$this->clover->authorize_required('write_file_directly', 'json');
						$this->clover->authorize_required('server_side_scripting', 'json');
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
								$this->clover->allowed_method('post');
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
								$this->clover->allowed_method('post');
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
								$this->clover->allowed_method('post');
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
								$this->clover->allowed_method('post');
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
								$this->clover->allowed_method('post');
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
						break;
					case 'checkout':
						$this->clover->allowed_method('post');
						switch( $command[3] ?? '' ){
							case 'start':
								$item = $this->px->req()->get_param('item');
								$result = $this->clover->checkout()->start($item);
								echo json_encode($result);
								exit;
								break;
							case 'release':
								$item = $this->px->req()->get_param('item');
								$result = $this->clover->checkout()->release($item);
								echo json_encode(array(
									"result" => $result,
								));
								exit;
								break;
						}
						break;
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

	/**
	 * 他パッケージのPXコマンドに対する干渉
	 */
	static private function route_expackages($clover){
		$px = $clover->px();
		switch($px->req()->get_param('PX')){
			case "px2dthelper.px2ce.gpi":
				$item = 'content:'.$px->req()->get_request_file_path();
				if( $px->req()->get_param('theme_id') || $px->req()->get_param('layout_id') ){
					$item = 'theme:'.$px->req()->get_param('theme_id').'/'.$px->req()->get_param('layout_id');
				}elseif( $px->req()->get_param('target_mode') == 'theme_layout' ){
					$tmp_data = json_decode(base64_decode($px->req()->get_param('data')));
					preg_match('/^\/([a-zA-Z0-9\_\-]+)\/([a-zA-Z0-9\_\-]+)\.[a-zA-Z0-9]+$/', $tmp_data->page_path ?? $px->req()->get_request_file_path(), $matched);
					$tmp_theme_id = $matched[1] ?? $px->req()->get_param('theme_id') ?? null;
					$tmp_layout_id = $matched[2] ?? $px->req()->get_param('layout_id') ?? null;
					$item = 'theme:'.$tmp_theme_id.'/'.$tmp_layout_id;
					unset($tmp_data, $tmp_theme_id, $tmp_layout_id);
				}
				$result = $clover->checkout()->start($item);
				if( !$result->result ){
					echo json_encode(array(
						"result" => false,
						"message" => "Contents locked.",
					));
					exit;
				}
				break;
		}
	}
}
