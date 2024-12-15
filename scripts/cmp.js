//
//	Author: munawwar_ali@yahoo.com
//

class cmpAPI {
	
	static cmpData = [];
	constructor(path, callback)
	{
		var cb = callback;
		var cmpUrl = path+'data/grmr/cmp.json'
		loadJsonData(cmpUrl, function(data){
			cmpAPI.cmpData = data;
			if(cb) cb("loaded");
		}, function(err){
			if(cb) cb("error", err);
		});	
	}

	addComparisionList(container){
		var api = this;
		container.empty();
		var sel = '<select class="nFilter" onchange="loadComparision()">';
		var first = null;
		cmpAPI.cmpData.map(function(cEntry){
			var val = cEntry["topics"].join(' vs ');
			sel += '<option value="'+val+'"><b>'+val+'</b></option>';
			if(first === null)
				first = val;
		});
		container.prepend($(sel+'</select>'));
		api.addComparisionTable("."+container[0].className, first);
	}
	
	addComparisionTable(containerClass, sel){
		var api = this;
		var table = $(containerClass+ " table");
		if(table) table.empty();
		
		var topics = sel.split(" vs ");
		var tableHtml = '<table id="xTable" class="pTable"><tr>'+
						 '<th style="font-size: 22px;">Topic</th>';
		for(var i=0; i < topics.length; i++)				 
			tableHtml += '<th style="font-size: 22px;">'+topics[i]+'</th>';
		tableHtml +='</table>';
		$(containerClass).append($(tableHtml));
		
		table = $(containerClass+ " table");
		var cmp = cmpAPI.cmpData.filter(x=>x["topics"].join(' vs ') === sel)[0];
		
		//var alink = '<a href="#" style=" text-decoration: none" '+
		//				' onclick="checkWord(\'$\');">$</a>';
						
		var featureCount = cmp["ar"].length;
		var rows = "";
		for(var f=0; f < featureCount; f++){
			rows += '<tr><td>'+cmp["ar"][f]+'<br/>'+cmp["en"][f]+'</td>';
			for(var i=0; i < topics.length; i++){
				rows += '<td>'+cmp["features"][topics[i]][f]+'</td>';	
			}
			rows += '</tr>';
		}
		$(containerClass+ " #xTable tbody").append($(rows));
	}
}