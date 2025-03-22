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

	addComparisionList(container, inp, verbCompare){
		var api = this;
		container.empty();
		var sel = '<select class="nFilter" onchange="loadComparision()">';
		var first = null, index = 0, indexValue = inp;
		cmpAPI.cmpData.map(function(cEntry){
			
			if ((verbCompare && cEntry.isVerbComparison) || (!verbCompare && cEntry.isVerbComparison === undefined)){
				var val = cEntry["topics"].join(' vs ');
				var selected = index === indexValue ? ' selected ' : '';
				sel += '<option value="'+val+'" '+selected+'><b>'+val+'</b></option>';
				if(index === indexValue)
					first = val;
				index=index+1;
			}
		});
		if(first === null && cmpAPI.cmpData.length > 0){
			first = cmpAPI.cmpData["topics"].join(' vs ')
		}

		container.prepend($(sel+'</select>'));
		if(verbCompare){
			container.prepend($('<p style="margin:auto;padding:0;"><br/>'+
									'<label id="cmpLabel">Compare</label>'+
									'<input type="Checkbox" onchange="handleCompareCheck()">'+
								'</p>'));
		}
		api.addComparisionTable("."+container[0].className, first);
	}
	
	addComparisionTable(containerClass, sel, verbCompare){
		var api = this;
		
		var compare = $(containerClass + " p:first");
		var nfilter = $(containerClass + " .nFilter");
		$(containerClass).empty();
		if(compare.length > 0){
			$(containerClass).append(compare);
		}
		$(containerClass).append(nfilter);
		$(containerClass).append('<div style="height:10px;"></div>');
		
		var selArray = (verbCompare && verbCompare !== sel) ? [sel, verbCompare] : [sel];
				
		var compTable = '', compTableCol1, compTableCol2;
		if(selArray.length > 1){
			compTable = '<table id="cmpTable" style="display:flex;padding:0;margin:0;border-collapse:collapse;align:top;"><tr>'+
							'<td style="align-content:flex-start;padding:0;margin:0;border-color: transparent;border-bottom-style: hidden;border-right-style: hidden;border-left-style: hidden;"></td>'+
							'<td style="align-content:flex-start;padding:0;margin:0;border-color: transparent;border-bottom-style: hidden;border-right-style: hidden;border-left-style: hidden;"></td>'+
						'</tr></table>';
			$(containerClass).append($(compTable));
			compTableCol1 = $("#cmpTable tr td:first()");
			compTableCol2 = $("#cmpTable tr td:last()");
		}	
		
		
		selArray.every(function(sel1, index){
			var id = selArray.length > 1 ? index+1 : '';
			sel = sel1;
			
			var topics = sel.split(" vs ");
			var tableHtml = '<table id="xTable'+id+'" class="pTable"><tr>';
			var tableHeaders = "";
			for(var i=0; i < topics.length; i++)				 
				tableHeaders += '<th style="font-size: 22px;">'+topics[i]+'</th>';
			tableHtml += tableHeaders+'</table>';
			
			if(id === '')
				$(containerClass).append($(tableHtml));
			else{
				if(index === 0)
					compTableCol1.append($(tableHtml));
				else
					compTableCol2.append($(tableHtml));
			}
			
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
					var topic = topics[i];
					rows += '<td>'+replaceQLink(cmp["features"][topic][f])+'</td>';	
				}
				rows += '</tr>';
			}
			
			$('#xTable'+id+' tbody').append($(rows));
		
			return true;
		});
	}
}