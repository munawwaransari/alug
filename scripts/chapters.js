//
//	Author: munawwar_ali@yahoo.com
//
function openChapter(chapter, file, page, lang){
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
	//$('#title-img').hide();
	
	updateStates({ action: "pdf", chapter: chapter, file: file, page: page});
	
	if(autoplay){
		changeLanguageOption(lang);
		setTimeout(function(){
			autoplayAudio(chapter, page, lang);
		}, 50);
	}
}

function autoplayAudio(chapter, page, lang){

	var url = getLocationPath() + 'data/audio/'+ langOption + '_' + chapter + '_autoplay.json';
	console.log('Loding play file: ' + url);
	loadJsonData(url, function(data){
		
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
	}, function(err){
		console.log("Please change language option and retry!");
	});
}

function openQuizV2(chapter, file, topic, lang){
	console.log("Quiz file: " + file);
	var loaction = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
	var data_path = location + 'data/km/' + topic + '_quiz.json';
	//loadJsonData(data_path,  function(data){

		//console.log("data_path: " + data_path);
		//var abs_path = getLocationPath() + file + '?chapter=' + chapter + '&topic=' + topic + '&data=' + JSON.stringify(data);
		var abs_path = getLocationPath() + file + '?chapter=' + chapter + '&topic=' + topic + '&lang=' + (langOption ?? window.getLang()) + '&data=' + data_path;
		$('.reading-pane').attr('src', encodeURI(abs_path));
		//$('#title-img').hide();
		
		updateStates({ action: "quiz", chapter: chapter, file: file, topic: topic});
	//});
};

$(function () {
		
	var suffix = " - Arabic.pdf";
	
	// Create navigation menus
	for (const [ch, links] of Object.entries(alug_chapters)) 
	{
		var chapterPath = '\''+ch+suffix+'\''; 
		//console.log(chapterPath);
		var chapterName = ch.split('-')[1].trim();
		$div = $('<div class="chapter-card"><span onclick="openChapter(\''+chapterName+'\', '+chapterPath+', 0)" >'+chapterName+'</span></div>');
		$('.menu-container').append($div);
			
		if(links && links.length > 0){
			//console.log('Links found');
			$subNav = $('<div class="subnav-content"></div>');
			links.forEach(function(link, index){
				var lang = link.lang ? "\'"+link.lang+"\'" : undefined;
				$subNav.append($('<div class="subNav" onclick="openChapter(\''+chapterName+'\','+chapterPath+',' + link.pageNo+','+lang+')">'+link.topic+'</div>'));				
				//console.log('Added '+ link.topic);
			});
			$div.append($subNav);
		}
	}
	
	// Create Knowledge Check Menu
	if(knowledge_checks && knowledge_checks.length > 0){
		//console.log("Adding knowldeg check links: count = " + knowledge_checks.length);
		$div = $('<div class="chapter-card"><span>Knowledge Check</span></div>');
		$('.menu-container').append($div);
		$subNav = $('<div class="subnav-content"></div>');
		$div.append($subNav);
		for(let i=0; i < knowledge_checks.length; i++){
			var entry = knowledge_checks[i];
			//console.log("ch: " + entry.ch);
			
			//var chapterPath = '\''+entry.ch+suffix+'\''; 
			$subNav.append($('<div class="subNav" onclick="openQuizV2(\'Knowledge Check\', \'quiz.html\',\'' + entry.topic+'\')">'+entry.topic+'</div>'));				
			//console.log('Added '+ entry.topic);
		}
	}
		
});
