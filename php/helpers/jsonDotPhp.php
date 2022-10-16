<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: JSON.PHP Helper
 */
class jsonDotPhp{

	private static $src_header = '<'.'?php header(\'HTTP/1.1 404 Not Found\'); echo(\'404 Not Found\');exit();'."\n".'/*[json]'."\n";
	private static $src_footer = "\n".'[/json]*/';

	/**
	 * Constructor
	 */
	public function __construct(){
	}

	/**
	 * JSON.PHP を読み込む
	 */
	static public function read( $realpath ){
		if( !is_file($realpath) ){
			return false;
		}
		$jsonDotPhp = file_get_contents($realpath);
		$jsonDotPhp = ltrim($jsonDotPhp, self::$src_header);
		$jsonDotPhp = rtrim($jsonDotPhp, self::$src_footer);
		return json_decode($jsonDotPhp);
	}

	/**
	 * JSON.PHP を保存する
	 */
	static public function write( $realpath, $content ){
		$json = json_encode($content, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
		$jsonDotPhp = self::$src_header.$json.self::$src_footer;
		$result = file_put_contents( $realpath, $jsonDotPhp );
		return $result;
	}
}
