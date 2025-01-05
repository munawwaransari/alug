//
//	Author: munawwar_ali@yahoo.com
//

function showPronounInfo(k, v1, v2){
	var container = $(".dictionary");
	container.empty();
	updateState(k, {ar: v1, en: v2});
	
	container.append($('<select class="pronounFilter" onchange="filterPronounView()">'+
					'<option value="all">Show All</option>'+
					'<option value="Subjective Pronouns">Subjective Pronouns</option>'+
					'<option value="Objective Pronouns">Objective Pronouns</option>'+
					'<option value="Demonstrative Pronouns">Demonstrative Pronouns</option>'+
					'<option value="Relative Pronouns">Relative Pronouns</option>'+
					+'</select>'));
					
	addPronounConjugation(container, "images/pronouns/subject/", "Subjective Pronouns", "ضمائرُ المُنفَصِلَة",{
		"3": ["he","they(m2)","they(m)","she","they(f2)","they(f)"],
		"2": ["you(m)","you(m2)","you all(m)","you(f)","you(f2)","you all(f)"],
		"1": ["i","we"]
	});
	addPronounConjugation(container, "images/pronouns/object/", "Objective Pronouns", "ضمائرُ المُتَّصِلَة",{
		"3": ["him","them(m2)","them(m)","her","them(f2)","them(f)"],
		"2": ["you(m)","you(m2)","you all(m)", "you(f)","you(f2)","you all(f)"],
		"1": ["me","us"]
	});
	addDemonstrativePronouns(container);
	addRelativePronouns(container);
}

function filterPronounView(){
	var val = $(".pronounFilter").val();
	if(val == 'all'){
		$('.pTable tr').show();
	}else{
		$('.pTable tr').hide();
		$("#pTable_"+val[0]+' tr').show();
	}
}

function addRelativePronouns(container){
	var rel = ["الّذِي","الَّذَانِ/الَّذَينِ","الَّذِينَ","الَّتِي","الَّتَانِ/الَّتَينِ","اللاتِي/اللائِي"];	
	var rel_comm = ["ما<br/>what", "مَن<br/>who", ""];
	
	var pTable = '<table id="pTable_R" class="pTable"><tr>'+
					'<th colspan="3" class="engText" style="font-size: 18px;">Relative Pronouns (اسمَاءُ الموصول)</th>';		
	pTable += getRows('RN1', null, rel, 'اسماء الموصولة الخاصَّة (that/which)');
	pTable += getRows('RN2', null, rel_comm, 'اسماء الموصولة العامَّة');
	pTable += '</table>';
	container.append($(pTable));
}

function addDemonstrativePronouns(container){
	var near = ["هذا","هذان/هذَينِ","هَؤُلآءِ","هَذِهِ","هاتان/هاتَينِ","هَؤُلآءِ", "هُنَا", "هَا", ""];
	var far = ["ذاك/َذَلِكَ","ذَانِكَ/َذَالِكُمَا","اُولَئِكَ","تِلكَ","تَانِكَ/تِلكُما","اُولَئِكَ","هُناكَ", "هُنالِكَ", ""];
	
	var near_en = ["this","these (two)","these (M)","this","these (two)","these (F)", "here", "here", ""];
	var far_en = ["that","those (two)","those (M)","that","those (two)","those (F)", "there", "there", ""];
	
	var near_arr = near.map(function(x, i){ return x + '<br/><span style="font-size:14px;">'+ near_en[i]+'</span>'});
	var far_arr = far.map(function(x, i){ return x + '<br/><span style="font-size:14px;">'+ far_en[i]+'</span>'});
	
	var pTable = '<table id="pTable_D" class="pTable"><tr>'+
					'<th colspan="3" class="engText" style="font-size: 18px;">Demonstrative Pronouns (اسماءُالإشارة)</th>';		
	pTable += getRows('DN', null, near_arr, 'اسماءُالإشارةِ القريب');	
	pTable += getRows('DF', null, far_arr, 'اسماءُالإشارةِ البَعِيد');	
	pTable += '</table>';
	container.append($(pTable));
}

