//
//	Author: munawwar_ali@yahoo.com
//

var objectEffectsData;

function showObjectEffects(k, v1, v2){
	updateState(k, {ar: v1, en: v2});
	var container = $(".dictionary");
	container.html("Loading...");
	if(objectEffectsData === undefined){
		var loc = getLocationPath() + "data/grmr/objecteffects.json";
		loadJsonData(loc, function(data){
			objectEffectsData = data;
			showObjectEffectTable();
		});
	}else{
		showObjectEffectTable();
	}
}

function showObjectEffectTable(){
	var container = $(".dictionary");
	container.empty();
	
	if(!objectEffectsData || objectEffectsData.length == 0)
		return;
	
	createSelectionFilters(container, objectEffectsData);
	
	objectEffectsData.every(function(objData){
		addObjectEffectTable(container, objData);
		return true;
	});
}

function addObjectEffectTable(container, objData){
	var id = makeId('pTable_',objData.name_en);
	var pTable = '<table id="'+id+'" class="pTable"><tr><td>'+objData.name_ar+'</td></tr>';
	
	if(objData["notes"]){
		pTable += '<tr><td style="font-size:14px;background-color:#F6F6BA;"">'+
				  objData["notes"]+
				  '</td></tr>';
	}
	
	if(objData["construct_ar"]){
		var div = '<div>';
		objData["construct_ar"].every(function(val, index){
			div += '<span>'+val+'</span>';
			if(index < objData["construct_ar"].length - 1)
				div += '<span> '+objData["construct_sep"]+' </span>';
			return true;
		});
		pTable += '<tr><td style="padding-top:8px;padding-bottom:8px;">'+div+'</td></tr>'
	}
	
	if(objData["construct_en"]){
		div = '<div class="engText">';
		objData["construct_en"].every(function(val, index){
			div += '<span>'+val+'</span>';
			if(index < objData["construct_en"].length - 1)
				div += '<span> '+objData["construct_sep"]+' </span>';
			return true;
		});
		pTable += '<tr><td style="padding-top:8px;padding-bottom:8px;">'+div+'</td></tr>'
	}
	
	if(objData["examples"] && objData["construct_ar"]){	  
		pTable += '<tr><td class="engText" style="background-color:#CEF4C1;padding-top:2px;padding-bottom:8px;">'+
				  ' Examples '
				  '</td></tr>';
		var div = '<div style="disaply:flex;flex-direction:column;align-content:center;width:100%;">';
		objData["examples"].every(function(val, index){	  
			var ex =  val;
			if(objData["em"] && objData["em"][index]){
				var tk = objData["em"][index].split(",");
				tk.every(function(val){
					ex = ex.replaceAll(val, '<em>'+val+'</em>');
				});
			}
			div += '<span>'+replaceQLink(ex)+'</span><br/>';
			return true;
		});					
		div += '</div>';
		pTable += '<tr><td style="padding-top:8px;padding-bottom:8px;"><div>'+div+'</td></tr>'
	}
	
	if(objData["set"] && objData["construct_ar"]){
		objData["set"].every(function(val, index){
			pTable += '<tr><td style="background-color:#F2F2B3;padding-top:8px;padding-bottom:8px;">'+
						objData["construct_ar"][index]+
					  '</td></tr>'
			var div = '<div style="disaply:flex;flex-direction:column;align-content:center;width:100%;">';
			var setData_ar = val.split(",").filter(x=>x!=='');
			var setData_en = (objData["set_en"])[index].split(",").filter(x=>x!=='');
			
			setData_ar.every(function(val2, i){
				div += '<span>'+val2+'<p class="engText">('+setData_en[i]+')</p></span>';
				if(index < setData_en.length - 1)
					div += '<span style="padding:10px;"></span>';
				return true;
			});
			div += '</div>';
			pTable += '<tr><td style="padding-top:8px;padding-bottom:8px;"><div>'+div+'</td></tr>'
			return true;
		});
	}
	
	pTable += '</table>';
	container.append($(pTable));
}

function createSelectionFilters(container, data){
	var sel = '<select class="pronounFilter" '+ 
					' onchange="filterObjectEffectView(event && event.target ? event.target.value: undefined);">';
	sel +=	'<option value="all">Show All</option>';
	data.every(function(obj){
		var v = makeId('', obj.name_en);
		sel += '<option value="'+v+'">'+obj.name_ar+' ( '+obj.name_en+' )'+'</option>';
		return true;
	});
	sel += '</select>';
	container.append($(sel));
}

function filterObjectEffectView(value){
	var val = value ?? $(".pronounFilter").val();
	if(val == 'all'){
		$('.pTable tr').show();
	}else{
		$('.pTable tr').hide();
		var t = $("#pTable_"+val);
		t.remove();
		var lst = $(".pronounFilter");
		lst.remove();
		$(".dictionary").prepend(t);
		$(".dictionary").prepend(lst);
		$("#pTable_"+val+' tr').show();
	}
}

function makeId(prefix, txt){
	return prefix + txt.replaceAll(')','').replaceAll('(','').replaceAll(' ', '_');
}