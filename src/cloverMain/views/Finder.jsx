import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function Finder(props){

	const main = useContext(MainContext);

	useEffect(() => {
		const $finderContainer = document.getElementById('cont-remote-finder-content');
		$finderContainer.innerHTML += 'a';

		var remoteFinder = new RemoteFinder(
			$finderContainer,
			{
				"gpiBridge": function(input, callback){ // required
					main.px2utils.px2cmd(
						'/?PX=admin.api.remote_finder',
						{
							'mode': 'root',
							'input': input,
						},
						function( res ){
							if( !res.result ){
								console.error('Error:', res);
							}
							callback(res.output);
						}
					);
				},
				"open": function(fileinfo, callback){

					const $body = document.createElement('div');
					const modalObj = px2style.modal({
						"body": $body,
						"buttons": [],
						"width": "100%",
						"height": "100%",
					});
					modalObj.closable(false);

					var commonFileEditor = new CommonFileEditor(
						$body,
						{
							"read": function(filename, callback){ // required
								main.px2utils.px2cmd(
									'/?PX=admin.api.common_file_editor',
									{
										'mode': 'root',
										'method': 'read',
										'filename': filename,
									},
									function( res ){
										if( !res.result ){
											console.error('Error:', res);
										}
										callback(res);
									}
								);
							},
							"write": function(filename, base64, callback){ // required
								main.px2utils.px2cmd(
									'/?PX=admin.api.common_file_editor',
									{
										'mode': 'root',
										'method': 'write',
										'filename': filename,
										'base64': base64,
									},
									function( res ){
										if( !res.result ){
											console.error('Error:', res);
										}
										callback(res);
									}
								);
							},
							"onemptytab": function(){
								modalObj.closable(true);
								px2style.closeModal();
							}
						}
					);

					commonFileEditor.init(function(){
						console.log('ready.');
						commonFileEditor.preview( fileinfo.path );
						callback(true);
					});

				},
				// "mkdir": function(current_dir, callback){
				//     var foldername = prompt('Folder name:');
				//     if( !foldername ){ return; }
				//     callback( foldername );
				//     return;
				// },
				// "mkfile": function(current_dir, callback){
				//     var filename = prompt('File name:');
				//     if( !filename ){ return; }
				//     callback( filename );
				//     return;
				// },
				// "rename": function(renameFrom, callback){
				//     var renameTo = prompt('Rename from '+renameFrom+' to:', renameFrom);
				//     callback( renameFrom, renameTo );
				//     return;
				// },
				// "remove": function(path_target, callback){
				//     if( !confirm('Really?') ){
				//         return;
				//     }
				//     callback();
				//     return;
				// },
				// "mkdir": function(current_dir, callback){
				//     var foldername = prompt('Folder name:');
				//     if( !foldername ){ return; }
				//     callback( foldername );
				//     return;
				// },
				// "mkdir": function(current_dir, callback){
				//     var foldername = prompt('Folder name:');
				//     if( !foldername ){ return; }
				//     callback( foldername );
				//     return;
				// },
			}
		);
		// console.log(remoteFinder);
		remoteFinder.init('/', {}, function(){
			console.log('ready.');
		});

	}, []);

	return (
		<>
			<div id="cont-remote-finder-content">
				...
			</div>
		</>
	);
}
