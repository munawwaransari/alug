//
//	Author: munawwar_ali@yahoo.com
//

$(document).ready(function()
{
	nodeInserted("#languages");
	$(document).on("nodeInserted",function(e,q){
		if (q === "#languages"){
			
			// Check if Arabic support added
			var arSupport = $('#languages option[value="ar-SA"]'); 
			if(arSupport.length == 0){
			    console.log("No Arabic language found in languages. Adding explicitly");
			    var select = $("#languages");
			    select.append($('<option>', { value: 'ar-SA', text: 'Arabic Language Support'}));
			}
			
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
		console.log("lang option changed: "+ langOption);
		if(states.action == "quiz"){
			setTimeout(function(){
				openQuizV2(states.chapter, states.file, states.topic);
			}, 150);
			
		}
	});
	
	var searchVal = decodeURI(getParamValue("search"));	
	if(searchVal && searchVal != 'undefined'){
		loadQuranSearch(searchVal);
	}
});

			
function singInUser(){
	console.log("signIn");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "login.html"));
		$('#title-img').hide();
	}, 5);
}

function changeLanguageOption(lang){
	
	langOption = lang ?? langOption ?? "en-US";
	if( !lang && langOption == "ar-SA"){
		langOption = "en-US";
	}
		
	var selectElement = document.getElementById('lang-options');
	selectElement.value = langOption;
	var event = new Event('change');
	selectElement.dispatchEvent(event);	
}

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
		//console.log('toggleIcon: ' + id); 
		$(id).toggle();	
	});
	
};

function loadDictionarySearch(text){

	console.log("loadDictionarySearch");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "dsearch.html?search="+text));
		$('#title-img').hide();
	}, 5);
}

function loadQuranSearch(text){
	
	console.log("loadQuranSearch");
	$('.reading-pane').attr("src","");
	setTimeout(function(){

		//get lang pram value
		var selectElement = document.getElementById('lang-options');
		var lang = selectElement.value.substring(0,2);

		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "qsearch.html?search="+text+"&lang="+lang));
		$('#title-img').hide();
	}, 5);
}

function showAlphabetChart(){
	console.log("showAlphabetChart");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "alpha.html"));
		$('#title-img').hide();
	}, 5);
}

async function loadJsonData(url,  callback, errorCallback)
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
		if (errorCallback){
			errorCallback(error);
		}
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