function addPronounConjugation(container, path, en, ar, pronounMap){
	var pTable = '<table id="pTable_'+en[0]+'" class="pTable"><tr>'+
					'<th colspan="3" class="engText" style="font-size: 18px;">'+en+' ('+ar+')</th>';		
	pTable += getRows(en[0]+'3', path, pronounMap["3"], 'Third person (غائب)');	
	pTable += getRows(en[0]+'2', path, pronounMap["2"], 'Second person (حاضر)');
	pTable += getRows(en[0]+'1', path, pronounMap["1"], 'First person (مُتكلِّم)');
	pTable += '</table>';
	container.append($(pTable));
	showExampleRow(null);
}

function getRows(id, path, arr, title){
	var rows = '<tr><td colspan="3" style="background-color:#E8E885; font-size:16px;">'+title+'</td></tr>';
	for(var i=0; i < arr.length; i++){
		if(i == 0){
			rows += '<tr>';
		}
		if(i == 3 || i == 6){
			if(path){
				rows +='</tr><tr><td id="'+id+'" colspan="3" class="exp">example</td></tr>';
			}
			rows += '<tr>';
		}
		if(path != null)
			rows += '<td><img onclick="showExampleRow(\''+id+'\',\''+arr[i]+'\')" width="100px;" src="'+path+arr[i]+'.png" /></td>';
		else
			rows += '<td><span style="font-weight: 30px;" >'+arr[i]+'</span></td>';
	}
	//if(arr.length < 3){		
	//	rows +='</tr><tr><td id="'+id+'" colspan="2" class="exp">example</td></tr>';
	//}
	rows += '</tr>';
	return rows;
}

function showExampleRow(id, value){
	$(".exp").hide();
	if(id){
		$("#"+id).html(id[0] === 'S' ?  getRandomExample1(value) : getRandomExample2(value));
		$("#"+id).show();	
	}
}

function getRandomExample2(v){
	var examples = ["كِتَاب", "فُندُوق", "مِندِيل", "لِبَاس", "مِزاج"];
	
	const randomNumber = Math.ceil(Math.random() * examples.length);
	var ex = examples[randomNumber-1].split("|");
	var suffix = "";
	var val = v.split(/[()]+/);
	
	if(val[0].includes("you")){
		if(val[0] === 'you'){
			if(val[1].includes('2'))
				suffix = 'ُكُمَا'; 	
			else if(val[1] === 'm')
				suffix = 'ُكَ'; 	
			else 
				suffix = 'ُكِ'; 	
		}
		else {
			if(val[1] === 'm')
				suffix = 'كُم'; 	
			else
				suffix = 'ُكُنَّ'; 	
		}	
	} 
	else if(val[0].includes("them")){
			if(val[1].includes('2'))
				suffix = "ُهُمَا"
			else if(val[1] === 'm')
				suffix = 'ُهُم'; 	
			else
				suffix = 'ُهُنَّ'; 	
	}
	else if(val[0] === 'him')
		suffix = 'ُهُ'; 	
	else if(val[0] === 'her') 
		suffix = 'ُهَا'; 	
	return ex[0] + suffix;
}

function getRandomExample1(v){
	var examples = ["مُدَرِّس|ان|وُن|َة|تَانِ|َات", 
			  "عالِم|ان|وُن|َة|تَانِ|َات", 
			  "شاهِد|ان|وُن|َة|تَانِ|َات", 
			  "مُهَنّدِس|ان|وُن|َة|تَانِ|َات"];
	
	const randomNumber = Math.ceil(Math.random() * examples.length);
	var ex = examples[randomNumber-1].split("|");
	var prefix = "";
	
	var val = v.split(/[()]+/);
	var index=0;
	switch(val[1]){
		case "m": val[0] === "you" ? index = 0 : index = 2; break;
		case "f": val[0] === "you" ? index = 3 : index = 5; break;
		case "m2": index = 1; break;
		case "f2": index = 4; break;
		default:
			if(val[0] == 'she') index = 3;
			if(val[0] == 'he') index = 0;
			break;
	}
	
	var ret = ex[0];
	if(index > 0){
		ret += ex[index];
	}
	return getPronoun(val[0], val[1]) + ' ' + ret;
}

