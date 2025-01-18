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

	addComparisionList(container, inp){
		var api = this;
		container.empty();
		var sel = '<select class="nFilter" onchange="loadComparision()">';
		var first = null, index = 0, indexValue = inp;
		cmpAPI.cmpData.map(function(cEntry){
			var val = cEntry["topics"].join(' vs ');
			sel += '<option value="'+val+'"><b>'+val+'</b></option>';
			if(index === indexValue)
				first = val;
			index=index+1;
		});
		if(first === null && cmpAPI.cmpData.length > 0){
			first = cmpAPI.cmpData["topics"].join(' vs ')
		}
		container.prepend($(sel+'</select>'));
		api.addComparisionTable("."+container[0].className, first);
	}
	
	addComparisionTable(containerClass, sel){
		var api = this;
		
		var nfilter = $(containerClass + " .nFilter");
		$(containerClass).empty();
		$(containerClass).append(nfilter);
		$(containerClass).append('<div style="height:10px;"></div>');
		
				
		var topics = sel.split(" vs ");
		var tableHtml = '<table id="xTable" class="pTable"><tr>';
		var tableHeaders = "";
		for(var i=0; i < topics.length; i++)				 
			tableHeaders += '<th style="font-size: 22px;">'+topics[i]+'</th>';
		tableHtml += tableHeaders+'</table>';
		
		$(containerClass).append($(tableHtml));
		
		//table = $(containerClass+ " #Table");
		var cmp = cmpAPI.cmpData.filter(x=>x["topics"].join(' vs ') === sel)[0];
		
		if(cmp["notes"]){
			var r = $('<tr><td style="font-size:14px;background-color:#F6F6BA;" colspan="'+topics.length+'">'+replaceQLink(cmp["notes"])+'</td></tr>');
			$("#xTable tbody").append(r);
		}
		var alink = '<a href="#" style=" text-decoration: none" '+
						' onclick="checkWord(\'$\');">$</a>';
						
		var featureCount = cmp["ar"].length;
		var rows = "";
		for(var f=0; f < featureCount; f++){
			rows += '<tr><td style="font-weight:bold;font-size:14px;background-color:#D2ECAD;" colspan="'+topics.length+'">'+'(' + cmp["ar"][f]+') '+cmp["en"][f]+'</td></tr>'+
					'<tr>';
			for(var i=0; i < topics.length; i++){
				rows += '<td>'+replaceQLink(cmp["features"][topics[i]][f])+'</td>';	
			}
			rows += '</tr>';
		}
		$("#xTable tbody").append($(rows));
	}
}