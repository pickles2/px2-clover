/**
 * Utils.js
 */
module.exports = function(){

	this.fixBlogmapDefinition = function( blogmapDefinition, sitemapDefinition ){
		blogmapDefinition.forEach((definition, index) => {
			if( sitemapDefinition[definition.key] ){
                blogmapDefinition[index] = {
                    ...blogmapDefinition[index],
                    ...sitemapDefinition[definition.key],
                };
				return;
			}
			if( definition.key.match(/(?:\-|\_)fla?g$/) ){
				blogmapDefinition[index].type = "boolean";
			}else if( definition.key.match(/^is(?:\-|\_)/) ){
				blogmapDefinition[index].type = "boolean";
			}else if( definition.key.match(/(?:\-|\_)date$/) ){
				blogmapDefinition[index].type = "date";
			}else if( definition.key.match(/(?:\-|\_)datetime$/) ){
				blogmapDefinition[index].type = "datetime";
			}
		});
		return blogmapDefinition;
	};

	this.editArticleFormInteraction = function( $body ){
		$body.find(`[data-btn-function="today"]`).on('click', function(e){
			const $this = $(this);
			const setFor = $this.attr('data-for');
			$(`#${setFor}`).val((function(){
				const date = new Date();
				return date.getFullYear() +
					'-' + ('0' + (date.getMonth() + 1)).slice(-2) +
					'-' + ('0' + date.getDate()).slice(-2);
			})());
		});
		$body.find(`[data-btn-function="now"]`).on('click', function(e){
			const $this = $(this);
			const setFor = $this.attr('data-for');
			$(`#${setFor}`).val((function(){
				const date = new Date();
				return date.getFullYear() +
					'-' + ('0' + (date.getMonth() + 1)).slice(-2) +
					'-' + ('0' + date.getDate()).slice(-2) +
					' ' + ('0' + date.getHours()).slice(-2) +
					':' + ('0' + date.getMinutes()).slice(-2) +
					':' + ('0' + date.getSeconds()).slice(-2);
			})());
		});
	}

};
