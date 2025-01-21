//
//	Author: munawwar_ali@yahoo.com
//

class posSearch {
	
	static posSearchMetadata = {};
	
	constructor(path, callback)
	{
		var cb = callback;
		var thisInstance = this;
		loadHtmlData(path+'data/arabiclt/all-words.csv', function(data)
		{
			var csvData = loadCsvTable(data, false);
			csvData.every(function(row, i){
				if(i > 0){
					var columns = row.replace('\r','')
									 .replace('\n','')
									 .replaceAll(' ','').split(',');
					thisInstance.#addSearchWord(lightenWord(columns[0]), 
								  lightenWord(columns[1]),
								  lightenWord(columns[2]),
								  lightenWord(columns[3]),
								  lightenWord(columns[4])
					);
				}
				return true;
			});
			if(cb) cb("loaded");
		}, error => { if(cb) cb("error", error); });
	}
	
	#addSearchWord(word, wordType, plurals, synonyms, antonyms){
		
		if(! posSearch.posSearchMetadata[wordType]){
			posSearch.posSearchMetadata[wordType] = { 
				words: [], 
				plurals: [], 
				antonyms: []
			};
		}
		posSearch.posSearchMetadata[wordType].words.push(word);
		posSearch.posSearchMetadata[wordType].plurals.push(plurals);
		posSearch.posSearchMetadata[wordType].antonyms.push(antonyms);
	}
	
	#findWordInfo(word){
		var w = lightenWord(word);
		var ret = { found: false, info: [] };
		if(word === "")
			return ret;
		for (let [key, value] of Object.entries(posSearch.posSearchMetadata)) {
			let isAntonym = false;
			var index = value.words.indexOf(w);
			if(index === -1){
				index = value.plurals.findIndex(x => x && x.includes(w));
			}
			if(index === -1){
				index = value.antonyms.findIndex(x => x && x.includes(w));
				if(index > -1) isAntonym = true;
			}
			if(index > -1){
				ret.found = true;
				if(!isAntonym){
					ret.info.push({
						pos: key,
						word: value.words[index],
						plurals: value.plurals[index],
						antonyms: value.antonyms[index],
						matchType: "word"
					});
				}else{
					ret.info.push({
						pos: key,
						word: word,
						synonyms: value.antonyms[index],
						matchType: "antonym"
					});
				}
			}
		}
		return ret;
	}
	
	#addAnalysisLink(txt){
		var ret = "";
		if(txt){
			var parts = txt.trim().split(';');
			parts.every(function(p){
				ret += '<a href="#" '+
						'style="text-decoration: none;" '+
						'onclick="loadWord(\''+p+'\');">'
						+p+'&nbsp;</a>';
				return true;
			});
			return ret;
		}
		return txt;
	}
	
	searchWord(word)
	{
		return this.#findWordInfo(word);
	}
	
	searchAndAddHtml(word, container)
	{
		var thisInstance = this;
		var res = this.#findWordInfo(word);
		if(res.found){
			container.empty();
			var table = '<table class="pTable">'+
						'<tr style="background-color:#ACE892;font-size:14px;"><th>(لفظ) Word</th><th>PoS</th><th>(تفاصيل) Details</th></tr>';
			if(res.info){
				res.info.every(function(metaInfo){
					table += '<tr><td>'+metaInfo.word+'</td>'+
							 '<td>&nbsp;&nbsp;'+metaInfo.pos+'&nbsp;&nbsp;</td>'+
							 '<td>&nbsp;';
					if(metaInfo.plurals && metaInfo.plurals.trim() !== ''){
						table += '<span><b style="font-size:14px;">(جمع) Plurals</b><br/>&nbsp;&nbsp;'+
						thisInstance.#addAnalysisLink(metaInfo.plurals)+
						'</span><br/>'
					}
					if(metaInfo.synonyms && metaInfo.synonyms.trim() !== ''){
						table += '<span><b style="font-size:14px;">(المرادفات) Synonyms</b><br/>&nbsp;&nbsp;'+
						thisInstance.#addAnalysisLink(metaInfo.synonyms)+
						'</span><br/>'
					}
					if(metaInfo.antonyms && metaInfo.antonyms.trim() !== ''){
						table += '<span><b style="font-size:14px;">(المتضادات) Antonyms</b><br/>&nbsp;&nbsp;'+
						thisInstance.#addAnalysisLink(metaInfo.antonyms)+
						'</span><br/>'
					}					
					table += '&nbsp;</td></tr>';
					return true;
				});
				table += '</table>';
			}
			container.append($(table));
		}
		else{
			container.html('Did not find any match!');
		}
	}
}
