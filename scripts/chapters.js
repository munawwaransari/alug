//
//	Author: munawwar_ali@yahoo.com
//

function getLocationPath(){
	return window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
}

function openChapter(file, page){
	console.log("file: " + file);
	var loaction = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
	var abs_path = getLocationPath() + 'pdfs/' + file;
	
	if(page > 0){
		console.log("opening '"+ abs_path + "' , page = " + page);
		$('.reading-pane').attr("src","");
		setTimeout(function(){
			$('.reading-pane').attr('src', encodeURI(abs_path)+"#page=" + page);
		}, 5);
	}
	else{
		console.log("opening '"+ abs_path + "'");
		$('.reading-pane').attr("src","");
		setTimeout(function(){
			$('.reading-pane').attr('src', encodeURI(abs_path));
		}, 5);
	}
	$('body img').hide();
}

$(function () {
		
	var suffix = " - Arabic.pdf";
	
	// Create navigation menus
	for (const [ch, links] of Object.entries(alug_chapters)) 
	{
		var chapterPath = '\''+ch+suffix+'\''; 
		console.log(chapterPath);
		var chapterName = ch.split('-')[1].trim();
		$div = $('<div class="chapter-card"><span onclick="openChapter('+chapterPath+', 0)" >'+chapterName+'</span></div>');
		$('.card-container').append($div);
			
		if(links && links.length > 0){
			console.log('Links found');
			$subNav = $('<div class="subnav-content"></div>');
			links.forEach(function(link, index){
				
				$subNav.append($('<div class="subNav" onclick="openChapter('+chapterPath+',' + link.pageNo+')">'+link.topic+'</div>'));				
				console.log('Added '+ link.topic);
			});
			$div.append($subNav);
		}
	}
		
});