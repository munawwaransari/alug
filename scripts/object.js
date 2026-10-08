//
//	Author: munawwar_ali@yahoo.com
//

function showObjectEffects(dataName){
	var container = $(".dictionary");
	container.html("Loading...");
	ensureDataLoaded({name: dataName})
	.then((data) => {
		container.empty();
		createSelectionFilters(container, data, dataName);
		data.every(function (objData) {
			addObjectEffectTable(container, objData);
			return true;
		});
	});
}

function addObjectEffectTable(container, objData){
	var id = makeId('pTable_',objData.name_en);
	var pTable = `
		<table id="${id}" class="pTable">
		<tr>
			<td style="background-color:#ACE892;">
			${objData.name_ar}
			${getPinIcon(id,' tbody:first',parent.document)}
			</td>
		</tr>`;
	
	if(objData["notes"]){
		pTable += `
			<tr>
			<td style="font-size:14px;background-color:#F6F6BA;">${objData["notes"]}</td>
			</tr>`;
	}
	
	if(objData["construct_ar"]){
		var div = '<div>';
		objData["construct_ar"].every(function(val, index){
			if(val.startsWith("script:")){
				div += eval(val.substring(7));
			}else{
				div += `<span>${val}</span>`;
				if(index < objData["construct_ar"].length - 1)
					div += `<span>${objData["construct_sep"]}</span>`;
			}
			return true;
		});
		pTable += `
		<tr>
			<td style="padding-top:8px;padding-bottom:8px;">${div}</td>
		</tr>`;
	}
	
	if(objData["construct_en"]){
		div = '<div class="engText">';
		objData["construct_en"].every(function(val, index){
			if(val.startsWith("script:")){
				div += eval(val.substring(7));
			}else{
				div += `<span>${val}</span>`;
				if(objData["construct_en"] && (index < objData["construct_en"].length - 1))
					div += `<span> ${objData["construct_sep"]} </span>`;
			}
			return true;
		});
		pTable += `
		<tr>
			<td style="padding-top:8px;padding-bottom:8px;">${div}</td>
		</tr>`
	}
	
	if(objData["examples"] && objData["construct_ar"]){	  
		if(objData["examples"]){
		pTable += `
			<tr>
				<td class="engText" 
					style="background-color:#CEF4C1;padding-top:2px;padding-bottom:8px;">
				Examples
				</td>
			</tr>`;
		}
		var div = `
			<div style="disaply:flex;flex-direction:column;align-content:center;width:100%;">`;
		objData["examples"].every(function(val, index){	  
			if(val.startsWith("script:")){
				div += eval(val.substring(7));
			}else{
				var ex =  val;
				if(objData["em"] && objData["em"][index]){
					var tk = objData["em"][index].split(",");
					tk.every(function(val){
						ex = ex.replaceAll(val, `<em>${val}</em>`);
					});
				}
				div += `<span>${replaceQLink(ex)}</span><br/>`;
			}
			return true;
		});		
		// Add Ai search link for more details
		var prompt = getPromptFromKey(['Object-Effects'], {'0': [objData.name_ar]}, true);
		div += `<a href="#" style="cursor:pointer;font-size: 14px;"
					onclick="openGoogleAISearch(\`${prompt}\`);">More</a>`;			
		div += '</div>';
		pTable += `
			<tr>
				<td style="padding-top:8px;padding-bottom:8px;"><div>${div}</td>
			</tr>`
	}
	
	if(objData["set"] && objData["construct_ar"]){
		objData["set"].every(function(val, index){
			pTable += objData["set_name"] !== "<skip>" ?
			`<tr>
					<td style="background-color:#F2F2B3;padding-top:8px;padding-bottom:8px;">
						${objData["set_name"] === undefined ? 
							`${objData["construct_ar"][index]}<br/>(${objData["construct_en"][index]})` : 
							objData["set_name"]}
					</td>
			</tr>`
			: '';
			var div = `
				<div style="disaply:flex;flex-direction:column;align-content:center;width:100%;">`;
			var setData_ar = val.split(",").filter(x=>x!=='');
			var setData_en = objData["set_en"];
			if(setData_en)
				setData_en = (objData["set_en"])[index].split(",").filter(x=>x!=='');		
			setData_ar.every(function(val2, i){
				div += `
				<span>
					${val2}
					${setData_en && setData_en[i] ? `<p class="engText">(${setData_en[i]})</p>`:'<p/>'}
					</span>
					${(index < setData_ar.length - 1) ? 
						'<span style="padding:10px;"></span>':''
					}
				`;
				return true;
			});
			div += '</div>';
			pTable += `
				<tr>
					<td style="padding-top:8px;padding-bottom:8px;">${div}</td>
				</tr>`;
			return true;
		});
	}
	
	pTable += '</table>';
	container.append($(pTable));
}

function createSelectionFilters(container, data, dataAction){
	var sel = `
	<select class="pronounFilter" 
			onchange="filterObjectEffectView(event && event.target ? event.target.value: undefined);">
	<option value="all">Show All</option>
	${
		data.map(function(obj){
			var v = makeId('', obj.name_en);
			return '<option value="'+v+'">'+obj.name_ar+' ( '+obj.name_en+' )'+'</option>';
		}).join('')
	}
	</select>`;
	container.append($(getListButtinWithSelect(sel, 'pronounFilter', dataAction)));
	filterObjectEffectView();
}

