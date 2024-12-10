//
//	Author: munawwar_ali@yahoo.com
//

$(document).ready(function()
{
	$(".tool").on('click', function(){
		updateToolDescription(event.target.id);
	});
	
	window.onresize = updateDeviceSize;
	updateDeviceSize();
	function updateDeviceSize(){
		var deviceType = getDeviceType();
		$(".toolDiv").removeClass('mobile');
		$(".toolDiv").removeClass('pad');
		$(".toolDiv").removeClass('desktop');
		$(".toolDiv").addClass(deviceType);
		console.log(deviceType);
		window.onresize = undefined;
	}
	
	nodeInserted("#languages");
	$(document).on("nodeInserted",function(e,q){
		if (q === "#languages"){
			$("#languages").parent().hide();
			
			// set support options
			var arVoices =  $("#languages option").filter(function(i, x){
				return x.value === 'ar-SA' || x.value === 'ar_SA';
			});
			var urVoices = $("#languages option").filter(function(i, x){
				return x.value === 'ur-PK' || x.value === 'ur_PK' ||
					   x.value === 'ur-IN' || x.value === 'ur_IN';
			});
			arSupported = arVoices.length >  0;
			urSupported = urVoices.length >  0;
		}
		$("#text").text("");
		$("#play").click();
		
		// Load initial page
		var searchVal = decodeURI(getParamValue("search"));	
		if(searchVal && searchVal != 'undefined'){
			loadQuranSearch(searchVal);
		}else{
			loadSampleDictionary();
		}
	});
	
	$("#text").text('');
	$("#text").hide();

	checkBrowserSupport();
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
});

			
function singInUser(){
	console.log("signIn");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "login.html"));
		//$('#title-img').hide();
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
		toggleIcon("#ss-support");
		alert('Speech synthesis is not supported on your browser!');
	}else{
		toggleIcon("#speech");
		autoplay = !autoplay;
		
		if(autoplay){
			$("#playSections").show();
			$("#play").show();
			updateStates({"speech": "Autoplay is now enabled!" });
		}else{
			$("#playSections").hide();
			$("#play").hide();
			updateStates({"speech": "Autoplay is now disabled!" });
		}
	}
	console.log('autoplay :' + autoplay);
}

function toggleMenu(){
	
	toggleIcon("#topics");
	menuOption = !menuOption;
	$(".menu-container").toggle();
	/*
	if(menuOption){
		
	}else{
		$("#menu-container").css('display', 'none!important');
		$("#menu-container").css('overflow', 'hidden!important');
		$("#menu-container").hide();
	}*/
	console.log('menuOption :' + menuOption);
}

function toggleIcon(id){
	[id+'_1', id+'_2'].forEach(function(id){
		//console.log('toggleIcon: ' + id); 
		$(id).toggle();	
	});
	
};

function loadResources(){
	console.log("loadResources");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "dresources.html"));
	}, 5);
}

function loadQuizResources(){
	console.log("loadQuizResources");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "quizres.html"));
	}, 5);
}

function loadDictionarySearch(text){

	console.log("loadDictionarySearch");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "dsearch.html?search="+text));
		//$('#title-img').hide();
	}, 5);
}

function loadSampleDictionary(){

	console.log("loadSampleDictionary");
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "dict.html"));
		//$('#title-img').hide();
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
		//$('#title-img').hide();
	}, 5);
}

function showChart(file){
	console.log("showChart: "+ file);
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + file+".html"));
		//$('#title-img').hide();
	}, 5);
}

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

function updateToolDescription(id){
	
	var toolMessage = $("#tool-description");
	if(id !== "topics_1" && id !== "topics_2"){
		$("#l-option+.tooltiptext").hide();
		toolMessage.empty();
	}
	if(id !== "alpha"){
		updateStates({"menu": "hidden"});
	}
	
	switch(id){
		case "info": 
		{
			toolMessage.html(states.info);
		}
		break;

		case "ss-support_1": 
		case "ss-support_2": 
		{
			toolMessage.html(states.ss_support);
		}
		break;
		
		case "speech_1": 
		case "speech_2": 
		{
			toolMessage.html(states.speech);
		}
		break;
		
		case "user": 
		{
			if(states.user === undefined || states.user === ''){
				toolMessage.html("You are not signed in.");
				singInUser();
			}
			else
				toolMessage.html("You are signed in as: "+ states.user);
		}
		break;
		
		case "alpha":
		{
			if(states.menu !== "visible"){
				updateStates({"menu": "visible"});
				var menuItems = {
					"Alphabets": "showChart(\'alpha\')",
					"Synonyms": "showChart(\'synonym\')",
					"Homonymn": "showChart(\'homonym\')",
					"Antonym": "showChart(\'antonym\')"
				};
				
				var menu = '<div class="tool-menu">';
				for (const [key, value] of Object.entries(menuItems)){
					menu = menu + '<span class="menuitem" onclick="'+value+';">'+key+'</span>';
				}
				menu = menu + '</div>';
				toolMessage.append(menu);
			}else{
				updateStates({"menu": "hidden"});
			}
		}
		break;
		
		case "l-option":
		{
			$("#l-option+.tooltiptext").toggle();
		}
		break;			
	}
}

function updateInitialStates(){
	updateStates({"ss_support": speech_synthesis_supportd ?
						"Speech Synthesis is supported by the browser!":
						"Speech Synthesis is NOT supported by the browser!"});
	updateStates({"speech": autoplay ?
						"Autoplay is now disabled!":
						"Autoplay is now enabled!"});
}

function checkBrowserSupport(){
	
	if(navigator){
		const userAgent = navigator.userAgent;
		console.log(userAgent);
		if (userAgent.includes("Edg") || userAgent.includes("Chrome")) {
			setTimeout(function(){$("#info").hide();},5);
		}else{
			updateStates({"info": "Best viewed in Chromium/Edge browser."});
			$("#info").show();
			updateToolDescription("info");
		}
	}
				
	var support = document.getElementById("support").innerHTML;
	if(support.startsWith("Hurray")){
		speech_synthesis_supportd = true;
		toggleAutoplay();
		updateInitialStates();
		$("#ss-support_1").hide();
		$("#ss-support_2").hide();
	}
	else{
		speech_synthesis_supportd = false;
	}	
}