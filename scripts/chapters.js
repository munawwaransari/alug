
function getLocationPath(){
	return window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
}

function openChapter(file){
	
	var loaction = window.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
	var abs_path = getLocationPath() + 'pdfs/' + file;
	console.log("opening '"+ abs_path + "'");
	
	$('.reading-pane').attr('src', encodeURI(abs_path));
	$('body img').hide();
}

$(function () {
		
	var suffix = " - Arabic.pdf";
	var alug_chapters = [
		"P0.1 - Basics", 
		"P0.2 - Vocabulary", 
		"P0.3 - Sample Dictionary", 
		"P1 - Pronouns", 
		"P2 - Nouns", 
		"P2.1 - Noun Patterns", 
		"P2.2 - Object Effects", 
		"P3 - Verbs", 
		"P3.1 - Verb Conjugations", 
		"P4 - Sentences", 
		"P5 - Particles"
	];
	
	alug_chapters.forEach(function(ch, index)
	{
		var chapterPath = '\''+ch+suffix+'\''; 
		console.log(chapterPath);
		var chapterName = ch.split('-')[1].trim();
		$('<div class="chapter-card" onclick="openChapter('+chapterPath+')" >'+chapterName+'</div>')
			.appendTo('.card-container');
	});
});