//
//	Author: munawwar_ali@yahoo.com
//

window.onload = function(){
	
	$("#hd-loading").show();
	$("#hsearchText").keyup(function(event) {
		if (event.keyCode === 13) {
			$("#hSearch").click();
		}
	});
	
	if(isOS('Android')){
		$("img[src='images/kybd.jpg']").hide();
	}
	
	window.addEventListener("contextmenu", e =>
	{
	  e.preventDefault();
	});
	
	var langParam = decodeURI(getParamValue("lang"));
	if(langParam && langParam != 'undefined' && ( langParam ==='ar' || langParam ==='ur' || langParam ==='en') ){
		lang = langParam;
	}
	
	ensureDataLoaded({ name: "hadith-collecions" }).then((data) => {
		loadHadithCollections(data.data.collections);
		$("#hd-loading").hide();

		var collection = decodeURI(getParamValue("book"));	
		if(collection && collection != 'undefined'){
			$("#hadith-options").val(collection);
		}

		var searchVal = decodeURI(getParamValue("search"));	
		if(searchVal && searchVal != 'undefined'){
			hsearch(searchVal);
		}
		else if (parent && parent.states.lastHSearch){
			hsearch(parent.states.lastHSearch);
		}	
	});		
};

function loadHadithCollections(data){
	var sel = $("#hadith-options");
	data.every((item)=>{
		sel.append($('<option>', {
			value: item.key,
			text: `${item.name} (${item.arabic_name})`
		}));
		return true;
	});
}

function loadHadithResults(container, res){
	if(res && res.hadiths){
		res.hadiths.every((h)=>{

			var hdiv=`
			<div class="hadithDiv" id="${h.id}">
				<div>${h.english}</div>
				<div>${h.arabic}</div>
				<div>[${h.collection_name} #${h.hadithnumber}]</div>
			</div>`;
			container.append($(hdiv));
			return true;
		});
	}
}

function hsearch(txt){

	var limit = 10;
	var collection = $("#hadith-options").val();
	var text = txt ?? $("#hsearchText").val().trim();
	if(text){
		var container = $("#hsearchResult");
		container.html("<br/>Loading....");
		var searchUri = `https://ummahapi.com/api/hadith/search?q=${text}&collection=${collection}&limit=${limit}`;
		loadJsonData(searchUri)
		.then((data)=>{
			//$("#hsearchResult").html(JSON.stringify(data.data));
			container.html("<br/>");
			loadHadithResults(container, data.data);
		})
		.catch((err)=>{
			container.html(`<p style="color:red>${err}</b>`);
		});
	}
}