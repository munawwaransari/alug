//
//	Author: munawwar_ali@yahoo.com
//

var pluralCSV = undefined;
var synonymsCSV = undefined;
var antonymsCSV = undefined;

function loadArabicLTTable(csv, key, v1, v2){
	var loadRequired = false; 
	var table;
	switch(csv){
		case 'plural.csv':
			loadRequired = (pluralCSV == undefined);
			table = pluralCSV;
		break;
		
		case 'synonyms.csv':
			loadRequired = (synonymsCSV == undefined);
			table = synonymsCSV;
		break;
		
		case 'antonyms.csv':
			loadRequired = (antonymsCSV == undefined);
			table = antonymsCSV;
		break;
	}
	
	if(loadRequired){
		ensureDataLoaded({name:csv, file:csv}).then((data) => loadCsvTable(data));
	}else if(table && table.length > 0){
		addAsHtmlTable($(".dictionary"), table, table[0].split(","));
	}else{
		console.log('Error: something went wrogn with the csv table');
	}
}

function loadCsvTable(data, addHtml = true){
	var table = [];
	var columns, tableData;
	if(data.length > 1){
		tableData = data.split('\n');
		var headings = tableData[0];
		columns = headings.split(",");
		if(headings.includes('PLURAL'))
			pluralCSV = tableData;
		else if(headings.includes('SYNO_SET'))
			synonymsCSV = tableData;
		else if(headings.includes('ANTO_SET'))
			antonymsCSV = tableData;
		else{
			console.log('Error: invalid or unsupported csv data');
			return false;
		}
		
		if(addHtml)
			addAsHtmlTable($(".dictionary"), tableData, columns);
	}
	return tableData;
}

function addAsHtmlTable(container, table, columns){
	var wordColumn = 0;
	container.empty();
	//container.append("<p>...Loading...</p>");
	var headings = "<tr>";
	columns.every(function(col, i){
		if(columns[i] == "WORD")
			wordColumn = i;
		
		if(columns[i].includes("ID") || columns[i].includes("VOCALIZED") ||  columns[i].includes("TYPE") )
				return true;
			
		headings+= `<th>${col}</th>`;
		return true;
	});
	headings+='</tr><table>';
	var htmlTable = $(`<table class="csvTable"><tr>${headings}</tr></table>`);
	var alink = `<a href="#" style="text-decoration: none" onclick="checkWord('$');">$</a>`
	var tableRows = "";
	table.every(function(row, index){
		if(index === 0) return true;
		tableRows += "<tr>";
		row.split(",").every(function(colVal, i){
			
			if(i >= columns.length)
				return true;
			
			if(columns[i].includes("ID") || columns[i].includes("VOCALIZED") ||  columns[i].includes("TYPE"))
				return true;
			
			if(columns[i] == 'WORD')
				tableRows+= `<td>${alink.replaceAll('$', colVal.trim())}</td>`;
			else
				tableRows+= `<td>${colVal}</td>`;
			return true;
		});
		tableRows+='</tr>';
		return true;
	});
	
	
	container.append(`
		<input 	id="txtFilter" 
				style="font-size:18px; max-width=100px;" 
				onchange="filterTable(${wordColumn});"/>`);

	container.append($(`
		<a style="font-size:10px; width:100%;text-align:center;" 
			href="#" onclick="
				var w = parent ? parent.window: window;
				w.open('https://github.com/mdanok/ArabicLT','_blank')">
			Data source: https://github.com/mdanok/ArabicLT
		</a>`));
	container.append(htmlTable);
	$(".csvTable tbody").append($(tableRows));
	container.find("p").remove();
}

function filterTable(wordColumn){
	filterTableRows(-1, '.csvTable', wordColumn, $("#txtFilter").val());
	$(".csvTable tr th").parent().show()
}

