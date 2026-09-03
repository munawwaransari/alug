//
//	Author: munawwar_ali@yahoo.com
//

class cmpAPI {
	
	static cmpData = [];
	constructor(path, callback)
	{
		var cb = callback;
		ensureDataLoaded({name: "cmpData"})
		.then((data, isFromCache) => {
				cmpAPI.cmpData = data;
				if(cb) cb("loaded", false, isFromCache);
			},
			(err) => {
				if(cb) cb("error", err);
			}
		);
	}

	addComparisionList(container, inp, showComparison, compareType){
		var api = this;
		var first = null, index = 0, indexValue = inp;
		var sel = `
		<select class="nFilter" 
			onchange="updateStateIndex(this);loadComparision()">
		${
			cmpAPI.cmpData.map(
				function(cEntry){
					if ((showComparison && cEntry.compareType === compareType) || 
						(!showComparison && cEntry.compareType === undefined)){
						var val = cEntry["topics"].join(' vs ');
						var selected = index === indexValue ? ' selected ' : '';
						if(index === indexValue)
							first = val;
						index=index+1;
						return `<option value="${val}" ${selected}>${val}</option>`;
					}
				}).join('')
		}
		</select>`;

		if(first === null && cmpAPI.cmpData.length > 0){
			first = cmpAPI.cmpData["topics"]?.join(' vs ')
		}

		container.empty();
		container.prepend(getListButtinWithSelect(
			sel+'</select>', 
			'nFilter',
			compareType));

		if(showComparison){
			container.prepend($(`<p style="margin:auto;padding:0;"><br/>
									<label id="cmpLabel">Compare</label>
									<input type="Checkbox" onchange="handleCompareCheck()">
								 </p>`));
		}
		api.addComparisionTable("."+container[0].className, first);
	}
	
	addComparisionTable(containerClass, sel, firstTopic){
		var api = this;
		
		var compare = $(containerClass + " p:first");
		var nfilter = $(containerClass + " .nFilter");
		var nFilterButton = $(containerClass + " .nFilterBtn");
		nFilterButton.css('width', nfilter.css('width'));
		$(containerClass).empty();
		if(compare.length > 0){
			$(containerClass).append(compare);
		}
		$(containerClass).append(nfilter);
		$(containerClass).append(nFilterButton);
		$(containerClass).append('<div style="height:10px;"></div>');
		
		var selArray = (firstTopic && firstTopic !== sel) ? [sel, firstTopic] : [sel];
				
		var compTable = '', compTableCol1, compTableCol2;
		if(selArray.length > 1){
			compTable = `
			<table id="cmpTable" style="display:flex;padding:0;margin:auto;border-collapse:collapse;align:top;">
				<tr>
					<td style="width:50%;align-content:flex-start;padding:0;margin:0;border-color: transparent;border-bottom-style: hidden;border-right-style: hidden;border-left-style: hidden;"></td>
					<td style="width:50%;align-content:flex-start;padding:0;margin:0;border-color: transparent;border-bottom-style: hidden;border-right-style: hidden;border-left-style: hidden;"></td>
				</tr>
			</table>`;
			$(containerClass).append($(compTable));
			compTableCol1 = $("#cmpTable tr td:first()");
			compTableCol2 = $("#cmpTable tr td:last()");
		}	
		
		selArray.every(function(sel1, index){
			var id = selArray.length > 1 ? index+1 : '';
			sel = sel1;

			var topics = sel.split(" vs ");
			var tableHtml = `<table id="xTable${id}" class="pTable"><tr>`;
			var tableHeaders = "";
			for(var i=0; i < topics.length; i++)				 
				tableHeaders += `<th style="font-size: 22px;">${topics[i]}</th>`;
			tableHtml += tableHeaders+'</table>';
			
			if(id === '')
				$(containerClass).append($(tableHtml));
			else{
				if(index === 0)
					compTableCol1.append($(tableHtml));
				else
					compTableCol2.append($(tableHtml));
			}
			
			var cmp = cmpAPI.cmpData.filter(x=>x["topics"].join(' vs ') === sel)[0];
			
			// Add AI Prompt
			if(cmp["skipai"] == undefined){
				$("#xTable tbody").append(`
				<tr>
					<td colspan="${topics.length}" style="font-size: 16px;">
						<a href="#" onclick="
						var prompts = getPromptFromKey (
							['Topics'], 
							{'0':[
								'${parent.window.getLang()}', 
								[${topics.map(t => `\'${t}\'`).join(",")}], 
								'${cmp['en']}'
							]}
						);
						openGoogleAISearch(prompts[0]);">
						Google ai search
						</a>
						${getPinIcon('xTable',' tbody:first',parent.document)}
					</td>
				</tr>`);
			}
			
			// Add notes
			if(cmp["notes"]){
				var r = $(`<tr><td style="font-size:14px;background-color:#F6F6BA;" colspan="${topics.length}">${replaceQLink(cmp["notes"])}</td></tr>`);
				$("#xTable tbody").append(r);
			}
			var alink = `<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
							
			var featureCount = cmp["ar"].length;
			var rows = "";
			for(var f=0; f < featureCount; f++){
				rows += `<tr><td style="font-weight:bold;font-size:14px;background-color:#D2ECAD;" colspan="${topics.length}">
							( ${cmp["ar"][f]} ) ${cmp["en"][f]}
						</td></tr>
						<tr>
						${
							topics.map((topic) => {
								if(cmp["features_links"]){
									var res = cmp["features"][topic][f];
									Object.keys(cmp["features_links"]).every((key)=>{
										res = res.replace(key, `<a href="#" onclick="parent.redirect(${cmp["features_links"][key]});">${key}</a>`);
										return true;
									});
									return `<td>${replaceQLink(res)}</td>`;
								}else{
									return `<td>${replaceQLink(cmp["features"][topic][f])}</td>`
								}
							})
						}
						</tr>`;
			}
			
			$('#xTable'+id+' tbody').append($(rows));		
			return true;
		});
	}
}