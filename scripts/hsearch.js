//
//	Author: munawwar_ali@yahoo.com
//

var last_Hadith_Result = {};
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

function hsearch(txt){

	var limit = 10;
	var collection = $("#hadith-options").val();
	var text = txt ?? $("#hsearchText").val().trim();
	if(text){
		
		// Reuse last search
		if(last_Hadith_Result[collection] &&
		   last_Hadith_Result[collection].searchText == text)
		{
			loadHadithResults(0, collection);
			return;
		}

		last_Hadith_Result[collection] = undefined;
		var container = $("#hsearchResult .container");		
		container.html("<br/>Loading....");
		var searchUri = `https://ummahapi.com/api/hadith/search?q=${text}&collection=${collection}&limit=${limit}`;
		loadJsonData(searchUri)
		.then((data)=>{
			//update nav
			if(data.data && data.data.total_found == 0){
				container.html(`<br/><p>No hadith found mathcing the text '${text}'</b>`);
			}else{
				last_Hadith_Result.lastCollection = collection;
				last_Hadith_Result[collection] = {
					index: 0,
					searchText: text,
					data: data.data
				};
				loadHadithResults(0, collection);
			}
		})
		.catch((err)=>{
			container.html(`<p style="color:red>${err}</b>`);
		});
	}
}

function loadHadithResults(i, col){
	var res = last_Hadith_Result[col];
	var index = res.index + i;
	if(index < 0 || index >= res.data.total_found){
		return;
	}

	// Update Nav
	var nav = $("#hsearchResult .nav");
	nav.html(`<br/>
	<div style="padding:10px;background-color:#9DBF6C;">
			<b>
			<a href="#" onclick="loadHadithResults(-1, '${col}')">Prev</a>&nbsp;&nbsp;
			<span>Hadith ${index+1} of ${res.data.total_found}</span>&nbsp;&nbsp;
			<a href="#" onclick="loadHadithResults(+1, '${col}')">Next</a>&nbsp;&nbsp;
			</b>
	</div>`);

	// Update hadith
	var container = $("#hsearchResult .container");
	var h = res.data.hadiths[index];
	if(h.em == undefined){
		h.em = 'em';
		h.english = h.english.replaceAll(res.searchText, `<em>${res.searchText}</em>`); 
	}
	container.html(`
	<div class="hadithDiv" id="${h.id}">
		<div style="width: 100%; padding:10px;">
		<a href="#" onclick="openExternalhadithLink('${col}',${h.hadithnumber})">
		[${h.collection_name} Hadith # ${h.hadithnumber}]
		</a></div>
		<div style="padding:10px;background-color:#F6F0c2;">${h.english}</div>
		<div style="padding:10px;background-color:#E8EEF4;">${h.arabic}</div>
	</div>`);
	res.index = index;
}

function openExternalhadithLink(collection, number){
	var link = `https://sunnah.com/search?q=${number}&collection[0]=${collection}`;
	var w = parent.window ? parent.window : window;
	w.open(link, '_blank');
}