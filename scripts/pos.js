//
//	Author: munawwar_ali@yahoo.com
//

class posAPI {
	
	static posRules = {};
	constructor(path, callback)
	{
		var cb = callback;
		ensureDataLoaded({name: "posRulesData"})
		.then((data, isFromCache) => 
		{
			posAPI.posRules = data;
			if(cb) cb("loaded", false, isFromCache);
		},
		(err) => {
			if(cb) cb("error", err);
		});
	} 
	
	#P2Root(w, pInfo, options = {})
	{
		var rootMatches = [...w.matchAll(new RegExp(options.xRoot ?? options.nounExp ?? pInfo.exp,"g"))];
		if(rootMatches != null && rootMatches.length > 0)
			return rootMatches[0].splice(2).join('');
		return null;
	}

	#P2Word(w, pInfo, options = {})
	{
		var p = options.pattern ?? pInfo.form;
		if(pInfo.rootExp){
			var rootMatches = [...w.matchAll(new RegExp(options.xRoot ?? options.nounExp ?? pInfo.exp,"g"))];
			var patternMatches = [...p.matchAll(new RegExp(pInfo.exp,"g"))];
			if(rootMatches != null && patternMatches != null && 
				rootMatches.length > 0 && patternMatches.length>0){
				return this.#replaceKalima(w, pInfo, p, options);
			}
		}
		return w;
	}

	#changeWord(word, pInfo, p1, p2)
	{
		var w = this.#P2Word(word, pInfo);
		if(w !== null){
			if (pInfo.pos == "verb"){
				if(pInfo.en.startsWith("past")){
					return "-";
				}
				if(p1 && !w.endsWith(p1))
					w = w.replace(new RegExp("[َُِ]$","g"),'')
						 .replace(new RegExp("$","g"), p1);
				return this.#removeRedundantErabs(w);
			}
			if(p2 && !w.endsWith(p2))
				w = w.replace(new RegExp('[ًٌٍ]', "g"), '')
					 .replace(new RegExp("$","g"), p2);
			return this.#removeRedundantErabs(w);
		}
		return w;
	}
	
	#replaceRootWords(cnjPattern, pattern, rexp)
	{
		if(rexp){
			var exp = new RegExp(rexp, "g");
			var matches = [...pattern.matchAll(exp, "g")];
			if(matches != null && matches.length > 0){

				if(cnjPattern.includes('\$1') || cnjPattern.includes('\$2') || cnjPattern.includes('\$3')){
					var cnj2 = cnjPattern.replace('\$1', matches[0][2])
										 .replace('\$2', matches[0][3])
										 .replace('\$3', matches[0][4]);
					return this.#removeRedundantErabs(cnj2, true);					
				}
				else if(cnjPattern.includes('\$')){
					var xyz = this.#removeErab(matches[0][1]);
					var cnj2 = cnjPattern.replace('\$', xyz);
					return this.#removeRedundantErabs(cnj2, true);	
				}
			}
		}
		return pattern;
	}
	
	#removeErab(pattern, removeAll=false)
	{
		// \u064B: ً (Arabic Fathatan)
		// \u064C: ٌ (Arabic Dammatan)
		// \u064D: ٍ (Arabic Kasratan)
		// \u064E: َ (Arabic Fatha)
		// \u064F: ُ (Arabic Damma)
		// \u0650: ِ (Arabic Kasra)
		// \u0651: ّ (Arabic Shaddah)
		// \u0652: ْ (Arabic Sukun)
		// \u06E1: ۡ (Arabic Small High Dotless Head of Khah)
		// \u0657: Arabic Inverted Damma (Vowel)
		// \u064E: Arabic Inverted Fatha (Vowel)
		// \u0650: Arabic Inverted Kasrah (Vowel)

		var exp = removeAll ? 
		"([\u064B\u064C\u064D\u064E\u064F\u0650\u0651\u0652\u06E1\u0657\u064E\u0650])" : 
		"([\u064B\u064C\u064D\u064E\u064F\u0650\u0652])$";
		var p = pattern.replaceAll(new RegExp(exp,"g"), "");
		return p;
	}
	
	#removeRedundantErabs(pattern, erabOnly)
	{
		var illlatRules = posAPI.posRules["illat"];
		var flag, applied = [];
		var w = pattern;
		
		if(illlatRules && illlatRules.length > 0){
			illlatRules.every(function(rule)
			{
				if(rule.ignore === true){
					return true;
				}
				flag = false;
				if(rule.exp && rule.exp.length > 0)
				{
					rule.exp.every(function(p, index)
					{
						var continueLoop = true;
						var rexp = rule.rexp[index];
						if(rexp.startsWith("#")){
							rexp = rexp.substring(1);
							continueLoop = false;
						}
						
						if(pattern.match(p)){
						 flag = true;
						 w = w.replace(new RegExp(p,"g"), rexp);
						}else{
							continueLoop  = true;
						}
						return continueLoop;
					});	
				}
				if(flag){
					applied.push(rule.ar);
				}
				return true;
			});
		}
		return w;
	}

	#P2Conjugate(word, pInfo, options, cnj, plural=false)
	{
		if(plural === false || pInfo.plurals === undefined || pInfo.plurals.length === 0){
			var output = [];
			var pattern = cnj.includes('$') ? 
				this.#replaceRootWords(cnj, pInfo.form, pInfo.exp):cnj;
			return this.#replaceKalima(word, pInfo, pattern, options);
		}else{
			var output = [];
			var pattern = cnj.includes('$') ? 
				this.#replaceRootWords(cnj, pInfo.plurals[0].form, pInfo.plurals[0].exp)
				:cnj;
			return this.#replaceKalima(word, pInfo, pattern, options);
		}
	}

