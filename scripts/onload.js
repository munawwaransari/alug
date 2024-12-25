//
//	Author: munawwar_ali@yahoo.com
//

$(document).ready(function()
{
	if(isOS("Android")){
		setTimeout(function(){
			if(speechSynthesis.onvoiceschanged)
				speechSynthesis.onvoiceschanged();
		}, 10);
	}
	
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
			
			/*
			var c = "";
			var o = $("#languages option");
			if(o && o.length > 0){
				o.each(function(i, opt){
					c = c + opt.value + ", ";
				});
			}
			alert(c);
			*/
			
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

function loadLanguages(){
	var l = $("#languages");
	l.empty();
	/*
	if(l.length == 0)
		$("#main").append('<select id="languages"/>');
	var voices = speechSynthesis.getVoices().filter(function(v){
		var lang = v.lang.replace('_','-');
		var flag = lang === 'ur-IN' || lang ==='ur-PK' || lang === 'ur-IN' ||
				   lang === 'ar-SA' || 
				   lang === 'en-US';
		if(flag){
			$("#main #languages").append($('<option value="'+ lang + '" select>'+v.name+'</option>'))
		}
		return flag;
	});
	$(document).trigger("nodeInserted",['#languages']);
	*/
	const event = new Event('onvoiceloaded');
	document.dispatchEvent(event);
};

			
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

function showClock(){
	console.log("showChart: "+ name);
	$('.reading-pane').attr("src","");
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() + "clock.html"));
	}, 5);
}

function showChart(sel){
	var name = $('#sel'+sel).val();
	console.log("showChart: "+ name);
	$('.reading-pane').attr("src","");
	var path = "";
	switch (sel){
		case "Vocabulary": path = 'cards.html?data='+name; break;
		case "Misc": path = name+'.html'; break;
		default: console.log('Error: invalid section');	return;
	}
	setTimeout(function(){
		$('.reading-pane').attr('src', encodeURI(getLocationPath() +  path));
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
					"Vocabulary": {
						"Alphabets": "alpha",
						"Synonyms": "synonym",
						"Homonymn": "homonym",
						"Antonym": "antonym",
						"Colors": "colors"
					},
					"Misc" :{
						"Clock": "clock",
						"Calendar": "calendar",
						"Number": "number",
						"Patterns": "patterns"
					}
				};
				
				var menu = '<div class="tool-menu">';
				for (const [key, value] of Object.entries(menuItems)){
					var type = Object.prototype.toString.call(value);
					if(type === "[object String]")
						menu = menu + '<span class="menuitem" onclick="'+value+';">'+key+'</span>';
					else{
						var onAction = 'showChart(\''+key+'\')';
						menu += '<span class="menuitem" onclick="'+onAction+'">'+
							key+':<select id="sel'+key+'" ' +
									' onchange="'+onAction+'">';
						for(const [k,v]of Object.entries(value))
							menu += '<option value="'+v+'">'+k+'</option>';
						menu += '</select></span>';
						$("#selVocab").val('Alphabets');
						setTimeout(function(){
							showChart('Vocabulary');
						},10);
					}
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

function autoplayAudio(chapter, page){
	var lang = parent ? parent.getLangOption() : "en-US";
	var url = getLocationPath() + 'data/audio/'+ lang + '_' + chapter + '_autoplay.json';
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
			
			if(autoplay)
				$("#play").click();
		}
	}, function(err){
		console.log("Please change language option and retry!");
	});
}