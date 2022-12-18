import React, { useContext, useState, useEffect } from "react";
import {MainContext} from '../context/MainContext';
import Link from '../components/Link';

export default function Finder(props){

	const main = useContext(MainContext);

	useEffect(() => {
        console.log('useEffect done.');
        const $finderContainer = document.getElementById('cont-remote-finder-content');
        $finderContainer.innerHTML += 'a';
        console.log( $finderContainer, $ );

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
                // "open": function(fileinfo, callback){
                //     alert('ファイル ' + fileinfo.path + ' を開きました。');
                //     callback(true);
                // },
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