	#replaceKalima(word, pInfo, pattern, options)
	{
		var root = options.xRoot ?  options.xRoot : this.#P2Root(word, pInfo, options);
		if(!root){
			console.log("Error: root is null; word: ("+ word + "), pattern:(" + pattern + ") options:" + options);
		}
		var patternRoot = this.#P2Root(pInfo.form, pInfo);
		if(!patternRoot){
			console.log("Error: patternRoot is null; word: ("+ word + "), pattern:(" + pattern + ") options:" + options);
		}
		var xPatttern = this.#replaceKalimaWithXyz(pattern, patternRoot);
		return this.#replaceXyzWithKalima(xPatttern, root);
	}

	#replaceKalimaWithXyz(pattern, root)
	{
		var xyz = "xyzpqr";
		var outPattern = pattern;
		if(root){
			for(let i=0; i < root.length; i++){
				outPattern = outPattern.replace(root[i], xyz[i]);
			
				if(i == root.length-1){
					if(outPattern.includes('p')){
						outPattern.replace('p', xyz[i]);
					}
				}
			}
		}
		return outPattern;
	}

	#replaceXyzWithKalima(pattern, root)
	{
		var xyz = "xyzpqr";
		var outPattern = pattern;
		if(root){
			for(let i=0; i < root.length; i++){
				outPattern = outPattern.replace(xyz[i], root[i]);
			}
		}
		return this.#removeRedundantErabs(outPattern, true);
	}
	
	#makeRafa(w, pInfo, options)
	{
		return this.#P2Word(w, pInfo, options);
	}

	#makeNasb(w, pInfo, options)
	{
		if(pInfo.type === undefined || pInfo.type === 1)
			return this.#changeWord(this.#P2Word(w, pInfo, options), pInfo, 'َ','اً');
		return w;
	}

	#makeJar(w, pInfo, options)
	{
		if(pInfo.type === undefined || pInfo.type === 1)
			return this.#changeWord(this.#P2Word(w, pInfo, options), pInfo, 'ِ','ٍ');
		return w;
	}

	#makeJazm(w, pInfo, options)
	{
		return this.#changeWord(this.#P2Word(w, pInfo, options), pInfo,'ْ');
	}
	
