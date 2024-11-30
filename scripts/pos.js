//
//	Author: munawwar_ali@yahoo.com
//

class posAPI {
	
	static posRules = {};
	constructor(path, callback){
		var cb = callback;
		var posUrl = path+'data/grmr/pos.json'
		loadJsonData(posUrl, function(data){
			posAPI.posRules = data;
			if(cb) cb("loaded");
		}, function(err){
			if(cb) cb("error", err);
		});	
	} 
	
	#P2Root(w, pInfo){
		var rootMatches = [...w.matchAll(new RegExp(pInfo.exp,"g"))];
		if(rootMatches != null && rootMatches.length > 0)
			return rootMatches[0].splice(2).join('');
		return null;
	}

	#P2Word(w, pInfo, pattern)
	{
		var p = pattern ?? pInfo.form;
		if(pInfo.rootexp){
			var rootMatches = [...w.matchAll(new RegExp(pInfo.exp,"g"))];
			var patterMatches = [...p.matchAll(new RegExp(pInfo.exp,"g"))];
			if(rootMatches != null && patterMatches != null && 
				rootMatches.length > 0 && patterMatches.length>0){
				return this.#replaceKalima(w, pInfo, p);
			}
		}
		return w;
	}

	#changeWord(word, pInfo, p1, p2)
	{
		var w = this.#P2Word(word, pInfo);
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
	
	#replaceRootWords(cnjPattern, pattern, rexp){
		if(rexp){
			var exp = new RegExp(rexp, "g");
			var matches = [...pattern.matchAll(exp, "g")];
			if(matches != null && matches.length > 0){
				var m2 = this.#removeErab(matches[0][1]);
				var cnj2 = cnjPattern.replace('\$', m2);
				return this.#removeRedundantErabs(cnj2, true);
			}
		}
		return pattern;
	}
	
	#removeErab(pattern){
		var exp = "([ًٌٍَُِْ])$";
		var p = pattern.replace(new RegExp(exp,"g"), "");
		return p;
	}
	
	#removeRedundantErabs(pattern, erabOnly){
		var illlatRules = posAPI.posRules["illat"];
		var flag, applied = [];
		var w = pattern;
		
		if(illlatRules && illlatRules.length > 0){
			illlatRules.every(function(rule)
			{
				//if(erabOnly && rule.ar !== "إعراب"){
				//	return false;
				//}
				flag = false;
				var index = 0;
				if(rule.exp && rule.exp.length > 0)
				{
					rule.exp.every(function(p)
					{
						if(pattern.match(p)){
						 flag = true;
						 w = w.replace(new RegExp(p,"g"), rule.rexp[index]);
						}
						index++;
						return true;
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
	  
	  /*
	  var res = pattern;
	  [
		{"exp": new RegExp("([ًٌٌ])([\\u0621-\\u064A])(.+)$", ""), rexp: "$2$3"},
		{"exp": new RegExp("([ًٌٌ])([َُِْ])", ""), rexp: "$2"},
		{"exp": new RegExp("([َُِْ])([َُِْ])", ""), rexp: "$1"}
	  ]
	  .every(function(p){
		  if(pattern.match(p.exp)){
			  res = res.replace(p.exp, p.rexp);
		  }
		  return true;
	  });
	  return res;
	  */

	#P2Conjugate(word, pInfo, cnj){
		var output = [];
		var pattern = cnj.includes('$') ? this.#replaceRootWords(cnj, pInfo.form, pInfo.exp):cnj;
		return this.#replaceKalima(word, pInfo, pattern);
	}

	#replaceKalima(word, pInfo, pattern){
		var root = this.#P2Root(word, pInfo);
		var patternRoot = this.#P2Root(pInfo.form, pInfo);
		var xPatttern = this.#replaceKalimaWithXyz(pattern, patternRoot);
		return this.#replaceXyzWithKalima(xPatttern, root);
	}

	#replaceKalimaWithXyz(pattern, root){
		var xyz = "xyzq";
		var outPattern = pattern;
		if(root){
			for(let i=0; i < root.length; i++){
				outPattern = outPattern.replace(root[i], xyz[i]);
			}
		}
		return outPattern;
	}

	#replaceXyzWithKalima(pattern, root){
		var xyz = "xyzq";
		var outPattern = pattern;
		if(root){
			for(let i=0; i < root.length; i++){
				outPattern = outPattern.replace(xyz[i], root[i]);
			}
		}
		return this.#removeRedundantErabs(outPattern, true);
	}

	

	#makeRafa(w, pInfo){
		return this.#P2Word(w, pInfo);
	}

	#makeNasb(w, pInfo){
		return this.#changeWord(this.#P2Word(w, pInfo), pInfo, 'َ','اً');
	}

	#makeJar(w, pInfo){
		return this.#changeWord(this.#P2Word(w, pInfo), pInfo, 'ِ','ٍ');
	}

	#makeJazm(w, pInfo){
		return this.#changeWord(this.#P2Word(w, pInfo), pInfo,'ْ');
	}

	#newConjugation(container, currentTable, index, conjugations, word, xform){
		var id = 'conj-'+currentTable+'-'+index;
		
		if(xform.pos == "verb"){
			var cnjTable = '<table id="'+id+'" class="cnjTable"><tr>'+
								 '<th rowspan="6">'+xform.en+'<br/>'+xform.ar+'</th>'+
								 '<th style="font-size: 14px;">Person</th>'+
								 '<th style="width: 50px;">واحد</th>'+
								 '<th style="width: 50px;">مثنى</th>'+
								 '<th style="width: 50px;">جمع</th></tr>'+
								 this.#prepareConjVerbRows( word, xform, conjugations)+
							'</table>';
			container.append($(cnjTable));
		}
		else if (xform.pos == "noun"){
			var cnjTable = '<table id="'+id+'" class="cnjTable"><tr>'+
								 '<th rowspan="5">'+xform.en+'<br/>'+xform.ar+'</th>'+
								 '<th style="font-size: 14px;">Person</th>'+
								 '<th style="width: 50px;">واحد</th>'+
								 '<th style="width: 50px;">مثنى</th>'+
								 '<th style="width: 50px;">جمع</th></tr>'+
								 this.#prepareConjNounRows( word, xform, conjugations)+
							'</table>';
			container.append($(cnjTable));
		}else{
			//todo
		}
		return id;
	}
	
	#addConjugations(currentTable, word, xform, conjugations, index){
		//add headers
		var hDiv = $("#conj-"+currentTable);
		hDiv.append($('<span style="padding:4px;"><a style="font-size:14px;margin:auto; padding-left:10px;" href="#1" '+
		   'onclick="toggleConjugationTable(\'#conj-'+currentTable+'\','+index+');">Hide ('+xform.en+')</a></span>'
		));
		
		var container = $("#grp-"+currentTable);
		this.#newConjugation(container, currentTable, index, conjugations, word, xform);
	}
	
	#conjugate(currentTable, word, xform, index){
		
		var conjugations = posAPI.posRules["conjugations"];
		if(xform.pos == "verb"){
			if(xform.en.startsWith("past ")){
				this.#addConjugations(currentTable, word, xform, conjugations.verb_past_rafa, index);
			}else if(xform.en === ("present (passive)")){ 
				this.#addConjugations(currentTable, word, xform, conjugations.verb_present_passive, index);
			}else if(xform.en === ("present (active)")){ 
				this.#addConjugations(currentTable, word, xform, conjugations.verb_present_active, index);
			}
		}else if(xform.pos == "noun"){
			this.#addConjugations(currentTable, word, xform, conjugations.noun_rafa, index);
		}
	}
	
	#prepareConjVerbRows(word, xform, conjugations){
		return '<tr><td>غائب (مذكّر)</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["3m"][0])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["3m"][1])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["3m"][2])+'</td>'+
				'</tr>' + 
				'<tr><td>غائب (مؤنّث)</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["3f"][0])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["3f"][1])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["3f"][2])+'</td>'+
				'</tr>' + 
				'<tr><td>حاضر (مذكّر)</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["2m"][0])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["2m"][1])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["2m"][2])+'</td>'+
				'</tr>' + 
				'<tr><td>حاضر (مؤنّث)</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["2f"][0])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["2f"][1])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["2f"][2])+'</td>'+
				'</tr>' + 
				'<tr><td>مُتكلّم</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["1"][0])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["1"][1])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["1"][2])+'</td>'+
				'</tr>';
	}
	
	#prepareConjNounRows(word, xform, conjugations){
		return '<tr><td>مذكّر</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["m"][0])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["m"][1])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["m"][2])+'</td>'+
				'</tr>' + 
				'<tr><td>مؤنّث</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["f"][0])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["f"][1])+'</td><td>'+
						this.#P2Conjugate(word, xform, conjugations["f"][2])+'</td>'+
				'</tr>';
	}
	
	#newTable(tableCount, container){
		var id = 'wt'+tableCount;
		
		var alink = '<div id="grp-'+id+'" style="display:flex;flex-direction:column;flex-wrap:wrap;justify-content:center;">'+
					   '<div id="div-'+id+'" style="margin-top: 8px;background-color:#A9C581;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;"></div>'+
					   '<table id="'+id+'" class="wTable"><tr>'+
								 '<th style="font-size: 14px;">Pattern</th>'+
								 '<th style="width: 50px;">رفع</th>'+
								 '<th style="width: 50px;">نصب</th>'+
								 '<th style="width: 50px;">جر</th>'+
								 '<th style="width: 50px;">جزم</th>'+
								 '<th>صيغة</th>'+
								 '<th style="font-size: 14px;">PoS</th>'+
								 '</tr></table>'+
					'<div id="conj-'+id+'" style="margin-bottom: 8px;background-color:#ffc133;display:flex;flex-direction:row;flex-wrap:wrap;justify-content:center;"></div>'+
					'</div>';
		container.append($(alink));
		return id;
	}
	
	#addHeaders(list){
		var div = $("#div-"+list.table);
		div.prepend($('<span style="padding:4px;">'+list.word+'</span>'));
		div.prepend($('<span style="padding:4px;">('+list.pos+')</span>'));
		div.prepend($('<span style="padding:4px;">('+list.form+')</span>'));
		div.prepend($('<span style="padding:4px;"> '+list.meta["key"]+' </span>'));
		div.prepend($('<span style="padding:4px;"><a style="font-size:14px;margin:auto; padding-left:10px;" href="#1" '+
		   'onclick="toggleConjugations(\''+list.table+'\');">Conjugations</a></span>'));
		div.prepend($('<span style="padding:4px;"><a style="font-size:14px;margin:auto; padding-left:10px;" href="#2" '+
		   'onclick="toggleTableDiv(\''+list.table+'\');">Hide</a></span>'));
	}
	
	#addParsedWords(currentTable, curPos, parseInfo){
		
		var row = '<tr><td>'+parseInfo.xform.form+'</td>';
		if(parseInfo.xform.pos === "verb"){
			row = row+ '<td>'+parseInfo.parse[0]+'</td>'+ 
					   '<td>'+(parseInfo.parse[1] ?? parseInfo.parse[0])+'</td>'+
					   '<td></td>'+
					   '<td>'+(parseInfo.parse[2] ?? parseInfo.parse[0])+'</td>';
		}else if(parseInfo.xform.pos === "noun"){
			row = row+ '<td>'+parseInfo.parse[0]+'</td>'+ 
					   '<td>'+parseInfo.parse[1]+'</td>'+
					   '<td>'+parseInfo.parse[2]+'</td>'+
					   '<td></td>';
		}else{
			//todo
		}
		
		row = row+ '<td><span style="font-size: 16px;">'+parseInfo.xform.ar+'</span></td>'+
				   '<td><span style="font-size: 12px;">'+parseInfo.xform.en+'</span></td>'+
				   '</tr>';
		$("#"+currentTable+" tbody").append($(row));
	}
	
	#hideColumns(list){
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
	
	analyzeWord(word){
		var apiInstance = this;
		var result={
			parseOutput: []
		};
		for (const keyVal of Object.entries(posAPI.posRules)){
			var patternInfo = keyVal[1];
			
			if(patternInfo.ignore == true || keyVal[0] == "conjugations" || keyVal[0] == "illat"){
				continue;
			}
			
			var canSkip = false;
			if(patternInfo.skip){
				patternInfo.skip.every(function(exp){
					if(word.match(new RegExp(exp, 'ig'))){
						canSkip = true;
						return false;
					}
					return true;
				});
			}
			
			if(!canSkip){
				for (const mKeyVal of Object.entries(patternInfo.matches)){
					var parseInfo = [];
					var entryName = mKeyVal[0];
					var matchInfo = mKeyVal[1];
					var aword = word;
					
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
						if(matchInfo.xforms){
							var isMatch = false;
							matchInfo.xforms.every(function(xform){
								var match = aword.match(new RegExp(xform.exp, 'ig'));
								if(match != null){
									isMatch = true;
									return false;
								}
								return true;
							});
							
							if(isMatch){
								matchInfo.xforms.every(function(xform){
									
									xform.rootExp = matchInfo.rootExp;
									var parseOut = {
										"word": aword,
										"xform": xform,
										"meta":{ "key": entryName},
										"parse": [],
										"conj": []
									};
									if(xform.pos === "verb"){
										if(xform.en.startsWith("past ")){
											parseOut.parse.push(apiInstance.#P2Word(aword, xform));
										}else{
											parseOut.parse.push(apiInstance.#makeRafa(aword, xform)); 
											parseOut.parse.push(apiInstance.#makeNasb(aword, xform)); 
											parseOut.parse.push(apiInstance.#makeJazm(aword, xform));
										}
									}else if(xform.pos === "noun"){
										parseOut.parse.push(apiInstance.#makeRafa(aword, xform)); 
										parseOut.parse.push(apiInstance.#makeNasb(aword, xform)); 
										parseOut.parse.push(apiInstance.#makeJar(aword, xform));
									}else{
										//todo: harf
									}
									parseInfo.push(parseOut);
									return true;									
								 });
							}
						}
					}
					
					if(parseInfo.length>0)
						result.parseOutput.push(parseInfo);
				}
			}
		}
		return result;
	}
	
	addHtml(container, result, addConjugations){
		var api = this;
		container.empty();
		
		if(result.parseOutput == undefined || result.parseOutput.length == 0){
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
				//curPos = newPos;
				//curEn = newEn;
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
					api.#conjugate(currentTable,  kv[1].word, curXForm, conjugationCount);
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