function filterObjectEffectView(value){
	var val = value ?? $(".pronounFilter").val();
	var lstButton = $(".nFilterBtn");
	var lst = $(".pronounFilter");
	if(val == 'all'){
		$('.pTable tr').show();
	}else{
		$('.pTable tr').hide();
		var t = $("#pTable_"+val);
		t.remove();
		lstButton.remove();
		lst.remove();
		$(".dictionary").prepend(t);
		$(".dictionary").prepend(lstButton);
		$(".dictionary").prepend(lst);
		$("#pTable_"+val+' tr').show();
	}
	lstButton.css('width', lst.css('width'));
}

function makeId(prefix, txt){
	return prefix + txt.replaceAll(')','').replaceAll('(','').replaceAll(' ', '_');
}

function getAdjectivePatternPairingTable(){
 return `
 	<table style="width:100%;direction:rtl;font-size:14pt;">
		<tbody>
		<tr><th>Category</th><th>مُذكّر</th><th>مُؤنّث</th><th>Meaning</th></tr>
		<tr><td rowspan="3" style="font-size:16px">الصِّفَةُ<br/>المُشَبَّهَةُ</td><td>فَعْلَانُ</td><td>فَعْلَى</td><td style="font-size:14px">Fullness<br/>emptiness<br/>acute emotion</td></tr>
		<tr><td>أَفْعَلُ</td><td>فَعْلَاءُ</td><td style="font-size:14px">Defects<br/>Beauties<br/>Pigments</td></tr>
		<tr><td>فَعِلٌ</td><td>فَعِلَةٌ</td><td style="font-size:14px">Joy<br/>Grief<br/>Immediate worry</td></tr>
		<tr><td style="font-size:16px">التَّفْضِيل<br/>اِسْمُ</td><td>أَفْعَلُ</td><td>فُعْلَى</td><td style="font-size:14px">Elative<br/>Superlative</td></tr>
		<tr><td rowspan="3" style="font-size:16px">الصِّفَةُ<br/>المُشَبَّهَةُ</td><td>فَعِيلٌ</td><td>فَعِيلَةٌ</td><td style="font-size:14px">Permanent physical<br/>moral attributes</td></tr>
		<tr><td>فَعْلٌ</td><td>فَعْلَةٌ</td><td style="font-size:14px">Vices<br/>virtues<br/>core disposition</td></tr>
		<tr><td>فُعَالٌ</td><td>فُعَالَةٌ</td><td style="font-size:14px">Core temperaments<br/>or builds</td></tr>
		</tbody>
	</table>
`;
}

function getAdjectivePatternPairingExample(){
	return `
 	<table style="width:100%;direction:rtl;font-size:14pt;">
		<tbody>
		<tr><th>مُذكّر</th><th>مُؤنّث</th><th>Meaning</th></tr>
		<tr><td>عَطْشَانُ</td><td>عَطْشَى</td><td style="font-size:14px">Thirsty</td></tr>
		<tr><td>غَضْبَانُ</td><td>غَضْبَى</td><td style="font-size:14px">Angry</td></tr>
		<tr><td>جَوْعَان</td><td>جَوْعَي</td><td style="font-size:14px">Hungry</td></tr>
		<tr><td>أَحْمَرُ</td><td>حَمْرَاءُ</td><td style="font-size:14px">Red</td></tr>
		<tr><td>أَعْرَجُ</td><td>عرْجَاءُ</td><td style="font-size:14px">Lame</td></tr>
		<tr><td>أَصْلَعُ</td><td>صَلعاء</td><td style="font-size:14px">Bald</td></tr>
		<tr><td>فَرِحٌ</td><td>فَرِحَةٌ</td><td style="font-size:14px">Joyfull</td></tr>
		<tr><td>قَلِقٌ</td><td>قَلِقَةٌ</td><td style="font-size:14px">Anxious</td></tr>
		<tr><td>نَدمٌ</td><td>نَدِمَة</td><td style="font-size:14px">Regretful</td></tr>
		<tr><td>أَكْبَرُ</td><td>كُبْرَى</td><td style="font-size:14px">Biggest</td></tr>
		<tr><td>أَصْغَرُ</td><td>صُغْرَى</td><td style="font-size:14px">Smallest</td></tr>
		<tr><td>أَدْنَى</td><td>دُنْيَا</td><td style="font-size:14px">Lowest</td></tr>
		<tr><td>كَرِيمٌ</td><td>كَرِيمَةٌ</td><td style="font-size:14px">Generous</td></tr>
		<tr><td>جَمِيلٌ</td><td>جَمِيلَةٌ</td><td style="font-size:14px">Beautiful</td></tr>
		<tr><td>عَظِيم</td><td>عَظِيمَةٌ</td><td style="font-size:14px">Magnificent</td></tr>
		<tr><td>شَهْمٌ</td><td>شَهْمَةٌ</td><td style="font-size:14px">Gallant</td></tr>
		<tr><td>صَعْبٌ</td><td>صَعْبَةٌ</td><td style="font-size:14px">Difficult</td></tr>
		<tr><td>صَخرٌ</td><td>صَخْرَةٌ</td><td style="font-size:14px">Rock</td></tr>
		<tr><td>شُجَاعٌ</td><td>شُجَاعَةٌ</td><td style="font-size:14px">Courageous</td></tr>
		<tr><td>قُمَام</td><td>قُمَامَةٌ</td><td style="font-size:14px">Garbage</td></tr>
		<tr><td>خُلَاص</td><td>خُلَاصَة</td><td style="font-size:14px">Summary</td></tr>
		</tbody>
	</table>
	`;
}
