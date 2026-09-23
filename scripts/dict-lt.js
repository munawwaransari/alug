//
//	Author: munawwar_ali@yahoo.com
//

function loadCsvTable(data, addHtml = true){
	var table = [];
	var columns, tableData;
	if(data.length > 1){
		tableData = data.split('\n');
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
	var regEx = new RegExp(`^|[\\b,;)(]${txt}[\\u0621-\\u064A]*`, 'g');
	ensureDataLoaded({name: 'all-words.csv', file: "all-words.csv"}).then((data) => {
		var suggestionsList = data.match(regEx)
		                          ?.map(x=>x.replaceAll(/[(),;\b]+/g, ''))
								  ?.filter(x=>x != '');
		if (callback) {
			callback([...new Set(suggestionsList)]);
		}
	});
}

function showAllVerbTables(ii, bk){

	ensureDataLoaded({name: "verb-examples"})
	.then((data) => {
		var filters = [];
		var flag = undefined;
		["V1", "V2", "V3"].forEach((k)=>{
			showVerbTable(data, k, flag);
			flag = 1
			
			var title = k == 'V1' ? 'Triliteral Verbs (المزيد)' : 
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
			`, 'nFilter', 'verb')));
			$('.nFilterBtn').css('width', $('.nFilter').css('width'));
		}
		if(ii !== undefined){
			$('.nFilter').prop('selectedIndex', ii);
			filterMTableRows('vTable', ii, $('.nFilter').val());
		}
		if(bk){
			var bkElem=$(`a[href='#${bk}']`);
			if(bkElem.length > 0) bkElem[0].click();
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

function showPrepPhrasesTable(title) {
	ensureDataLoaded({name: 'phrases'})
	.then((data) => {
		posAPIObj.addPrepPhrasesInfoHtml($(".dictionary"), data[title], title);
	});
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

	ensureDataLoaded({name: 'ex-data'})
	.then((data)=>{
		var inadVerbs = data["inad-verb"];
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
	});
}

function showWeakVerbTable(ii) {
	
	ensureDataLoaded({name: 'ex-data'})
	.then((data=>{
		var nawaqis = data["weak-verb"];
		$(".dictionary").empty();
		var filters = [];
		$(".dictionary").append(`<div style="direction:ltr;text-align:center;" id="wvTitle" style="margin-top:10px; width:100%; text-align:center"><b>(الأفعال الناقصة) Weak Verbs</b><br/>حرف العِلَّت When root of a word has one or more
			<br/>Note that مَهمُوز is not a weak verb</div>`);
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
	}));
}

function showImperativeTable(ii) {
	
	ensureDataLoaded({name: 'ex-data'})
	.then((data)=>{
		var examples = data["imperative"];
		var container = $(".dictionary");
		var verbInfo = posAPIObj.getVerbInfo();
		var api = this;
		var filters = [];
		container.empty();
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
	});
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
		ensureDataLoaded({name: 'ex-data'})
		.then((data=>{
			var ce_examples = data["objects"];
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
		}));
	});

	var isWorking = false;
	var activeSvgArea = undefined;

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

function getDiacriticsTable(){
	var diacritics=[
		{code:'U+064B',glyph:'\u064b', desc:'ARABIC FATHATAN'},
		{code:'U+064C',glyph:'\u064c', desc:'ARABIC DAMMATAN'},
		{code:'U+064D',glyph:'\u064d', desc:'ARABIC KASRATAN'},
		{code:'U+064E',glyph:'\u064e', desc:'ARABIC FATHA'},
		{code:'U+064F',glyph:'\u064f', desc:'ARABIC DAMMA'},
		{code:'U+0650',glyph:'\u0650', desc:'ARABIC KASRA'},
		{code:'U+0651',glyph:'\u0651', desc:'ARABIC SHADDA'},
		{code:'U+0652',glyph:'\u0652', desc:'ARABIC SUKUN'},
		{code:'U+0653',glyph:'\u0653', desc:'ARABIC MADDAH ABOVE'},
		{code:'U+0654',glyph:'\u0654', desc:'ARABIC HAMZA ABOVE'},
		{code:'U+0655',glyph:'\u0655', desc:'ARABIC HAMZA BELOW	'}
	];
	return `
	<table style="direction:ltr;font-size:14pt;width:100%;height:auto;">
	  <tbody>
	     <tr><th>Code</th><th>Glyph</th><th>Unicode Name</th></tr>
		 ${
			diacritics.map((x)=>{
				return `
				<tr>
					<td>${x.code}</td>
					<td style=\"font-size:50px;\">
						<span style=\"color:lightgray;\">-</span>
						<span style=\"color:black;left:-10px;margin-left:-28px;\">${x.glyph}</span></td>
					<td>${x.desc}</td>
				</tr>`
			}).join('')
		 }
	  </tobdy>
	</table>`;
}

function getTajweedTable(n){
	if(n===1)
	return `
	<table style="direction:ltr;font-size:14pt;">
	  <tbody>
	     <tr><th>التفخيم</th><th>الترقيق</th><th>الهمس</th></tr>
		 <tr>
		   <td><span style="font-size:16pt">Heavy letters: خ, ص, ض, غ ,ط ,ق ,ظ</span></td>
		   <td><span style="font-size:16pt">All remaining letters except the heavy ones and the conditional ones</span></td>
		   <td><span style="font-size:16pt">ف ,ح ,ث ,ه, ش ,خ ,ص ,س ,ك ,ت</span></td>
		</tr>
		<tr>
		    <td>The back of the tongue elevates, directing sound pressure to the roof of the mouth to create a deep echo.</td>
			<td>The tongue remains flat and lowered, allowing the sound to escape without a hollow echo.</td>
			<td>The vocal cords relax, allowing a continuous stream of breath to flow out with the letter.</td>
		</tr>
		<tbody>
		</table>`;

	if(n===2)
	return `
	<table style="direction:ltr;font-size:14pt;">
	  <tbody>
	     <tr><th>إظهار</th><th>إخفاء</th><th>إدغام</th></tr>
		 <tr>
		   <td><span style="font-size:16pt">ء , هـ , ع , ح , غ , خ<br/>(حُرُوف الحَلْق)</span></td>
		   <td><span style="font-size:16pt">ت, ث, ج, د, ذ, ز, س, ش, ص, ض, ط, ظ, ف, ق, ك</span>
		   </td>
		   <td><span style="font-size:16pt">ي, ر, م, ل, و, ن</span><br/>
			   (grouped in the phrase يَرْمَلُونَ)
		   </td>
		</tr>
		<tr>
		    <td rowspan="2"><b>No Ghunna</b>:<br/>Noon Sakinah (نْ) or Tanween (ً ٌ ٍ) is pronounced clearly and distinctly from the top of the throat, without any extra nasal sound (Ghunnah)<br/>e.g. مَنْ آمَنَ, مِنْ هَادٍ</td>
			<td><b>(Heavy Ghunnah)</b>:<br/>when the Noon Sakinah (نْ) or Tanween (ً ٌ ٍ) is followed by <br/>
			<span style="font-size:16pt">ص, ض, ط, ظ, ق</span><br/>
			e.g. مِنْ قَبْلِ, مِنْ طِينٍ
			</td>
			<td><b>إدغام بغنة (Nasal sound)</b>:<br/>
		       when the Noon Sakinah (نْ) or Tanween (ً ٌ ٍ) is followed by any of the four letters in the word (يَنْمُو) e.g. مَن يَقُولُ, مِن مَّاءٍ,<br/>
			   وُجُوهٞ يَوۡمَئِذٍ خَٰشِعَةٌ [88:2]
			</td>
		</tr>
		<tr>
			<td><b>Light Ghunna</b>: when the Noon Sakinah (نْ) or Tanween (ً ٌ ٍ) is followed by 
			    <span style="font-size:16pt">ت ك ف ش س ز د ج ث</span><br/>
				e.g. مِنْ تَحْتِهَا, أَنْتُمْ 
			</td>
		    <td><b>إدغام بغير غنة (No nasal sound)</b>:<br/>
			    when followed by Lam (ل) or Raa (ر) e.g. <br/>مِن لَّدُنْهُ, مِن رَّبِّهِمْ
			</td>
		</tr>
		<tbody>
		</table>`;
}

function getArabicLettersInfo(){
 return `
 <ul style="direction:ltr;list-style: none;font-size:14px;">
   <li>Unicode Block (U+0600 to U+06FF)</li>
   <li>Written and read horizontally from right to left.</li>
   <li>Cursive and ligature based: e.g (لا) and (لله)</li>
   <li>Letter shapes change based on position e.g. (\uFEB3), (ـسـ), (\uFEB2)</li>
   <li>Short vowels: optional diacritic marks ( \u064f ), ( \u064e ), ( \u0650 ), etc.</li>
   <li>Non-joining Letters (break ligature): ا, د, ذ, ر, ز, و</li>
 </ul>`;
}

function getArabicLanguageInfo(n){
  if(n=='MSA')
	return `
	<table style="width:100%;direction:ltr;font-size:14pt;">
		<tbody>
		<tr><td><b>Case Endings</b></td></tr>
		<tr><td>MSA uses short vowels at the end of words to show grammatical function e.g.<br/> الولدُ ياكلُ التفاحاتةَ <br/>(al-walad<b>u</b> yakul<b>u</b> al-tuffaha<b>ta</b>)</td></tr>
		<tr><td><b>Future Tense Markers</b></td></tr>
		<tr><td>MSA adds the prefix سـ or the particle سَوفَ e.g.<br/> سَاُسافِرُ / سَوفَ اُسافِرُ</td>
		<tr><td><b>Present Continuous Marker</b></td></tr>
		<tr><td>MSA uses the standard present tense verb e.g. يَدرُسُ (He studies or he is studying)</td></tr>
		<tr><td><b>The Letter Qaf (ق)</b></td></tr>
		<tr><td>In MSA, the letter Qaf is pronounced deep in the throat as a hard /q/ e.g. قُل (qul).</td></tr>
		</tbody>
	</table>
    `;
//else
	return `
	<table style="width:100%;direction:ltr;font-size:14pt;align-content:baseline;">
		<tbody>
		<tr><td><b>Case Endings</b></td></tr>
		<tr><td>Colloquial Arabic always ending words on a silent consonant sound (sukun) e.g.<br/> الولد بياكل التفاحاتة <br/>(al-walad bi-yakul al-tuffaha)</td></tr>
		<tr><td><b>Future Tense Markers</b></td></tr>
		<tr><td>Colloquial dialects substitute this with regional prefixes e.g.<br/> رح أسافر / رايح أسافر / هسافر</td>
		<tr><td><b>Present Continuous Marker</b></td></tr>
		<tr><td>Colloquial dialects add a specific prefix—usually \uFE91 e.g. بِيِدْرُس / قَاعِد يِدْرِس / عَم يِدْرُس</td></tr>
		<tr><td><b>The Letter Qaf (ق)</b></td></tr>
		<tr><td>It is heavily modified, most commonly into a glottal stop or /g/ sound e.g. ئول (ool) ; قول (ool / gool)</td></tr>
		</tbody>
	</table>
	`;
}

function getMorphologyChart(){
	return `
	<p style="direction:ltr;">علم الصرف (Arabic Morphology or Sarf) is the foundational Arabic linguistic science that studies the internal structure, patterns, and transformations of individual words.</p>
	<div style="display:flex;justify-content:center;width:100%">
	<pre style="direction:ltr;
	            font-family:monospace;
				font-size:14px;
				text-align:left;
				white-space:pre-wrap;
				word-wrap:break-word;
				max-width: 100%; ">
[ROOT]
  ├───[Verb Forms]
  │     ├───[Basic: Forms I to X]	   
  │     ├───[Extended: Forms XI to XV]
  │     └───[Quadriliteral: Forms I to IV]
  │
  ├───[Verbal Noun Forms]         
  │     ├── [Active Participle Forms]
  │     └── [Passive Participle Forms]
  │
  └───[Noun Forms]
        ├───[Irregular Forms]
        ├───[Four-Letter Nouns]
        └───[Regular Forms] 
               ├───[Noun of Instrument]
               ├───[Noun of Place]
               ├───[Comparative]
               ├───[Hyperbole]  
               └───[Diminutive]      
</pre></div>`;
}

function getGrammarChart(){
	return `
	<p style=\"direction:ltr;\">علم النحو (Arabic Syntax) is the science of classical Arabic grammar that studies how to connect nouns, verbs, and particles to form correct sentences.</p>
	<div style="display:flex;justify-content:center;width:100%">
	<pre style="direction:ltr;
	            font-family:monospace;
				font-size:14px;
				text-align:left;
				white-space:pre-wrap;
				word-wrap:break-word;
				max-width: 100%; ">
[WORD]
  └─[Part Of Speech]
      ├──[اسم]
      |    ├───[Type]
      |    |     ├──[مُعرب مُنصَرِف] Declinable
      |    |     ├──[مُعرب غيرُ مُنصَرِف] Foreign
      |    |     ├──[مُبني] Indeclinable
      |    |     └──[Five Nouns]
      |    ├───[Gender]
      |    |     ├────[مُذكّر] Masculine
      |    |     └────[مُؤنّث] Feminine
      |    ├───[Number]
      |    |     ├────[مُفرَد] Singular
      |    |     ├────[مُثنَّي] Dual
      |    |     └────[جَمع] Plural
      |    |            ├────[سالِم] Sound
      |    |            └────[مُكسّر] Broken
      |    └───[Case Endings]
      |          ├────[رَفْع] Nominative
      |          ├────[نَصْب] Accusative
      |          └────[جَرْ] Genitive
      ├────[فعل] Verb
      |     ├───[Case]
      |     |     ├────[رَفْع] Subjective
      |     |     ├────[نَصْب] Objective
      |     |     └────[جَزْم] Jussive
      |     ├───[Type]
      |     |     ├────[Tense]
      |     |     |       ├────[مضارع]
      |     |     |       └────[ماضي]
      |     |     ├────[Weak Verbs]
      |     |     ├────[Inadequate Verbs]
      |     |     ├────[Transitive/Intransitive]
      |     |     ├────[Transmutability
      |     |     └────[Nuances in Meaning
      |     ├───[Voice]
      |     |     ├────[معروف] Known/Active
      |     |     └────[مجهول] Unknown/Passive
      |     ├───[Conjugation]
      |     |     ├────[Form I]
      |     |     ├────[Forms II to X]
      |     |     ├────[Forms XI to XV]
      |     |     ├────[Quadriliteral]
      |     |     └────[Five Verbs]
      |     └───[Verbal Nouns]
      └────[حرف]
            ├───[Particles]
            ├───[Adverbs]
            └───[Exceptions & Exclusions]
[COMPUND]
  ├─[مركب الاضافي] Possesive Construction
  ├─[مركب التوصيفي] Adjectival Construction
  ├─[مركب الجاري] Prepositional Construction
  └─[مركب الإشاري] Demonstrative Construction
[PHRASE]
  ├─[Prepositional Phrases]
  └─[Proverbs]
[SENTENCE]
  ├─[Declarative]
  ├─[Non-Declarative]
  ├─[Parenthetical]
  ├─[Affirmative]
  ├─[Negative]
  └─[Interrogative]
`;
}