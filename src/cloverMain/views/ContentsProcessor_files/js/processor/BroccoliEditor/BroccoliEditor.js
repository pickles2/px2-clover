import it79 from 'iterate79';

/**
 * broccoli-processor
 */
export default function BroccoliEditor(contentsPath, dataJson, logger){
	const broccoliProcessor = this;

	var commands = [];

	/**
	 * 再帰処理
	 */
	function instanceProcessRecursive( instancePath, each, instance, idx, callback ){
		callback = callback || function(){console.error('callback was not given.');};

		var modId = instance.modId;
		var subModName = instance.subModName;

		const next = function(instance){
			it79.ary(
				instance.fields,
				function( it1, childFields, childsIdx ){
					it79.ary(
						childFields,
						function( it2, childField, childIdx ){
							if( childField.modId !== undefined && childField.fields !== undefined ){
								instanceProcessRecursive(
									instancePath+'/fields.'+childsIdx+'@'+childIdx,
									each,
									childField, childIdx,
									function(result){
										childField = result;
										it2.next();
									}
								);
								return;
							}
							it2.next();
						},
						function(){
							it1.next();
						}
					);
				},
				function(){
					callback(instance);
				}
			);
		};

		each(instance, {contentsPath: contentsPath, editorType: "html.gui", instancePath: instancePath,}, logger, next);
		return;
	}

	/**
	 * すべてのインスタンスを再帰的に処理するコールバック関数を登録する
	 */
	this.each = function(each){
		commands.push({
			'method': 'each',
			'content': each
		});
		return;
	}

	/**
	 * リクエストを実行
	 */
	function executeAll(callback){
		it79.ary(
			commands,
			function( it1, row1, idx1 ){
				switch(row1.method){
					case 'each':
						it79.ary(
							dataJson,
							function( it2, row2, idx2 ){
								it79.ary(
									row2,
									function( it3, row3, idx3 ){
										// console.log(row3, idx3);
										instanceProcessRecursive(
											'/bowl.'+idx3,
											row1.content,
											row3, idx3,
											function(result){
												row3 = result;
												it3.next();
											}
										);
									},
									function(){
										it2.next();
									}
								);
							},
							function(){
								it1.next();
								return;
							}
						);
						break;
					default:
						console.error('unknown method', row1.method);
						it1.next();
						break;
				}
			},
			function(){
				commands = []; // reset
				callback();
				return;
			}
		);
		return;
	}

	/**
	 * 変更を実行する
	 */
	this.run = async function(callback){
		callback = callback || function(){};
		return new Promise((resolve, reject)=>{
			executeAll(function(){
				callback();
				resolve();
			});
		});
	}
}
