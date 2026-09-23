//
//	Author: munawwar_ali@yahoo.com
//

function processSelectedWordPos(word, cb){
	getPosLookups()
	.then((lookups)=>{
		var apiObj = lookups.apiObj;
		var w = word;	
		var w2 = apiObj.removeDiacritics(w);
		
		//console.log(`w:${w}, w2:${w2}`);
		var pronouns = [], nouns = [], verbs = [], particles = [], prefixes = [], suffixes = [];

		var res = procObviousNounEndings(w, w2, apiObj);
		nouns = res.res; w = res.w; w2 = res.w2;

		if(w !== '')
		{
			prefixes = ['ب', 'ف', 'و', 'ل', 'ال','أل', 'ٱل'] //'ك'
			.filter(x => w2.match(`^${x}`) && !w2.endsWith("ا"));

			if(prefixes.length > 0){
				w = removePrefix(w, prefixes[0]);
				w2 = apiObj.removeDiacritics(w);
				//console.log(`w:${w}, w2:${w2}`);

				if(prefixes.filter(x => x == 'ف' || x == 'ب' || x == 'ل').length > 0){
					res = procObviousPronouns(w, w2, apiObj, lookups);
					pronouns = res.res; w= res.w; w2=res.w2;

					if(pronouns.length > 0 && (pronouns[0] == w2 || pronouns[0] == 'ى')){
						particles.push(prefixes[0]+pronouns[0]);
						prefixes = [];
						pronouns = [];
						w = '';
					} else if(w2 == 'ي' || w2 == 'ى'){
						particles.push(prefixes[0]+w2);
						prefixes = [];
						w = '';
					}
				}
				else if(prefixes.filter(x => x == 'أل' || x == 'ال' || x == 'ٱل').length > 0){
					if(w2 == 'له'){
						w = 'ا'+w2;
					}
					nouns.push(w);
					w = '';
				}
			}

			if(w != ''){
				if(prefixes.length == 0){
					var res = procObviousParticles(w, w2, apiObj, lookups); 
					particles = res.res; w = res.w; w2 = res.w2;
				}

				if(w != ''){
					res = procObviousPronouns(w, w2, apiObj, lookups);
					pronouns = [...pronouns,...res.res]; w= res.w; w2=res.w2;

					if(w != '' && prefixes.length == 0 && particles.length == 0){
						res = procObviousParticles(w, w2, apiObj, lookups); 
						particles = res.res; w = res.w; w2 = res.w2;
					}
				}
			}

			if(w != ''){
				if(nouns.length == 0 && verbs.length == 0)
				{
					// Nooun prefix
					if(w.startsWith('يَٰ') || w2.startsWith('يا')){
						prefixes.push('يا');
						w = removePrefix(w, 'يَٰ');
						w = removePrefix(w, 'يا');
						nouns.push(w);
						w = '';
					}

					if(pronouns.length > 0 && pronouns[0].startsWith('ك')){
						nouns.push(w);
						w = '';
					}

					var verbPrefix = ['ي','ت','ا'].filter(x => w2.startsWith(x));
					var verbSuffix1 = ["ون", "ان", "ين", "ن"].filter(x => w2.endsWith(x));
					var verbSuffix2 = ["ني", "تني", "نا", "ت"].filter(x => w2.endsWith(x));

					if(w != '' && verbPrefix.length > 0 && pronouns.length > 0)
					{
						var r = removePrefix(w, verbPrefix[0])
						r = apiObj.removeDiacritics(r);
						if(r.length < 3 && pronouns[0] == "ي"){
							w += pronouns[0];
							pronouns = [];
							verbs.push(w);
							w = '';
						}
						else if(r.length >= 3){
							w += pronouns[0];
							verbs.push(w);
							w = '';
						} 
					}
					if(w != '' && verbPrefix.length >0 && verbSuffix1.length >0){
						var r = removePrefix(w, verbPrefix[0]);
						r = removeSuffix(w, verbSuffix1[0]);
						if(apiObj.removeDiacritics(r).length > 2){
							verbs.push(w);
							w ='';
						} 
					}
					if(w != '' && verbPrefix.length==0 && verbSuffix2.length > 0){
						var r = removeSuffix(w, verbSuffix2[0]);
						if(apiObj.removeDiacritics(r).length > 2){
							verbs.push(w);
							w = '';
						}
					}
					if(w != ''){
						if(particles.length > 0 || prefixes.length > 0){
							nouns.push(w);
							w = '';
						}
						else{
							suffixes = ["ون", "ان", "ين", "ات", "تي", "ةَ"].filter(x => w2.endsWith(x));
							if(suffixes.length > 0){
								nouns.push(removeSuffix(w2, suffixes[0]));
								if(suffixes[0] !== "تي" && suffixes[0] !== "ةَ"){
									nouns.push("plural");
								}
								w = '';
							}
							else{
								nouns.push(w);
								nouns.push('noun or verb');
								w = '';
							}
						}
					}
				}
			}
		}

		if(cb)cb({
			word: word,
			prefixes: prefixes,
			suffixes: suffixes,
			verbs: verbs,
			nouns: nouns,
			pronouns: pronouns,
			particles: particles
		});
	});
}