async function getSuggesstions(txt, callback) {

	var file = Object.entries(parent.dataCache["mappingsData"].data)
					 .filter(function ([key, value]) {
		return txt.startsWith(key);
	});
	if (file.length > 0) {
		var fileUrl = getLocationPath() + 'data/ar.dic/' + file[0][1] + '.json';
		console.log('getting suggestions: ' + file[0][1] + '.json');
		//loadJsonData(fileUrl).then((data) => {
		ensureDataLoaded({name: fileUrl}).then((data) => {
			// update global var for suggestions
			var suggestionsList = data.filter(function (w) {
				return w.startsWith(txt);
			});
			if (callback) {
				callback(suggestionsList);
			}
		});
	}
}

function showAllVerbTables(ii){

	ensureDataLoaded({name: "verb-examples"})
	.then((data) => {
		var filters = [];
		var flag = undefined;
		["V1", "V2", "V3"].forEach((k)=>{
			showVerbTable(data, k, flag);
			flag = 1
			
			var title = k == 'V1' ? 'Trilateral Verbs (المزيد)' : 
			k == 'V2' ? 'Qaudrilateral Verbs (الرباعي)' :
			k == 'V3' ? 'Extended Verbs' :  '';;

			filters.push(title);
		});

		// Add filter drop down
		if (filters.length > 0) {
			$(".dictionary").prepend($(getListButtinWithSelect(`
				<select class="nFilter" 	
					onchange="updateStateIndex(this);
						filterMTableRows('vTable', $('.nFilter').prop('selectedIndex'), $('.nFilter').val())">
				<option value="all">Show All</option>
				${
					filters.map(n => `<option value="${n}"><b>${n}</b></option>`).join('')
				}
				</select>
			`, 'nFilter', 'vtab-all')));
			$('.nFilterBtn').css('width', $('.nFilter').css('width'));
		}
		if(ii){
			$('.nFilter').prop('selectedIndex', ii);
			filterMTableRows('vTable', ii, $('.nFilter').val());
		}
	});
}

function showVerbTable(data, key, flag) {
	var vTable = posAPIObj.getVerbInfo(key);
	posAPIObj.addVerbInfoHtml(data, $(".dictionary"), vTable, key, flag);
}

function showMetonymies() {
	var mTable = posAPIObj.getMetonymies();
	posAPIObj.addMetonymyHtml($(".dictionary"), mTable);
}

function showParticleTable() {
	var pTable = posAPIObj.getParticleInfo();
	posAPIObj.addParticleInfoHtml($(".dictionary"), pTable);
}

function showPrepPhrasesTable() {
	var pTable = posAPIObj.getPerpPhraseInfo();
	posAPIObj.addPrepPhrasesInfoHtml($(".dictionary"), pTable);
}

function showNounTable(k, v1, v2) {
	var nTable = posAPIObj.getNounInfo();
	posAPIObj.addNounInfoHtml($(".dictionary"), nTable);
}

function showComparisions(inp) {
	cmpAPIObj.addComparisionList($(".dictionary"), inp, false, 'cmp');
}

function showSentenceComparisions(inp, type) {
	cmpAPIObj.addComparisionList($(".dictionary"), inp, true, type);
}

function showVerbComparisions(inp) {
	cmpAPIObj.addComparisionList($(".dictionary"), inp, true, "verb");
}

function showNounComparisions(inp) {
	cmpAPIObj.addComparisionList($(".dictionary"), inp, true, 'noun');
}

