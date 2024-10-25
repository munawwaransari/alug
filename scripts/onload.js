//
//	Author: munawwar_ali@yahoo.com
//

$(document).ready(function()
{
	nodeInserted("#languages");
	$(document).on("nodeInserted",function(e,q){
		if (q === "#languages"){
			$("#languages").parent().hide();
		}
		
		$("#text").text("");
		//$("#play").click();
	});
	
	$("#text").text('');
	$("#text").hide();

	var support = document.getElementById("support").innerHTML;

	if(support.startsWith("Hurray")){
		speech_synthesis_supportd = true;
		toggleAutoplay();

		$("#s3_2").hide();
		$("#s3_1").show();
		$("#s3_1+p").text(support);
	}
	else{
		speech_synthesis_supportd = false;
		$("#s3_1").hide();
		$("#s3_2").show();
		$("#s3_2+p").text(support);
	}	
	document.getElementById('playSections').addEventListener('change', function() {
		const selectedValue = this.value;
		$("#text").text(selectedValue);
		$("#play").click();
	});
	
	document.getElementById('lang-options').addEventListener('change', function(){
		langOption = this.value;
		$("#languages").val(langOption);
		
		if(states.action == "quiz"){
			setTimeout(function(){
				openQuizV2(states.chapter, states.file, states.topic);
			}, 150);
			
		}
	});
});

function toggleAutoplay(){
	
	if(!speech_synthesis_supportd){
		alert('Speech synthesis is not supported on your browser!');
	}else{
		toggleIcon("#s4");
		autoplay = !autoplay;
		
		if(autoplay){
			$("#playSections").show();
			$("#play").show();
		}else{
			$("#playSections").hide();
			$("#play").hide();
		}
	}
	console.log('autoplay :' + autoplay);
};

function toggleIcon(id){
	[id+'_1', id+'_2'].forEach(function(id){
		console.log('toggleIcon: ' + id); 
		$(id).toggle();	
	});
	
};

async function loadJsonData(url,  callback)
{
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.json();
		callback(data);
	} 
	catch (error) {
		console.error("Fetch error:", error);
	}
};


async function loadHtmlData(url,  callback)
{
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! Status: ${response.status}`);
		}
		const data = await response.text();
		callback(data);
	} 
	catch (error) {
		console.error("Fetch error:", error);
	}
};

//ref: https://stackoverflow.com/questions/7434685/how-can-i-be-notified-when-an-element-is-added-to-the-page
function nodeInserted(elementQuerySelector){
    if ($(elementQuerySelector).length===0){
        setTimeout(function(){
            nodeInserted(elementQuerySelector);
        },100);
    }else{
        $(document).trigger("nodeInserted",[elementQuerySelector]);
    }
};
