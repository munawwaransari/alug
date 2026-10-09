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
	
	if(objData["alternate_ar"] !== undefined){	
		pTable += objData["alternate_ar"] !== '' ? `
		<tr>
			<td style="padding-top:8px;padding-bottom:8px;">${objData["alternate_ar"]}</td>
		</tr>`:'';
	}
	else if(objData["construct_ar"]){
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
	
	if(objData["alternate_en"] !== undefined){	
		pTable += objData["alternate_en"] !== '' ? `
		<tr>
			<td style="padding-top:8px;padding-bottom:8px;">${objData["alternate_en"]}</td>
		</tr>`: '';
	}
	else if(objData["construct_en"]){
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

function alink(text, args){
	return `<a href="#" 
	onclick="parent.redirect('${args.page}','${args.action}','${args.data}')">
	${text}
	</a>`;
}
function getAdjectivePatternPairingTable(){
 return `
 	<table style="width:100%;direction:rtl;font-size:14pt;">
		<tbody>
		<tr><td rowspan="3" style="font-size:16px">${alink("الصفات الأساسية<br/>Core Attributes",{page: "dict.html", action:"adj", data:"pos:2"})}</td>
		    <td>فَعْلٌ</td><td>فَعْلَةٌ</td><td style="font-size:14px">Vices<br/>virtues<br/>core disposition</td></tr>
		<tr><td>فُعَالٌ</td><td>فُعَالَةٌ</td><td style="font-size:14px">Core temperaments<br/>or builds</td></tr>
		<tr><td>فَعِيلٌ</td><td>فَعِيلَةٌ</td><td style="font-size:14px">Permanent physical<br/>moral attributes</td></tr>
		<tr><td style="font-size:16px">${alink("والعيوب<br/>الألوان",{page: "dict.html", action:"adj", data:"pos:3"})}</td>
		    <td>أَفْعَلُ</td><td>فَعْلَاءُ</td><td style="font-size:14px">Defects<br/>Beauties<br/>Pigments</td></tr>
		<tr><td rowspan="2" style="font-size:16px">${alink("اِسْمُ التَّفْضِيل<br/>or<br/>مبالغة",{page: "dict.html", action:"adj", data:"pos:4"})}</td>
		    <td>أَفْعَلُ</td><td>فُعْلَى</td><td style="font-size:14px">Elative<br/>Superlative</td></tr>
		<tr><td>فَعُول</td><td>فَعُولَة</td><td style="font-size:14px">Frequent<br/>intense<br/>habitual action</td></tr>
		<tr><td rowspan="3" style="font-size:16px">${alink("الصِّفَةُ<br/>المُشَبَّهَةُ<br/>Emotions",{page: "dict.html", action:"adj", data:"pos:5"})}</td>
		    <td>فَعْلَانُ</td><td>فَعْلَى</td><td style="font-size:14px">Fullness<br/>emptiness<br/>acute emotion</td></tr>
		<tr><td>فَعِلٌ</td><td>فَعِلَةٌ</td><td style="font-size:14px">Joy<br/>Grief<br/>Immediate worry</td></tr>
		</tbody>
	</table>
`;
}

function getAdjectivePatternPairingExample(d){
	var adjectives = [
		{ "names": ["صَعْب",  "صَعْبَةٌ"], "en": "Difficult"  },
		{ "names": ["صَخرٌ",  "صَخْرَةٌ"], "en": "Rock"       },
		{ "names": ["شُجَاعٌ","شُجَاعَةٌ"], "en": "Courageous" },
		{ "names": ["خُلَاص",  "خُلَاصَة"], "en": "Summary"    },
		{ "names": ["قُمَام","قُمَامَةٌ"], "en": "Garbage"    },
		{ "names": ["كَرِيمٌ","كَرِيمَةٌ"], "en": "Generous"   },
		{ "names": ["جَمِيلٌ","جَمِيلَةٌ"], "en": "Beautiful"  },
		{ "names": ["عَظِيم","عَظِيمَةٌ"], "en": "Magnificent"},
		{ "names": ["أَحْمَرُ","حَمْرَاءُ"], "en": "Red"        },
		{ "names": ["أَعْرَجُ","عرْجَاءُ"], "en": "Lame"       },
		{ "names": ["أَصْلَعُ","صَلعاء"], "en": "Bald"       },
		{ "names": ["عَطْشَانُ","عَطْشَى"], "en": "Thirsty"    },
		{ "names": ["غَضْبَانُ","غَضْبَى"], "en": "Angry"      },
		{ "names": ["جَوْعَان","جَوْعَي"], "en": "Hungry"     },
		{ "names": ["فَرِحٌ",  "فَرِحَةٌ"], "en": "Joyfull"    },
		{ "names": ["قَلِقٌ",  "قَلِقَةٌ"], "en": "Anxious"    },
		{ "names": ["نَدِم",  "نَدِمَة"], "en": "Regretful"  },
		{ "names": ["أَكْبَرُ", "كُبْرَى"], "en": "Biggest"    },
		{ "names": ["أَصْغَرُ", "صُغْرَى"], "en": "Smallest"   },
		{ "names": ["أَدْنَى", "دُنْيَا"], "en": "Lowest"     }
	];
	if(d == 1){
		return adjectives;
	}
	return `
 	<table style="width:100%;direction:rtl;font-size:14pt;">
		<tbody>
		<tr><th>مُذكّر</th><th>مُؤنّث</th><th>Meaning</th></tr>
		${
			$.map(adjectives, (v, k)=>{
				return `
				<tr><td>${v.names[0]}</td><td>${v.names[1]}</td><td style="font-size:14px">${v.en}</td></tr>
				`;
			}).join('')	
		}
		</tbody>
	</table>
	`;
}