function showTriliteralVerbTable() {

	var alink = `
	<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
	$(".dictionary").empty()
	var table = `
	<table id="nTable_3" class="pTable">
		<tr style="background-color:#B6D7A8;font-size:16px;">
			<th>الماضي المعلُوم${getPinIcon('nTable_3',' tbody:first',parent.document)}</th>
			<th>المُضارع المعلوم<br/>(مُرفُوع)</th>
			<th>الماضي المجهُول</th>
			<th>المُضارع المجهُول<br/>(مُرفُوع)</th>
		</tr>
		<tr>
			<td>فَعَلَ</td><td>يَفْعَلُ</td>
			<td>فُعِلَ</td><td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#E8E885">
			<td>(${alink.replaceAll('$', 'فَتَحَ')})</td>
			<td>(${alink.replaceAll('$', 'يَفْتَحُ')})</td>
			'<td>(${alink.replaceAll('$', 'فُتِحَ')})</td>
			<td>(${alink.replaceAll('$', 'يُفْتَحُ')})</td>
		</tr>
		<tr>
			<td>فَعَلَ</td><td>يَفْعِلُ</td>
			<td>فُعِلَ</td><td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#E8E885">
			<td>(${alink.replaceAll('$', 'ضَرَبَ')})</td>
			<td>(${alink.replaceAll('$', 'يَضْرِبُ')})</td>
			<td>(ضُرِبَ)</td>
			<td>(يُضرَبُ)</td>
		</tr>
		<tr>
			<td>فَعَلَ</td>
			<td>يَفْعُلُ</td>
			<td>يَفْعُلَ</td>
			<td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#E8E885">
			<td>(${alink.replaceAll('$', 'نَصَرَ')})</td>
			<td>(${alink.replaceAll('$', 'يَنْصُرُ')})</td>
			<td>(${alink.replaceAll('$', 'نُصِرَ')})</td>
			<td>(${alink.replaceAll('$', 'يُنْصَرُ')})</td>
		</tr>
		<tr>
			<td>فَعِلَ</td>
			<td>يَفْعَلُ</td>
			<td>فُعِلَ</td>
			<td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#CFE2F3">
			<td>(${alink.replaceAll('$', 'سَمِعَ')})</td>
			<td>(${alink.replaceAll('$', 'يَسْمَعُ')})</td>
			<td>(${alink.replaceAll('$', 'سُمِعَ')})</td>
			<td>(${alink.replaceAll('$', 'يُسْمَعُ')})</td>
		</tr>
		<tr>
			<td>فَعِلَ</td>
			<td>يَفْعِلُ</td>
			<td>فُعِلَ</td>
			<td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#CFE2F3">
			<td>(${alink.replaceAll('$', 'حَسِبَ')})</td>
			<td>(${alink.replaceAll('$', 'يَحسِبُ')})</td>
			<td>(${alink.replaceAll('$', 'حُسِبَ')})</td>
			<td>(${alink.replaceAll('$', 'يُحْسَبُ')})</td>
		</tr>
		<tr>
			<td>فَعُلَ</td>
			<td>يَفْعُلَ</td>
			<td>فُعِلَ</td>
			<td>يُفْعَلَ</td>
		</tr>
		<tr style="background-color:#DFB4C9">
			<td>(${alink.replaceAll('$', 'كَرُمَ')})</td>
			<td>(${alink.replaceAll('$', 'يَكْرُمُ')})</td>
			<td>(${alink.replaceAll('$', 'كُرِمَ')})</td>
			<td>(${alink.replaceAll('$', 'يُكْرَمُ')})</td>
		</tr>
	<table>`;
	$(".dictionary").append('<div style="height:10px;"></div>');
	$(".dictionary").append($(table));
}

function showInadequateVerbTable(d, ii) {

	var inadVerbs = {
		"توقيت": {
			en: "(Timing)",
			info: [
				"to become / to change", "أصبَح / أَمْسَى / أَضْحَى / ظَلّ / بَاتَ"
			],
			examples: [
				"فَسُبۡحَٰنَ   ٱللَّهِ   حِينَ   تُمۡسُونَ   وَحِينَ   تُصۡبِحُونَ [30:17]",
				"فَظَلَّتۡ   أَعۡنَٰقُهُمۡ   لَهَا   خَٰضِعِينَ [26:4]",
				"",
				"اصبَحَ الطَّقَسُ جَمِيلَةً<br/>The weather has become beautiful",
				"بَاتَ المَريضُ جَادًا<br/>The patient became (in night) seriosly ill"
			]
		},
		"تحويل": {
			en: "(Transition)",
			info: [
				"to tansition / become", "صَارَ / صَارَ إِلَي"
			],
			examples: [
				"قُلۡ تَمَتَّعُواْ فَإِنَّ مَصِيرَكُمۡ إِلَى ٱلنَّارِ [14:30]",
				"وَٱتَّخَذَ   ٱللَّهُ   إِبۡرَٰهِيمَ   خَلِيلٗا [4:125]",
				"قُلۡ   أَرَءَيۡتُمۡ   إِنۡ   أَصۡبَحَ   مَآؤُكُمۡ   غَوۡرٗا... [67:30]",
				"",
				"صَارَ الماءُ جَليِدًا<br/>The water became ice",
				"صارَ إلَي لِصٍّ<br/>He beame a thief"
			]
		},
		"نفي": {
			en: "(Negation)",
			info: [
				"not", "لَيسَ"
			],
			examples: [
				"أَلَيْسَ الصُّبْحُ بِقَرِيبٍ [11:81]",
				"فَلَا   تَسۡـَٔلۡنِ   مَا   لَيۡسَ   لَكَ   بِهِۦ   عِلۡمٌۖ [11:46]",
				"",
				"لَيسَ المُعَلِّمُ حاضِرًا<br/>The teacher is not present"
			]
		},
		"استمرار": {
			en: "(Continuation)",
			info: [
				"to remain / continue", "مَازالَ / مابَرِحَ / ماأنفَكَّ"
			],
			examples: [
				"فَمَا زَالَت تِّلۡكَ دَعۡوَىٰهُمۡ حَتَّىٰ... [21:15]",
				"",
				"مابرح الجوء لَطيفًا<br/>Weather is still nice",
				"مازال الطِّفلُ نَائمًا<br/>The baby is still asleep"
			]
		},
	};

	if(d){ //return data when inline call
		return Object.assign({}, ...$.map(inadVerbs, function(value, key) {
			var obj = {};
			obj[key] = value.examples;
			return obj;
		}));
	}

	var alink = `
	<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
	var filters = [];
	$(".dictionary").empty();
	$(".dictionary").append('<div style="height:10px;"></div>');
	Object.keys(inadVerbs).forEach((k, index)=>{
		
		var table = `
		<table class="mTable" id="mTable${index+1}">
			<tr>
				<td style="min-width:300px;"><b>(الأفعال الناقصة) Inadequate Verbs</b>
				${getPinIcon(`mTable${index+1}`,' tbody:first',parent.document)}
				</td>
			</tr>
			<tr style="background-color:#E8E885;">
				<td style="min-width:300px;"><b>${k} ${inadVerbs[k].en}</b></td>
			</tr>
			<tr style="background-color:#E8E885;">
				<td>${inadVerbs[k].info[0]}<br/>${inadVerbs[k].info[1]}</td>
			</tr>
			<tr>
				<td>${inadVerbs[k].examples.map((x)=>replaceQLink(x)).join('<br/>')}
				<br/>
				<a href="#" onclick="openGoogleAISearch(getPromptFromKey(['InadequateVerbs'], {'0': ['${k}']}, true))">More</a>
				</td>
			</tr>
			<table>`;
		$(".dictionary").append($(table));

		//Add filter
		filters.push(`${k} ${inadVerbs[k].en}`);
	});

	// Add filter drop down
	if (filters.length > 0) {
		$(".dictionary").prepend($(getListButtinWithSelect(`
			<select class="nFilter" 
				onchange="updateStateIndex(this);
					filterMTableRows('mTable', $('.nFilter').prop('selectedIndex'), $('.nFilter').val())">
			<option value="all">Show All</option>
			${
				filters.map(n => `<option value="${n}"><b>${n}</b></option>`).join('')
			}
			</select>
		`, 'nFilter', 'inad-verb')));
		$('.nFilterBtn').css('width', $('.nFilter').css('width'));
	}
	if(ii){
		$('.nFilter').prop('selectedIndex', ii);
		filterMTableRows('mTable', ii, $('.nFilter').val());
	}
}

