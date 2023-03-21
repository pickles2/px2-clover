console.log('Smaple CCE "tomk79CmsToolsSample" loaded.');
window.tomk79CmsToolsSample = function(cceAgent){
	console.log('Smaple CCE "tomk79CmsToolsSample" Started.');
	cceAgent.onBroadcast(function(message){
		console.info('Broadcast recieved:', message);
		alert(message.message);
	});
	$(cceAgent.elm()).html('')
		.append($('<p>')
			.text('Smaple CCE "tomk79CmsToolsSample" Started.')
		)
		.append($('<p>')
			.append($('<button class="px2-btn">')
				.text('コンテンツを編集するテスト')
				.on('click', function(){
					cceAgent.editContent('/index.html');
				})
			)
		)
		.append($('<p>')
			.append($('<button class="px2-btn">')
				.text('テーマレイアウトを編集するテスト')
				.on('click', function(){
					cceAgent.editThemeLayout('/index.html');
				})
			)
		)
		.append($('<p>')
			.append($('<button class="px2-btn">')
				.text('GPIを呼び出すテスト')
				.on('click', function(){
					alert('呼び出します。');
					cceAgent.gpi({
						'command': 'test-gpi-call'
					}, function(res){
						console.log('---- res:', res);
						alert(res);
					});
				})
			)
		)
	;
}