function getPronoun(val1, val2){
	if(val1.includes('you')){
		if (val1 === "you all"){
			if(val2=="m") 
				return 'اَنتُم';	
			else
				return 'اَنتُنَّ';	
		}else if(val2.includes('2')){
			return 'اَنتُماَ';	
		}else if(val2 == "m"){
			return 'اَنتَ';
		}else{
			return 'اَنتِ';
		}
	}
	
	if(val1.includes('they')){
		if(val2.includes('2')){
			return 'هُمَا';
		}
		else { 
			if(val2=="m")
				return 'هُم';	
			else
				return 'هُنَّ';
		}
	}
	if(val1 === 'he') return 'هُوَ';
	if(val1 === 'she') return 'هِيَ';
	return '';
}

function showFiveNouns(k, v1, v2){
	var container = $(".dictionary");
	container.empty();
	updateState(k, {ar: v1, en: v2});		
	
	var fiveNouns = ['اَب', 'اَخ', 'حَم', 'فَم', 'ذُو'];
	var fiveNouns_opposite = ['اُم', 'اُخت', 'حماة', 'فَمة', 'ذات'];
	var pTable = '<table id="n5Table" class="pTable" style="margin-top:20px;font-size:18px;">'+
				 '<tr style="background-color:#CFE2F3">'+
				 '<th>&nbsp;اسم&nbsp;</th><th>&nbsp;مؤنث&nbsp;</th><th>&nbsp;مرفوع&nbsp;</th><th>&nbsp;منصوب&nbsp;</th><th>&nbsp;مجزوم&nbsp;</th></tr>';
	for(var i=0; i < fiveNouns.length; i++){
		var n = fiveNouns[i].replace(/ُو$/g,'');
		pTable += '<tr><td><b>'+fiveNouns[i]+'</b></td>'+
				  '<td>'+fiveNouns_opposite[i]+'</td>'+
				  '<td style="background-color:#C4DBBB">'+n+'ُو'+'</td>'+
				  '<td style="background-color:#EAD1DC">'+n+'َا'+'</td>'+
				  '<td style="background-color:#C8C3D6">'+n+'ِي'+'</td>'+
				  '</tr>';
	}
	pTable += '</table>';
	container.append($(pTable));
	
	var examples = '<div style="margin-top:16px;margin:auto;text-align:center;"><b>Examples</b></div><br/>'+
				   '<div style="font-size:24px;margin:auto;text-align:center;">حَمُو أخِيهَ هُنا</div>'+
				   '<div style="font-size:16px;margin:auto;text-align:center;">His brother\'s father-in-law is here<div><br/>'+
				   '<div style="font-size:24px;margin:auto;text-align:center;">رَاَيتُ أَخَاكَ</div>'+
				   '<div style="font-size:16px;margin:auto;text-align:center;">I saw your brother<div><br/>'+
				   '<div style="font-size:24px;margin:auto;text-align:center;">فَمُو الأسَدِ مَفتُوحٌ</div>'+
				   '<div style="font-size:16px;margin:auto;text-align:center;">The lion\'s mouth is open<div><br/>'+
				   '<div style="font-size:24px;margin:auto;text-align:center;">اِسمُ أَخِي هَارُون</div>'+
				   '<div style="font-size:16px;margin:auto;text-align:center;">My brother\'s name is Aaron<div>';
					
	container.append($(examples));
}