function showWeakVerbTable(d, ii) {
	var alink = `
	<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
	var nawaqis = {
		'مِثال': {
			info: [
				"(يَفعَلُ) يَوجِدُ => يَجِدُ<br/>(يَفعِلُونَ) يَوذِرُونَ => يَذِرُونَ", 
				"ف كلمة => ا و ي", "(و ج د)"
			],
			examples: [
				"وَمَن يَلْعَنِ اللَّهُ فَلَن تَجِدَ لَهُ نَصِيرًا [4:52]",
				"رَبَّنَآ ...  وَقِنَا   عَذَابَ   ٱلنَّارِ [3:16]",
				"فَلۡيَتَّقُواْ   ٱللَّهَ   وَلۡيَقُولُواْ   قَوۡلٗا   سَدِيدًا [4:9]"
			]
		},
		'أَجوَف': {
			info: [
				"(فَعَلَ) قَوَلَ => قَالَ<br/>(فُعِلَ) قُوِلَ => قِيلَ", 
				"ع كلمة => ا و ي", "(ق و ل)"],
			examples: [
				"وَأَن تَصُومُوا خَيْرٌ لَّكُمْ [2:184]",
				"قَالَ   إِنَّمَآ   أَنَا۠   رَسُولُ   رَبِّكِ [19:19]",
				"لَن   تَنَالُواْ   ٱلۡبِرَّ   حَتَّىٰ   تُنفِقُواْ   مِمَّا   تُحِبُّونَۚ [3:92]"
			]
		},
		'نَاقِص': {
			info: [
				"(فَعَلُوا) رَضَيُوا=> رَضُوا",
				"ل كلمة => ا و ي","(ر ض ي)"],
			examples:[
				"رَّضِيَ اللَّهُ عَنْهُمْ وَرَضُوا عَنْهُ [5:119]",
				"أُجِيبُ   دَعۡوَةَ   ٱلدَّاعِ   إِذَا   دَعَانِۖ [2:186]",
				"اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ [1:6]"
			]
		},
		'لَفِيف': {
			info: ["(اِفتَعَلَ) إوتَقَيَ => إتْتَقَي => إتَّقَي<br/>(فَعِلنَا) وَقِينَا=> وَقِنَا", 
				"و/ي root has", 
				"(و ق ي)"],
			examples: [
				"وَقِنَا عَذَابَ النَّارِ [3:16]",
				"يَوۡمَ نَطۡوِي  ٱلسَّمَآءَ كَطَيِّ ٱلسِّجِلِّ لِلۡكُتُبِۚ [21:104]",
				"وَتَعِيَهَآ   أُذُنٞ   وَٰعِيَةٞ [69:12]"
			]
		},
		'مَهمُوز': {
			info: [
				"(فَعَلُوا) رَأَيُو => رَأَو<br/>(يَفعَلُ) يَاكُلُ [Exception]", 
				"root has hamza", "(أ ك ل)"],
			examples: [
				"وَلَئِنْ أَرْسَلْنَا رِيحًا فَرَأَوْهُ مُصْفَرًّا [30:51]",
				"سَأَلَ   سَآئِلُۢ   بِعَذَابٖ   وَاقِعٖ [70:1]",
				"فَلَمَّا   رَءَا   ٱلۡقَمَرَ   بَازِغٗا [6:77]"
			]
		}
	};

	if(d){ //return data when inline call
		return Object.assign({}, ...$.map(nawaqis, function(value, key) {
			var obj = {};
			obj[key] = value.examples;
			return obj;
		}));
	}

	$(".dictionary").empty();
	var filters = [];
	$(".dictionary").append('<div id="wvTitle" style="margin-top:10px; width:100%; text-align:center"><b>(الأفعال الناقصة) Weak Verbs</b><br/>حرف العِلَّت When root of a word has one or more </div>');
	var index = 0;
	$.each(nawaqis, (k, v)=>{
		index++;
		var table = `
		<table class="mTable" id="mTable${index}">
		<tr style="width:100%">
			<td style="background-color:#E8E885;">
				<b>${k}${getPinIcon(`mTable${index}`,' tbody:first',parent.document)}</b>
			</td>
			<td rowspan="3" style="min-width:200px;">${v.info[0]}<br/>
			<a href="#" title="AI search" style="font-size:14px;" onclick="openGoogleAISearch(
						getPromptFromKey(['WeakVerbs'], {'0': ['${k}}']}, true))">More</a>
			</td>
		</tr>
		<tr>
			<td style="background-color:#E8E885;">${v.info[1]}</td>
		</tr>
		<tr>
			<td>${v.info[2]}</td>
		</tr>
		<tr>
			<td colspan="2" style="border:none;">
			<br/>${v.examples.map((ex) => replaceQLink(ex, false)).join('<br/>')}<br/><br/>
			</td>
		</tr>
		<table>`;
		$(".dictionary").append($(table));
		
		//Add filter
		filters.push(k);
	});

	// Add filter drop down
	if (filters.length > 0) {
		$(".dictionary").prepend($(getListButtinWithSelect(`
			<select class="nFilter" 
				onchange="updateStateIndex(this);
					filterMTableRows('mTable', $('.nFilter').prop('selectedIndex'), $('.nFilter').val());
				          var d =$('#wvTitle');
						  d.remove();
						  $('.nFilterBtn').after(d); 
						  d.show();">
			<option value="all">Show All</option>
			${
				filters.map(n => `<option value="${n}"><b>${n}</b></option>`).join('')
			}
			</select>
		`, 'nFilter', 'weak-verb')));
		$('.nFilterBtn').css('width', $('.nFilter').css('width'));
	}
	if(ii){
		$('.nFilter').prop('selectedIndex', ii);
		filterMTableRows('mTable', ii, $('.nFilter').val());
	}
}

function showImperativeTable(d, ii) {
	var examples = {
		'I':  
		[
			'قُمۡ   فَأَنذِرۡ  ٢ [74:2]',
			'فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ [93:9]',
			'فَقُولِيٓ   إِنِّي   نَذَرۡتُ   لِلرَّحۡمَٰنِ [19:26]',
			'لَا   تَحۡزَنۡ   إِنَّ   ٱللَّهَ   مَعَنَاۖ [9:40]'
		],
		'II': 
		[
			'وَثِيَابَكَ   فَطَهِّرۡ   ٤ [74:4]',
			'فَكُلِي   وَٱشۡرَبِي   وَقَرِّي   عَيۡنٗاۖ  [19:26]',
			'سَلِّمْ على أصدقائِكَ<br/><sup>Greet (Say hello) to your friends</sup>'
		],
		'III':
		[
			'وَلَا تُقَاتِلُوهُمْ عِندَ الْمَسْجِدِ الْحَرَامِ [2:191]',
			'يَٰٓأَيُّهَا   ٱلنَّبِيُّ   جَٰهِدِ   ٱلۡكُفَّارَ   وَٱلۡمُنَٰفِقِينَ [66:9]',
			'قَاتِلْ مِنْ أَجْلِ حُرِّيَّتِكَ<br/><sup>Fight for your freedom</sup>'
		],
		'IV': 
		[
			'وَلَا تُطِعْ كُلَّ حَلَّافٍ مَّهِينٍ [68:10]',
			'وَأَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ [5:92]',
			'لَا   تُحِلُّواْ   شَعَٰٓئِرَ   ٱللَّهِ [5:2]'
		],
		'V':  
		[
			'فَتُذَكِّرَ إِحْدَاهُمَا الْأُخْرَىٰ [2:282]',
			'فَتَوَلَّ   عَنۡهُمۡۘ [54:6]',
			'تَعَلَّمْ اللُّغَةَ العَرَبِيَّةَ<br/><sup>Learn the Arabic language</sup>'
		],
		'VI': 
		[
			'وَتَعَاوَنُواْ   عَلَى   ٱلۡبِرِّ   وَٱلتَّقۡوَىٰۖ  [5:2]',
			'إِذَا   تَدَايَنتُم   بِدَيۡنٍ   إِلَىٰٓ   أَجَلٖ   مُّسَمّٗى   فَٱكۡتُبُوهُۚ [2:282]',
			'وَأَشۡهِدُوٓاْ   إِذَا   تَبَايَعۡتُمۡۚ [2:282]'
		],
		'VII':
		[
			'اِنْقَطِعْ عن هذا العادةِ السَّيِّئَةِ<br/><sup>Cut yourself from this bad habbit</sup>',
			'اِنْصَرِفْ إلى عملِكَ<br/><sup>Depart to your work</sup>'
		],
		'VIII':
		[
			'وَلَا تَتَّبِعُوا خُطُوَاتِ الشَّيْطَانِ [2:168]',
			'ثُمَّ   ٱتَّقَواْ   وَّأَحۡسَنُواْۚ [5:93]',
			'اِسْتَمِعْ إِلَى النَّصِيحَةِ<br/><sup>Listen to the advice</sup>'
		],
		'IX': 
		[
			'فَاِخْضَرُّوا يا زَرْعُ<br/><sup>Turn green, O corps!</sup>',
			'اِحْمَرِّي يا وَرْدَةُ<br/><sup>Turn red, O rose!</sup>'
		],
		'X':  
		[
			'وَلَا تَمْنُن تَسْتَكْثِرُ [74:6]',
			'قَالُواْ   يَٰٓأَبَانَا   ٱسۡتَغۡفِرۡ   لَنَا   ذُنُوبَنَآ [12:97]'
		]
	};

	if (d == 1) {
		return examples;
	}
	var container = $(".dictionary");
	var verbInfo = posAPIObj.getVerbInfo();
	var api = this;
	var filters = [];
	container.empty();
	var alink = `<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
	var index=0;
	for (const keyVal of Object.entries(verbInfo)) {
		index++;
		var vTable = `
		<table id="mTable${index}" class="mTable">
			<tr>
				<th class="engText" style="font-size: 14px;">Form
				${getPinIcon(`mTable${index}`,' tbody:first',parent.document)}</th>
				<th class="engText">Gender<br/>M/F</th>
				<th class="engText">2nd Person<br/>مضارع</th>
				<th colspan="2" class="engText">Imperative<br/>الأمر/النهي</th>
			</tr>`;
		var entryName = keyVal[0];
		var xform = keyVal[1].xform;
		if (xform) {
			var pa = xform.filter(x => x.en === "present (active)")
				.map(x => x.form)

			var impM1 = makeImperative(pa[0], 'm');
			var impM2 = impM1.replace(new RegExp("^(ا|([ء-ي]))", "g"), "لا ت$2");

			var impF1 = makeImperative(pa[0], 'f');
			var impF2 = impF1.replace(new RegExp("^(ا|([ء-ي]))", "g"), "لا ت$2");
			var formNumber = entryName.split(' ')[1];
			vTable += `
			<tr>
				<td rowspan="2" class="engText">${formNumber}</td>
				<td class="engText">M</td>
				<td class="engText" style="color:#DD6188">(${make2ndPerson(pa[0], 'm')})</td>
				<td style="color:#7575BB">${impM1}</td>
				<td style="color:#7575BB">${impM2}</td>
			</tr>
			<tr>
				<td class="engText">F</td>
				<td class="engText" style="color:#DD6188">(${make2ndPerson(pa[0], 'f')})</td>
				<td style="color:#7575BB">${impF1}</td>
				<td style="color:#7575BB">${impF2}</td>
			</tr/>
			<tr>
				<td style="background-color:#F6F6BA;font-size:18px;padding:4px;" colspan="5">
					${examples[formNumber].map((ex)=>replaceQLink(ex, false)).join('<br/>')}
				</td>
			</tr>`;
			container.append(vTable);
			//$(`#mTable$${index} tbody`).append($(rows));
			//Add filter
			filters.push(`Imperative - Form ${formNumber}`);
		}
	}
	// Add filter drop down
	if (filters.length > 0) {
		container.prepend($(getListButtinWithSelect(`
			<select class="nFilter" 
				onchange="updateStateIndex(this);
					filterMTableRows('mTable', $('.nFilter').prop('selectedIndex'), $('.nFilter').val())">
			<option value="all">Show All</option>
			${
				filters.map(n => `<option value="${n}"><b>${n}</b></option>`).join('')
			}
			</select>
		`, 'nFilter', 'imp-verb')));
		$('.nFilterBtn').css('width', $('.nFilter').css('width'));
	}
	if(ii){
		$('.nFilter').prop('selectedIndex', ii);
		filterMTableRows('mTable', ii, $('.nFilter').val());
	}
}