function procObviousPronouns(w, w2, apiObj, lookups){
	var pr = lookups.pronouns.map(x => x.replaceAll('ـ',''))
			.filter(x => w.endsWith(x) || 
						w2.endsWith(apiObj.removeDiacritics(x)));

	if(pr.length > 0){
		w = removeSuffix(w2, apiObj.removeDiacritics(pr[0]));
		w2 = apiObj.removeDiacritics(w);
		//console.log(`w:${w}, w2:${w2}`);
	}

	return {w:w, w2:w2, res: pr};
}

function procObviousParticles(w, w2, apiObj, lookups){
	var part = lookups.particles
	.filter(x => w == x || apiObj.removeDiacritics(w) == (apiObj.removeDiacritics(x)));

	if(part.length > 0){
		w = removeWord(w, part[0]);
		w2 = apiObj.removeDiacritics(w);
		//console.log(`w:${w}, w2:${w2}`);
	}
	return {w:w, w2:w2, res: part};
}

function procObviousNounEndings(w, w2, apiObj){
	// check for obvious noun endingd
	var nouns = [];
	var nounEndings = ["ًا", "ً", "ٌ", "ٍ", '\u065E', "\u064E\u06E2ا"].filter(x => w.endsWith(x));
	if(nounEndings.length > 0){
		w = removePrefix(w, nounEndings[0]);
		w2 = apiObj.removeDiacritics(w);
		//console.log(`w:${w}, w2:${w2}`);

		nouns.push(w);
		if(nounEndings[0].endsWith("\u064E\u06E2ا") || nounEndings[0].endsWith("ًا"))
		{
			nouns.push("masdar");
		}else{
			nouns.push("munsarif");
		}
	}
	return { w: w, w2: w2, res: nouns};
}

function makeErabOptional(str, opt){
  var regEx = "";
  if(!str) return regEx;
  for (const code of str) {
	if(!(0x0600 <= code <= 0x06FF)){
		regEx += `${code}?`;
	}else{
		regEx += code;
	}
  };
  return opt == 'pfx' ? `^(${regEx})`:
		 opt == 'sfx' ? `(${regEx})$`:
		 opt == 'word'? `^(${regEx})$`: `(${regEx})`;
}

function removeWord(word, str){
	var w = word;
	if(w){
		return w.replace('\u06E1','')
			.replace(new RegExp(makeErabOptional(str.replace('\u06E1',''), 'word'),"g"), '');
	}
	return word;
}

function removePrefix(word, prefix){
	var w = word;
	if(w){
		return w.replace(new RegExp(makeErabOptional(prefix, 'pfx'),"g"), '');
	}
	return word;
}

function removeSuffix(word, suffix){
	var w = word;
	if(w){
		return w.replace(new RegExp(makeErabOptional(suffix, 'sfx'),"g"), '');
	}
	return word;
}