	#createVerbConjugations(conjugations, word, xform, options){
		return [
			this.#P2Conjugate(word, xform, options, conjugations["3m"][0]),
			this.#P2Conjugate(word, xform, options, conjugations["3m"][1]),
			this.#P2Conjugate(word, xform, options, conjugations["3m"][2]),
			
			this.#P2Conjugate(word, xform, options, conjugations["3f"][0]),
			this.#P2Conjugate(word, xform, options, conjugations["3f"][1]),
			this.#P2Conjugate(word, xform, options, conjugations["3f"][2]),
			
			this.#P2Conjugate(word, xform, options, conjugations["2m"][0]),
			this.#P2Conjugate(word, xform, options, conjugations["2m"][1]),
			this.#P2Conjugate(word, xform, options, conjugations["2m"][2]),
			
			this.#P2Conjugate(word, xform, options, conjugations["2f"][0]),
			this.#P2Conjugate(word, xform, options, conjugations["2f"][1]),
			this.#P2Conjugate(word, xform, options, conjugations["2f"][2]),
			
			this.#P2Conjugate(word, xform, options, conjugations["1"][0]),
			this.#P2Conjugate(word, xform, options, conjugations["1"][1]),
			this.#P2Conjugate(word, xform, options, conjugations["1"][2])
		];
	}
	
	#createNounConjugations(conjugations, word, xform, options)
	{
		return [
			this.#P2Conjugate(word, xform, options, conjugations["m"][0]),
			this.#P2Conjugate(word, xform, options, conjugations["m"][1]),
			this.#P2Conjugate(word, xform, options, conjugations["m"][2], true),

			this.#P2Conjugate(word, xform, options, conjugations["f"][0]),
			this.#P2Conjugate(word, xform, options, conjugations["f"][1]),
			this.#P2Conjugate(word, xform, options, conjugations["f"][2], true)
		];
	}
	
	#createConjugations(data, options)
	{
		var conjugations = this.#getConjugationTable(
			posAPI.posRules["conjugations"],
			data.meta,
			data.xform.pos,
			data.xform.en
		);
		
		if(data.xform.pos == "verb"){
			 return this.#createVerbConjugations(conjugations, data.word, data.xform, options);
		}
		else if (data.xform.pos == "noun"){
			 return this.#createNounConjugations(conjugations, data.word, data.xform, options);
		}else{
			return [];
		}
	}
	
	#prepareConjVerbRows(conjugations)
	{
		var alink = `
		<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
		return `<tr><td>غائب (مذكّر)</td>
					<td>${alink.replaceAll('$',conjugations[0])}</td>
					<td>${alink.replaceAll('$',conjugations[1])}</td>
					<td>${alink.replaceAll('$',conjugations[2])}</td>
				</tr>
				<tr><td>غائب (مؤنّث)</td>
					<td>${alink.replaceAll('$',conjugations[3])}</td>
					<td>${alink.replaceAll('$',conjugations[4])}</td>
					<td>${alink.replaceAll('$',conjugations[5])}</td>
				</tr>
				<tr><td>حاضر (مذكّر)</td>
					<td>${alink.replaceAll('$',conjugations[6])}</td>
					<td>${alink.replaceAll('$',conjugations[7])}</td>
					<td>${alink.replaceAll('$',conjugations[8])}</td>
				</tr>
				<tr><td>حاضر (مؤنّث)</td>
					<td>${alink.replaceAll('$',conjugations[9])}</td>
					<td>${alink.replaceAll('$',conjugations[10])}</td>
					<td>${alink.replaceAll('$',conjugations[11])}</td>
				</tr>
				<tr><td>مُتكلّم</td>
					<td>${alink.replaceAll('$',conjugations[12])}</td>
					<td>${alink.replaceAll('$',conjugations[13])}</td>
					<td>${alink.replaceAll('$',conjugations[14])}</td>
				</tr>`;
	}
	
	#prepareConjNounRows(conjugations, xform)
	{
		var alink = `
		<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
		if(xform.gender === undefined){
			return `<tr><td>مذكّر</td>
						<td>${alink.replaceAll('$',conjugations[0])}</td>
						<td>${alink.replaceAll('$',conjugations[1])}</td>
						<td>${alink.replaceAll('$',conjugations[2])}</td>
					</tr>
					<tr><td>مؤنّث</td>
						<td>${alink.replaceAll('$',conjugations[3])}</td>
						<td>${alink.replaceAll('$',conjugations[4])}</td>
						<td>${alink.replaceAll('$',conjugations[5])}</td>
					</tr>`;
		}else{
			var g = xform.gender == "m" ? "مذكّر" :"مؤنّث";
			return `<tr><td>${g}</td>
						<td>${alink.replaceAll('$',conjugations[0])}</td>
						<td>${alink.replaceAll('$',conjugations[1])}</td>
						<td>${alink.replaceAll('$',conjugations[2])}</td>
					</tr>`;
		}
	}
	
	#newConjugation(container, currentTable, index, conjugations, xform)
	{
		var id = 'conj-'+currentTable+'-'+index;
		var table = (xform.pos === "verb") ?
						this.#prepareConjVerbRows(conjugations):
					(xform.pos === "noun") ?
						this.#prepareConjNounRows(conjugations, xform):
						"";
		var heading  = (xform.pos === "verb") ? (xform.en+'<br/>'+xform.ar):
												 xform.ar+'<br/>('+xform.form+')';
		if(table !== ""){
			var cnjTable = `<table id="'${id}'" class="cnjTable">
							<tr>
								<th rowspan="6">${heading}</th>
								<th style="font-size: 14px;">Person</th>
								<th style="width: 50px;">واحد</th>
								<th style="width: 50px;">مثنى</th>
								<th style="width: 50px;">جمع</th>
							</tr>
								${table}
							</table>`;
			container.append($(cnjTable));
		}
		return id;
	}
	
	#addConjugations(currentTable, xform, conjugations, index)
	{
		//add headers
		var hDiv = $("#conj-"+currentTable);
		hDiv.append($(`
				<span style="padding:4px;">
					<a style="font-size:14px;margin:auto; padding-left:10px;" href="#1" '+
		   			   onclick="toggleConjugationTable(
					   	'#conj-#{currentTable}',
						'${index}');">Hide ('${xform.en}')
					</a>
				</span>`
		));
		
		var container = $("#grp-"+currentTable);
		this.#newConjugation(container, currentTable, index, conjugations, xform);
	}
	
	#getConjugationTable(conjugations, meta, pos, pos2)
	{
		if(pos === "noun"){
			return conjugations.noun_rafa;
		}
		else if(pos === "verb"){ 
			if(pos2 === ("present (passive)")){
				var key = 'verb_present_passive_' + meta["key"].split(' ')[1];
				if(conjugations[key])
					return conjugations[key];
				return conjugations["verb_present_passive_I"];
			}
			else if(pos2 === ("present (active)")){
				var key = 'verb_present_active_' + meta["key"].split(' ')[1];
				if(conjugations[key])
					return conjugations[key];
				return conjugations["verb_present_active_I"];
			}
			else if(pos2.startsWith("past (active)")){
				var key = 'verb_past_active_' + meta["key"].split(' ')[1];
				if(conjugations[key])
					return conjugations[key];
				return conjugations["verb_past_active_I"];
			}
			else if(pos2.startsWith("past (passive)")){
				var key = 'verb_past_passive_' + meta["key"].split(' ')[1];
				if(conjugations[key])
					return conjugations[key];
				return conjugations["verb_past_passive_I"];
			}
		}
		return null;
	}
	
	#newTable(tableCount, container){
		var id = 'wt'+tableCount;
		var alink = `<div id="grp-${id}" style="display:flex;flex-direction:column;flex-wrap:wrap;justify-content:center;">
					   <div id="div-${id}" style="margin-top: 8px;background-color:#A9C581;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;"></div>
					   <table id="${id}" class="wTable">
					   	<tr>
							<th style="font-size: 14px;">Pattern</th>
							<th style="width: 50px;">رفع</th>
							<th style="width: 50px;">نصب</th>
							<th style="width: 50px;">جر</th>
							<th style="width: 50px;">جزم</th>
							<th>صيغة</th>
							<th style="font-size: 14px;">PoS</th>
						</tr>
					</table>
					<div id="conj-${id}" style="margin-bottom: 8px;background-color:#ffc133;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;"></div>
					</div>`;
		container.append($(alink));
		return id;
	}
	
	#addHeaders(list)
	{
		var div = $("#div-"+list.table);
		div.prepend($(`<span style="padding:4px;">${list.word}</span>`));
		div.prepend($(`<span style="padding:4px;">(${list.pos})</span>`));
		div.prepend($(`<span style="padding:4px;">(${list.form})</span>`));
		if(list.meta["key"].startsWith("Form "))
			div.prepend($(`<span style="padding:4px;">${list.meta["key"]}</span>`));
		div.prepend($(`
					<span style="padding:4px;">
						<a  style="font-size:14px;margin:auto; padding-left:10px;" href="#1"
							onclick="toggleConjugations('${list.table}');">
							Conjugations
						</a>
					</span>`
					));
		div.prepend($(`
				<span style="padding:4px;">
					<a  style="font-size:14px;margin:auto; padding-left:10px;" href="#2"
		   				onclick="toggleTableDiv('${list.table}');">
						Hide
					</a>
				</span>`));
	}
	
	#addParsedWords(currentTable, curPos, parseInfo)
	{
		var alink = `
		<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
		var row = `<tr><td>${parseInfo.xform.form}</td>`;
		if(parseInfo.xform.pos === "verb"){
			row = `${row}
				   <td>${alink.replaceAll('$', parseInfo.parse[0])}</td> 
				   <td>
						${(parseInfo.parse[1] ?
							alink.replaceAll('$', parseInfo.parse[1]) :
							alink.replaceAll('$', parseInfo.parse[0]))}
				   </td>
				   <td></td>
				   <td>
				   		${(parseInfo.parse[2] ?
							alink.replaceAll('$', parseInfo.parse[2]) :
							alink.replaceAll('$', parseInfo.parse[0]))}
				   </td>`;
		}else if(parseInfo.xform.pos === "noun"){
			row = `${row}
					<td>${alink.replaceAll('$',parseInfo.parse[0])}</td> 
					<td>${alink.replaceAll('$',parseInfo.parse[1])}</td>
					<td>${alink.replaceAll('$',parseInfo.parse[2])}</td>
					<td></td>`;
		}
		
		row = `${row}
					<td>
						<span style="font-size: 16px;">${parseInfo.xform.ar}</span>
					</td>
					<td><span style="font-size: 12px;">${parseInfo.xform.en}</span>
					</td>
				</tr>`;
		$("#"+currentTable+" tbody").append($(row));
	}
	
	#hideColumns(list)
	{
		// Hide ver/noun specific columns
		var table = document.getElementById(list.table);
		const RAFA = 1, NASAB = 2,JARR = 3, JAZM = 4;
		for (const kv of Object.entries(table.rows)){
			var row = kv[1];
			if(list.pos === "verb"){
				row.cells[JARR].classList.toggle("hidden");
			}else if(list.pos === "noun"){
				row.cells[JAZM].classList.toggle("hidden");
			}else{
				row.cells[RAFA].classList.toggle("hidden");
				row.cells[NASAB].classList.toggle("hidden");
				row.cells[JARR].classList.toggle("hidden");
				row.cells[JAZM].classList.toggle("hidden");
			}
		}
	}
	 
	#findRootFromConjTable(word, cnjTable){
		
		var root = null;
		var thisInstance = this;
		cnjTable.every(function(pattern){
			var p = thisInstance.#removeErab(pattern, true)
					    .replace('\$1\$2\$3','$');
			if(p.includes('$1')	|| p.includes('$2') || p.includes('$3')){
				var pfx='', sfx='', afix='';
				if(p[0] !== '$') pfx = p.replace('$1','X').split('X')[0];
				if(p[p.length-2] !== '$'){
					var t = p.replace('$3','X').split('X');
					if(t.length > 0) sfx = t[t.length-1];
				}
				affix = p.replace(pfx, '').replace(sfx,'').replace('$1','').replace('$3','').replace('$2','');
				var r = word.replace(pfx,'').replace(sfx,'').replace(affix,'');
				if(r.length === 3){
					root = r;
					return false;
				}			
			}else if (p.includes('$')){
				var tokens = p.split('$').filter(x=>x !== "");
				var pfx = '', sfx = '';
				var t = 0;
				if(p[0] !== '$'){
					pfx = tokens[t];t++;
				}
				
				//replace root kalimat with xyz
				var xyz = word.substr(t, 3);
				var aword = word.replace(xyz, 'xyz');
				
				if(p[p.length-1] !== '$') {
					sfx = tokens[t];t++;
				}
				
				var r = aword.replace(pfx, '').replace(sfx, '');
				if(r.length === 3){
					root = r.replace('xyz', xyz);
					return false;
				}
			}
			return true;
		});
		return root;
	}
	
	#findRootFromConjugaions(word, pos, en){
		if(pos === "verb"){
			var keyStr = "verb_"+en.replace(' ', '_')
								   .replace('(','')
								   .replace(')','');
			for (const kv of Object.entries(posAPI.posRules.conjugations)){
				if(kv[0].startsWith(keyStr)){
					var cnjTable = [];
					for (const v of Object.entries(kv[1])){
						cnjTable = cnjTable.concat(v[1]);
					}
					return this.#findRootFromConjTable(word, cnjTable);
				}		
			}
		}else if(pos === "noun"){
			var keyStr = "noun_";
			for (const kv of Object.entries(posAPI.posRules.conjugations)){
				if(kv[0].startsWith(keyStr)){
					var cnjTable = [];
					for (const v of Object.entries(kv[1])){
						cnjTable = cnjTable.concat(v[1]);
					}
					return this.#findRootFromConjTable(word, cnjTable);
				}		
			}
		}
		return null;
	}
	
	getNounInfo(){
		var res = {};
		for (const keyVal of Object.entries(posAPI.posRules)){
			if(keyVal[0] === "Nouns"){
				var patternInfo = keyVal[1]["matches"];
				for (const mKeyVal of Object.entries(patternInfo)){
					var entryName = mKeyVal[0];
					if(entryName.startsWith('N')){
						var matchInfo = mKeyVal[1];
						res[entryName] = matchInfo;
					}
				}
			}
		}
		return res;
	}
	
	addNounInfoHtml(container, res){
		var api = this;
		container.empty();
		var filters = [];
		var nTable = $(`<table id="nTable" class="nTable">
						<tr>
						 <th style="font-size: 22px;">اسم (واحد)${getPinIcon('nTable',' tbody:first',parent.document)}</th>
						 <th style="font-size: 22px;">جمع (مكسّر)</th>
						 <th style="font-size: 14px;">Example</th>
						 <th style="font-size: 14px;">Type</th>
					   </table>`);
		container.append(nTable);
		
		var alink = `
		<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
		for (const keyVal of Object.entries(res)){
			var entryName = keyVal[0];
			var values = keyVal[1];
			if(values){							   
				var row = "";
				var counter = 0;
				var rowSpan = values.xforms.length;
				values.xforms.every(function(xform){
					row = row + '<tr>';
					row = row + `<td>${alink.replaceAll('\$',xform.form)}</td>`;
					if(xform.plurals && xform.plurals.length > 0){
						var plurals = xform.plurals.map(x=>alink.replaceAll('$', x.form)).join('<br/>');
						row = row + `<td>${plurals}</td>`;
					}
					else
						row = row + '<td>-</td>';
					
					if(xform["e.g."]){
						var example = replaceQLink(xform["e.g."].join('<br/>'));
						row = row +`<td>${example}`;	
						if(xform["e.g."].length <= 1) row = row + '<br/>';
					}else{
						row = row +'<td><br/>';	
					}			
					//Add Ai search link
					var prompt = getPromptFromKey(['Word-Patterns'], 
									{'0': [
										values.en,
										xform.form,
										xform.plurals.map((x)=>x.form).join("\n"),

									]}, false);
					row = row +`<a href="#" style="cursor:pointer;font-size: 14px;"
								onclick="openGoogleAISearch(\`${prompt}\`);">More</a></td>`;

					//Add noun type
					row = row +`<td>${values.ar}<br/>${values.en}</td>`;
					row = row +'</tr>';
					
					var oval = values.ar+' - '+values.en;
					if(filters.indexOf(values.ar+' - '+values.en) === -1){
						filters.push(values.ar+' - '+values.en);
					}
					counter++;
					return true;
				});
				$("#nTable tbody").append($(row));
			}
		}
		
		// Add filter drop down
		if (filters.length > 0) {
			container.prepend($(getListButtinWithSelect(`
				<select class="nFilter" onchange="filterTableRows('#nTable', 4, $('.nFilter').val().replace(' - ',''), 'all')">
  				<option value="all">Show All</option>
  				${
					filters.map(n => `<option value="${n}"><b>${n}</b></option>`).join('')
				}
				</select>
			`, 'nFilter', 'noun-pat')));
			$('.nFilterBtn').css('width', $('.nFilter').css('width'));
		}
	}

	getVerbInfo(key="V1"){
		var res = {};
		for (const keyVal of Object.entries(posAPI.posRules)){
			if(keyVal[0] === key){
				var patternInfo = keyVal[1]["matches"];
				for (const mKeyVal of Object.entries(patternInfo)){
					var entryName = mKeyVal[0];
					if(entryName.startsWith('Form ')){
						var matchInfo = mKeyVal[1];
						res[entryName] = {
							xform: matchInfo.xforms,
							nuance: matchInfo.nuance
						};
					}
				}
			}
		}
		return res;
	}
	
	addVerbInfoHtml(exData, container, res, key, flag){
		var api = this;

		if(flag === undefined){
			container.empty();
		}

		var title = key == 'V1' ? 'Trilateral Verbs (المزيد)' : 
			key == 'V2' ? 'Qaudrilateral Verbs (الرباعي)' :
			key == 'V3' ? 'Extended Verbs' :  '';;

		var alink = `
		<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
		var cmpLink = `
		<a href="#" style=" text-decoration: none" onclick="showVerbComparisions(@);">$</a>`;
		var vTable = $(`
			<table id="vTable${key[1]}" class="vTable">
			${ title ? 
				`<tr><td colspan="5">${title}${getPinIcon(`vTable${key[1]}`,' tbody:first',parent.document)}</td></tr>
				 <tr><td id="tdForm${key[1]}" colspan="5">
				 	<a style="text-decoration:none" href="#" 
					onclick="$('#vTable${key[1]} tr[id*=_ex]').toggle();
					         $('#vTable${key[1]} tr[id*=_notes]').toggle();
							 $(this).text().trim() == 'Ex(-)' ?
							 	$(this).text('Ex(+)'):
								$(this).text('Ex(-)');
							 setTimeout(function(){
							  $('#vTable${key[1]}')[0].scrollIntoView();
							 }, 10);">
				Ex(-)</a>&nbsp;
				</td></tr>`:
				''
			}
			<tr>
				<th style="font-size: 14px;">Form</th>
				<th>Nuance</th>
				<th>المعروف</th>
				<th>المجهول</th>
				<th>الاسم</th>
			</tr>
			</table>`);
		container.append(vTable);
		
		var index = 0;
		for (const keyVal of Object.entries(res)){
			var entryName = keyVal[0];
			var xform = keyVal[1].xform;
			var nuance = keyVal[1].nuance;
			if(xform){
				var ap = xform.filter(x=>x.en==="active participle")
									   .map(x=>x.form);
				var pp = xform.filter(x=>x.en==="passive participle")
									   .map(x=>x.form);
				var vn = xform.filter(x=>x.en==="verbal noun")
									   .map(x=>x.form);
				var pst = xform.filter(x=>x.en.startsWith("past "))
									   .map(x=>x.form);
				if(pst.length === 0) pst = ["?", "?"];
				var prt = xform.filter(x=>x.en.startsWith("present "))
									   .map(x=>x.form);								   
				
				var promptLink = `<a href="#" style="font-size:11px;"
						onclick="openGoogleAISearch(
							getPromptFromKey(['VerbConjugation'], 
								{'0': ['${entryName}','YYY (ZZZ)']}), true)"
						>WWW</a>`;
				
				var formNumber = entryName.split(' ')[1];
				$(`#tdForm${key[1]}`).append($(`
					<a style="margin-right:10px;text-decoration:none" href="#form${formNumber}">${formNumber}</a>`));
				var row = `
					<tr id="form${formNumber}">
						<td>
						${cmpLink.replaceAll('\$', formNumber).replaceAll('@', index)}
						</td>
						<td>
						${ 
							nuance && nuance.length >0 ? 
							nuance.filter(x=>x[0] != '#').map(x=>`<sub>${x}</sub>`).join('<br/>'):'-'
						}
						</td>
						<td>
							${cmpLink.replaceAll('\$',pst[0]+' - '+ prt[0]).replaceAll('@', index)}
							<br/>
								${promptLink.replace("WWW", "Present")
											  .replace("YYY", prt[0])
									          .replace("ZZZ", "المضارع المعروف")}
								&nbsp;-&nbsp;
								${promptLink.replace("WWW", "Past")
											  .replace("YYY", pst[0])
									          .replace("ZZZ", "الماضي المعروف")}
						</td>
						${(pst.length > 1) ?
							`<td>
							${alink.replaceAll('\$',pst[1])+' - '+alink.replaceAll('\$',prt[1])}
							<br/>
								${promptLink.replace("WWW", "Present")
								 			 .replace("YYY", prt[1])
									         .replace("ZZZ", "المضارع المجهول")}
								&nbsp;-&nbsp;
								${promptLink.replace("WWW", "Past")
											 .replace("YYY", pst[1])
									         .replace("ZZZ", "الماضي المجهول")} 
							</td>`
							:'<td>-</td>'
						}
						<td>
						${alink.replaceAll('\$',vn[0])}<sub>&nbsp;(مصدر)</sub>
						${(ap.length > 0) ?
							`<br/>${alink.replaceAll('\$',ap[0])}&nbsp;<sub>(اسم الفاعل)</sub>`:
							''
						}
						${(pp.length > 0) ?
							`<br/>${alink.replaceAll('\$',pp[0])}&nbsp;<sub>(اسم المفعول)</sub>`:
							''
						}
						</td>
					</tr>`;

				//Add Examples and notes
				var exKey = `${key}_${entryName.split(' ')[1]}`;	
				var notes = exData[exKey] ? exData[exKey].notes : undefined;
				if(notes){
					row += `<tr id="form${formNumber}_notes">
					<td><a style="text-decoration:none;" href="#">[↑]</a></td>
					<td colspan="4" style="font-size:14px;background-color:#ffffe0;direction:ltr">
					${notes.map(x => x).join("<br/>")}
					</td></tr>`;
				}
				var examples = exData[exKey] ? exData[exKey].examples : undefined;
				if(examples){
					row += `<tr id="form${formNumber}_ex">
					<td colspan="5" style="background-color:#F5F5F5"><u style="font-size:12px;">Examples</u><br/>
					${
						examples.map(x => replaceQLink(x)).join("<br/>")
					}
					<br/>&nbsp;
					</td></tr>`;
				}
				$(`#vTable${key[1]} tbody`).append($(row));
				index++;
			}
		}
	}
	
	getParticleInfo(){
		var res = {};
		for (const keyVal of Object.entries(posAPI.posRules)){
			if(keyVal[0] === "Harf"){
				var patternInfo = keyVal[1]["matches"];
				for (const mKeyVal of Object.entries(patternInfo)){
					
					if(mKeyVal[0] !== "ignore"){
						var matchInfo = mKeyVal[1];
						res[mKeyVal[0]] = matchInfo;
					}
				}
			}
		}
		return res;
	}
	
	addParticleInfoHtml(container, res){
		var api = this;
		container.empty();
		var filters = [];
		var nTable = $(`<table id="pTable" class="pTable">
						<tr>
						 	<th style="font-size: 22px;">حرف</th>
						 	<th style="font-size: 22px;">Meaning</th>
						 	<th style="font-size: 14px;">Type</th>
					   </table>`);
		container.append(nTable);
		
		var alink = `
		<a href="#" style=" text-decoration: none" onclick="checkWord('$');">$</a>`;
		for (const keyVal of Object.entries(res)){
			var entryName = keyVal[0];
			var values = keyVal[1];
			if(values){							   
				var row = "";
				var counter = 0;
				var rowSpan = values.words.length;
				
				//Add notes
				if(values.notes){
					row = `
						<tr style="font-size:18px;">
							<td style="background-color:#F6F6BA;" colspan="3">
								${values.notes}
							</td>
							<td>${values.ar}<br/>${values.en}</td>
							</td>
						</tr>`;
				}
				values.words.every(function(w){
					row = row + '<tr>';
					row = row + `<td>${alink.replaceAll('\$',w)}</td>`;
					
					var ex = "";
					if (values["e.g."] && values["e.g."][counter]){
						ex = replaceQLink(values["e.g."][counter]);
					}
					var prompt_link = `<a href="#" style="font-size:10px;" 
					    onclick="openGoogleAISearch(getPromptFromKey(['Prepositions'], 
								{'0': ['${values.ar} (${values.en}', '${w}']}, true));">More</a>`;

					row = row + `<td>${alink.replaceAll('\$',values["en-words"][counter])+ex}
								 <br>${prompt_link}</td>`;
					row = row + `<td>${values.ar}<br/>${values.en}</td>`;
					row = row +'</tr>';
					
					var oval = values.ar+' - '+values.en;
					if(filters.indexOf(values.ar+' - '+values.en) === -1){
						filters.push(values.ar+' - '+values.en);
					}
					counter++;
					return true;
				});
				$("#pTable tbody").append($(row));
			}
		}
		
		// Add filter drop down
		if(filters.length > 0){
			var sel = `
				<select class="nFilter"
							onchange="filterTableRows('#pTable', 3, $('.nFilter').val().replace(' - ',''), 'all')">
						<option value="all">Show All</option>
						${
							filters.map((n) => {
								return `<option value="'${n}'"><b>${n}</b></option>`
							})
						}
				</select>
			`;
			container.prepend($(getListButtinWithSelect(sel, 'nFilter', 'prep')));
			$('.nFilterBtn').css('width', $('.nFilter').css('width'));
		}
	}

	addMetonymyHtml(container, res){
		var api = this;
		container.empty();
		var filters = [];
		var index = 0;
		$.each(res, function(key, value){
			index++;
			if(filters.indexOf(value.ar+' - '+value.en) === -1){
				filters.push(value.ar+' - '+value.en);
			}
			var nTable = $(`
			<table id="mTable${index}" class="mTable">
				<tr style="background-color:#F6F6BA;font-size:18px;">
					<th style="font-size: 22px;">
						${value.ar}<br/>${value.en}
						${getPinIcon(`mTable${index}`,' tbody:first',parent.document)}
					</th>
				</tr>
			</table>`);
			container.append(nTable);
			$.each(value.words, function(wkey, wvalue){
				nTable.append(
				`<tr><td style="background-color:#ACE892;"><b>${wvalue.ar}&nbsp;&nbsp;${wvalue.en}</b></td></tr>
				<tr><td style="background-color:#ACE892;"><b>${wvalue.structure}</b></td></tr>
				<tr><td style="direction:ltr">Examples:<br/>
				${
					wvalue.examples.map(ex => `
						${replaceQLink(ex)}</br/>
				    `).join('')+`
					<br/>
					<a href="#" style="font-size:11px;" 
					   onclick="openGoogleAISearch(getPromptFromKey(['Metonymy'],
					   	{'0': ['${wvalue.ar} ${wvalue.en}']}));">More</a>`
				}</td></tr>`);
			});
		});

		// Add filter drop down
		index = 0;
		if(filters.length > 0){
			index++;
			var sel = `
				<select class="nFilter"
							onchange="filterMTableRows('mTable', $('.nFilter').prop('selectedIndex'), $('.nFilter').val().replace(' - ',''))">
						<option value="all">Show All</option>
						${
							filters.map((n) => {
								return `<option value="'${n}'"><b>${n}</b></option>`
							})
						}
				</select>
			`;
			container.prepend($(getListButtinWithSelect(sel, 'nFilter', 'metonymy')));
			$('.nFilterBtn').css('width', $('.nFilter').css('width'));
		}
	}

	getMetonymies(d){
		var res = [];
		for (const keyVal of Object.entries(posAPI.posRules)){
			if(keyVal[0] === "Metonymies"){
				res = posAPI.posRules[keyVal[0]];
			}
		}

		if(d){ //return data when inline call
			return Object.assign({}, ...$.map(res, function(value) {
				var obj = {};
				obj[value.ar] = value.words.map(x=>x.examples).flat();
				return obj;
			}));
		}
		return res;
	}

	getPerpPhraseInfo(){
		var res = [];
		for (const keyVal of Object.entries(posAPI.posRules)){
			if(keyVal[0] === "PrepPhrases"){
				res = keyVal[1]["phrases"];
			}
		}
		return res;
	}

	addPrepPhrasesInfoHtml(container, res){
		var api = this;
		container.empty();
		var filters = [];
		var nTable = $(`
			<table id="pTable" class="pTable">
				<tr>
					<th style="font-size: 22px;directoin:rtl;">
						Prepositional Phrases
					</th>
				</tr>
			</table>`);
		container.append(nTable);
		
		for (const keyVal of res){
			var id = false;
			var text = keyVal;
			if(keyVal.startsWith("K|")){
				id = true
				text = keyVal.substring(2);
			}
			var keys =  text.split("|");	
			var enText = keys[0];
			var arText = keys[1];
			if(text){							   
				if(id == true){
					if(filters.indexOf(text) === -1){
						filters.push(text);
					}
				}
				var row = "";;
				row = row + '<tr>';
				row = row + `<td>${arText}<br/>${enText}
					${id==true?`
					<br/><a href="#" style="font-size:11px" 
					     onclick="openGoogleAISearch(
						    getPromptFromKey(['PrepPhrase'],{'0': ['${arText}']}, true))">Miore</a>
					`:''}</td>`;
				row = row +'</tr>';
				$("#pTable tbody").append($(row));
			}
		}
		
		// Add filter drop down
		if(filters.length > 0){
			var sel = `
				<select class="nFilter" 
					  	onchange="filterTableRows('#pTable', -1, $('.nFilter').val(), 'all', true)">
					  	<option value="all">Show All</option>
						${
							filters.map((n) => {
								var keys =  n.split("|");	
								return `<option value="${keys[1]}"><b>${keys[1]} - ${keys[0]}</b></option>`
							})
						}
				</select>
			`;
			container.prepend($(getListButtinWithSelect(sel, 'nFilter', 'prep-ph')));
			$('.nFilterBtn').css('width', $('.nFilter').css('width'));
		}
	}
	
	analyzeWord(word, addConjugates){
		var apiInstance = this;
		var result={
			parseOutput: []
		};
		var word2 = apiInstance.#removeErab(word, true);
		word2 = removePunctuations(removeAlPrefix(word2));
		for (const keyVal of Object.entries(posAPI.posRules)){
			var patternInfo = keyVal[1];
			
			if(patternInfo.ignore == true || keyVal[0] == "conjugations" || keyVal[0] == "illat"){
				continue;
			}
			
			var canSkip = false;
			if(patternInfo.skip){
				patternInfo.skip.every(function(exp){
					if(word2.match(new RegExp(exp, 'ig'))){
						canSkip = true;
						return false;
					}
					return true;
				});
			}
			
			if(!canSkip && patternInfo.matches){
				for (const mKeyVal of Object.entries(patternInfo.matches)){
					var parseInfo = [];
					var entryName = mKeyVal[0];
					var matchInfo = mKeyVal[1];
					var aword = word2;
					
					if(matchInfo.ignore == true){
						continue;
					}
					
					canSkip = false;
					if(matchInfo.skip){
						matchInfo.skip.every(function(exp){
							if(aword.match(new RegExp(exp, 'ig'))){
								canSkip = true;
								return false;
							}
							return true;
						});
					}
					
					if( !canSkip){
						var xInfo = null;
						var xRoot = null;
						if(matchInfo.xforms){
							var isMatch = false;
							//var matchPos = '';
							matchInfo.xforms.every(function(xform){
								var match = aword.match(new RegExp(xform.exp, 'ig'));
								if(match != null){
									isMatch = true;
									xInfo = xform;
									//matchPos = xform.pos;
									xRoot = apiInstance.#P2Root(aword, xform, {});
									return false;
								}
								return true;
							});
							
							if(isMatch){
								matchInfo.xforms.every(function(xform){
									
									xform.rootExp = matchInfo.rootExp ?? xform.rootExp;
									if(!xform.pos) xform.pos = matchInfo.pos;
									if(!xform.en) xform.en = matchInfo.en;
									if(!xform.ar) xform.ar = matchInfo.ar;
									var parseOut = {
										"word": aword,
										"xform": xform,
										"meta":{ "key": entryName},
										"parse": [],
										"conj": []
									};
									
									if(xform.pos === "verb"){
										if(xform.en.startsWith("past ")){
											parseOut.parse.push(apiInstance.#P2Word(aword, xform, xInfo ? {nounExp: xInfo.exp}: {xRoot: xRoot}));
										}else{
											parseOut.parse.push(apiInstance.#makeRafa(aword, xform, xInfo ? {nounExp: xInfo.exp}: {xRoot: xRoot})); 
											parseOut.parse.push(apiInstance.#makeNasb(aword, xform, xInfo ? {nounExp: xInfo.exp}: {xRoot: xRoot})); 
											parseOut.parse.push(apiInstance.#makeJazm(aword, xform, xInfo ? {nounExp: xInfo.exp}: {xRoot: xRoot}));
										}
									}else if(xform.pos === "noun"){
										parseOut.parse.push(apiInstance.#makeRafa(aword, xform, xInfo ? {nounExp: xInfo.exp}: {xRoot: xRoot})); 
										parseOut.parse.push(apiInstance.#makeNasb(aword, xform,xInfo ? {nounExp: xInfo.exp}: {xRoot: xRoot})); 
									parseOut.parse.push(apiInstance.#makeJar(aword, xform, xInfo ? {nounExp: xInfo.exp}: {xRoot: xRoot}));
									}else{
										//todo: harf
									}
									
									if(xInfo == null && parseOut.xform.pos == "noun"){
										xInfo = parseOut.xform;
									}else if(parseOut.xform.pos == "verb"){
										
									}
									if(parseOut.parse.length > 0)
											parseInfo.push(parseOut);
									return true;									
								 });
							}
						}
					}
					
					result.parseOutput.push(parseInfo);
					if(addConjugates){
						//var xInfo = parseInfo.filter(x=>x.xform.pos === "noun");
						parseInfo.every(function(pInfo){
							pInfo.conj = apiInstance.#createConjugations(pInfo, {xRoot: xRoot});
							return true;
						});
					}
				}
			}
		}
		return result;
	}
	
	addHtml(container, result, addConjugations){
		var api = this;
		container.empty();
		
		var any = result.parseOutput ? result.parseOutput.filter(x => x.length) : [];
		if(any.length == 0){
			container.html("No patterns matching!");
			return;
		}
		var tableCount = 0;
		var conjugationCount = 0;
		result.parseOutput.every(function(parseInfo){
			var tableList = [];
			var currentTable;
			var curXForm, first;
			for (const kv of Object.entries(parseInfo)){
				
				var newPos = kv[1].xform.pos;
				if(curXForm !== undefined && curXForm.pos !== newPos){
					currentTable = undefined;
					first = undefined;
					conjugationCount = 0;
				}
				curXForm = kv[1].xform;
				
				if(first == undefined)
					first = kv[1].analysis;
				if(currentTable == undefined){
					tableCount++;
					currentTable = api.#newTable(tableCount, container);
					tableList.push({
						"word": kv[1].word,
						"root": kv[1].xform.root,
						"form": kv[1].xform.form,
						"pos": curXForm.pos,
						"table": currentTable,
						"meta": kv[1].meta
					});
				}
				api.#addParsedWords(currentTable, curXForm.curPos, kv[1]);
				if(addConjugations){
					api.#addConjugations(currentTable, curXForm, kv[1].conj, conjugationCount);
					conjugationCount++;
				}
			}
			
			tableList.every(function(list){
				// Add heading
				api.#addHeaders(list);
				api.#hideColumns(list);
				toggleConjugations(list.table);
				return true;
			});
			return true;
		});
	}
	
	removeDiacritics(pattern)
	{
		return this.#removeErab(pattern, true);
	}
	
	applyPattern(word, pInfo){
		return this.#P2Conjugate(word, pInfo, {xRoot: word}, pInfo.form)
	}
}

function toggleConjugations(tableId, index){
	$("#conj-"+tableId).toggle();
	var display = $("#conj-"+tableId).css('display');
	if(display == 'none'){
		$("#grp-"+tableId+" .cnjTable").css('display', display);
		$.each($("#conj-"+tableId+" a"), function(i, val){	
			var txt = $(val).text(); 
			$(val).text(txt.replace("Hide ", "Show "));
		});
	}
}

function toggleConjugationTable(id, index){
	$(id+"-"+index).toggle();
	
	var alink = $(id+" a").eq(index);
	var text = alink.text();
	if(text.startsWith("Hide "))
		alink.text(text.replace("Hide ", "Show "));
	else
		alink.text(text.replace("Show ", "Hide "));
}

function toggleTableDiv(tableId){
	$("#"+tableId).toggle();
	
	var alink = $("#div-"+tableId+" a").eq(0);
	if(alink.text() == "Hide")
		alink.text("Show");
	else
		alink.text("Hide");
}

function makeImperative(pattern, gender){
	
	//remove 2nd person letters; ad dhamza al wasl
	var p = pattern.replace(/^[يت][َُِ]?/g, '');	
	var p = p.replace(/^([ء-ي])(?:(ْ|[ء-ي]))/g, 'ا$1$2');
	//remove erab
	return update2ndGender(p, gender);
}

function make2ndPerson(pattern, gender){

	var p = pattern.replace(/^[يت][َُِ]?/g, "ت");
	return update2ndGender(p, gender);
}

function update2ndGender(pattern, gender){
	if(gender == 'm')
		return pattern.replace(/(([ء-ي])[َُِ]?)$/g, '$2ْ');
	return pattern.replace(/(([ء-ي])[َُِ]?)$/g, '$2ِي');
}