function showCauseAndEffects(inp) {
	$(".dictionary").empty();

	var html = `
	<div style="font-size:12px;width:100%;background-color:yellow;text-align:center;">
		Click or tap on a block to see examples ( See: 
		<a href="#" onclick="showObjectEffects('obj-effect')">Object Effects</a> )
	</div>
	<div style="width:100%;display:flex;flex-diection:column;text-align:center;">
		<img id="svgImg1" style="margin:auto;current:arrow;" src="images/ce.svg"></img>
	</div>
	<div id="ceExamples" style="width:100%;text-align:center;">
	</div>`;

	$(".dictionary").append($(html));

	var coords = {
		"Causal Object": [29, 30, 134, 76],
		//"Subject": [206,25,262,73],
		"Comitative Object": [353, 28, 458, 74],
		"Adverbial Object": [31, 255, 133, 303],
		"Direct Object": [201, 255, 264, 302],
		"Absolute Effect": [354, 255, 459, 301],
		//"Action": [204,144,266,185],
		//"Cause":[52,140,107,188],
		//"Effect": [375,140,430,188],
		"Circumstantial": [263.5, 199, 374.5, 237],
		"Disambiguitive": [101.5, 95, 212.5, 131263.5, 199, 374.5, 237]
	};

	var svgImg = $("#svgImg1");
	svgImg.on('load', function () {
		var isAndroid = $(".toolDiv.mobile").length > 0;
		if (isAndroid || svgImg.offset().left < 0) {
			var w1 = svgImg.prop("width");
			svgImg.css("width", "100%");
			var w2 = svgImg.prop("width");
			var factor = w2 / w1;
			//Adjust coordinates
			for (const [k, v] of Object.entries(coords)) {
				for (var j = 0; j < v.length; j++) {
					v[j] = v[j] * factor;
				}
			}
		}
	});

	svgImg.on("click", function (e) {
		if (activeSvgArea) {
			var exDiv = $("#ceExamples");
			exDiv.empty();
			var examples = ce_examples[activeSvgArea];
			if (examples) {

				var exHtml = '<div></div>';
				for (var i = 0; i < examples.length; i++) {
					exHtml += '<div style="margin:auto;">' + replaceQLink(examples[i]) + '</div>';
				}
				exDiv.append($(exHtml));
			}
		}
	});

	var isWorking = false;
	var activeSvgArea = undefined;
	var ce_examples = get_ce_examples();

	svgImg.on("mousemove", function (e) {

		if (!isWorking) {
			isWorking = true;
			$("#svgImg1").css('cursor', 'crosshair');
			var isSet = false;

			var offset = $(this).offset();
			var x = e.clientX - offset.left;
			var y = e.clientY - offset.top;
			for (const [k, v] of Object.entries(coords)) {
				if (x > v[0] && x < v[2] && y > v[1] && y < v[3]) {
					$("#svgImg1").css('cursor', 'pointer');
					activeSvgArea = k;
					isSet = true;
					break;
				}
			}
			activeSvgArea = isSet ? activeSvgArea : undefined;
			isWorking = false;
		}
	});
}
