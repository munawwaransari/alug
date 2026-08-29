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

function hsearch(txt, page=1){

	var limit = 10;
	var collection = $("#hadith-options").val();
	var text = txt ?? $("#hsearchText").val().trim();
	if(text){
		var container = $("#hsearchResult .container");		
		container.html("<br/>Loading....");
		var searchUri = `https://ummahapi.com/api/hadith/search?q=${text}&collection=${collection}&limit=${limit}&page=${page}`;
		loadJsonData(searchUri)
		.then((data)=>{
			//update nav
			loadHadithResults(container, data.data, collection, page, text);
		})
		.catch((err)=>{
			container.html(`<p style="color:red>${err}</b>`);
		});
	}
}

function loadHadithResults(container, res, col, page, txt){
	if(res && res.hadiths){

		var nav = $("#hsearchResult .nav");
		nav.empty();
		container.empty();
		var navHtml= `<br/><span>Page ${page} of ${res.total_found}</span>`;
		if(res.total_found > res.limit){
			navHtml += `&nbsp;<span><a href="#" onclick="hsearch('${txt}', ${page+1})">Next Page</a></span>`;
		}
		nav.html(navHtml);

		res.hadiths.every((h)=>{
			var hdiv=`
			<div class="hadithDiv" id="${h.id}">
				<div>${h.english}</div>
				<div>${h.arabic}</div>
				<div><!--<a href="#" onclick="openExternalhadithLink('${col}',${h.hadithnumber})">-->
				[${h.collection_name} #${h.hadithnumber}]
				<!--</a>-->
				</div>
			</div>`;
			container.append($(hdiv));
			return true;
		});
	}
}

function openExternalhadithLink(collection, number){	
	var link = `https://sunnah.com/${collection}/${number}`;
	var w = parent.window ? parent.window : window;
	w.open(link, '_blank');
}