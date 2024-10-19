//
//	Author: munawwar_ali@yahoo.com
//

function getLocationPath(){
	return window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
}

function openChapter(chapter, file, page){
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
	$('#title-img').hide();
	
	
	if(autoplay){
		
		var url = getLocationPath() + 'data/'+ chapter + '_autoplay.json';
		//alert(url);
		loadAutoPlayScript(url, function(data){
			
			var sections = jQuery.map(data, function(obj) {
				if(obj.pageNo === page)
				return obj.sections;
			});
			
			// Load play list
			$('#playSections').find('option').remove().end();
			if(sections){
				sections.forEach(function(sect){
					//console.log(sect.play);
					$('#playSections').append('<option value="'+ sect.play +'">'+sect.topic+'</option>');					
				});
				
				$("#text").text($('#playSections').val());
				$("#play").click();
			}
		});
	}
}

$(function () {
		
	var suffix = " - Arabic.pdf";
	
	// Create navigation menus
	for (const [ch, links] of Object.entries(alug_chapters)) 
	{
		var chapterPath = '\''+ch+suffix+'\''; 
		console.log(chapterPath);
		var chapterName = ch.split('-')[1].trim();
		$div = $('<div class="chapter-card"><span onclick="openChapter(\''+chapterName+'\', '+chapterPath+', 0)" >'+chapterName+'</span></div>');
		$('.card-container').append($div);
			
		if(links && links.length > 0){
			console.log('Links found');
			$subNav = $('<div class="subnav-content"></div>');
			links.forEach(function(link, index){
				
				$subNav.append($('<div class="subNav" onclick="openChapter(\''+chapterName+'\','+chapterPath+',' + link.pageNo+')">'+link.topic+'</div>'));				
				console.log('Added '+ link.topic);
			});
			$div.append($subNav);
		}
	}
	
	// Create Knowledge Check Menu
	if(knowledge_checks && knowledge_checks.length > 0){
		console.log("Adding knowldeg check links: count = " + knowledge_checks.length);
		$div = $('<div class="chapter-card"><span>Knowledge Check</span></div>');
		$('.card-container').append($div);
		$subNav = $('<div class="subnav-content"></div>');
		$div.append($subNav);
		for(let i=0; i < knowledge_checks.length; i++){
			var entry = knowledge_checks[i];
			console.log("ch: " + entry.ch);
			
			var chapterPath = '\''+entry.ch+suffix+'\''; 				
			$subNav.append($('<div class="subNav" onclick="openChapter(\'Knowledge Check\', '+chapterPath+',' + entry.pageNo+')">'+entry.topic+'</div>'));				
			console.log('Added '+ entry.topic);
		}
	}
		
});