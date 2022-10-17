<?php
namespace tomk79\pickles2\px2clover\helpers;

/**
 * px2-clover: data.PHP Helper
 */
class dataDotPhp{

	private static $src_header = '<'.'?php header(\'HTTP/1.1 404 Not Found\'); echo(\'404 Not Found\');exit(); ?'.'>'."\n";

	/**
	 * JSON.PHP を読み込む
	 */
	static public function read_json( $realpath ){
		if( !is_file($realpath) ){
			return false;
		}
		$jsonDotPhp = file_get_contents($realpath);
		$jsonDotPhp = preg_replace('/^.*?exit\(\)\;\s*\?\>\s*/is', '', $jsonDotPhp);
		$json = json_decode($jsonDotPhp);
		return $json;
	}

	/**
	 * JSON.PHP を保存する
	 */
	static public function write_json( $realpath, $content ){
		$jsonString = json_encode($content, JSON_PRETTY_PRINT|JSON_UNESCAPED_UNICODE);
		$jsonDotPhp = self::$src_header.$jsonString;
		$result = file_put_contents( $realpath, $jsonDotPhp );
		return $result;
	}
}
