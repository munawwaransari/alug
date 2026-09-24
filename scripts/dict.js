//
//	Author: munawwar_ali@yahoo.com
//

var lastSuggestionInput = undefined;
var dict = {};
var posAPIObj, cmpAPIObj, posSearchObj;
var dState = {};
var params = { "action": undefined, data: undefined };

window.onload = function () {

	params["action"] = decodeURI(getParamValue('action'));
	params["action"] = params["action"] == "undefined" ? undefined : params["action"];
	params["data"] = arRemovePunct(decodeURI(getParamValue('data')));
	params["data"] = params["data"] == "undefined" ? undefined : params["data"];

	posAPIObj = new posAPI(getLocationPath(), function (msg, err) {
		if (err) {
			console.log("Failed to initialize pos api");
			return;
		}
		parent.dataCache["API_POS"] = posAPIObj;
		posSearchObj = new posSearch(getLocationPath(), function (msg, err) {
			if (err) {
				console.log("Failed to initialize pos search api");
				return;
			}
			parent.dataCache["API_POS_SEARCH"] = posSearchObj;
			handleDictParams(undefined, params["action"], params["data"]);
		});
	});

	cmpAPIObj = new cmpAPI(getLocationPath(), function (msg, err) {
		if (err) {
			console.log("Failed to initialize cmp api");
			return;
		}
		if (params.action === 'cmp') {
			if(cmpAPIObj){
				handleDictParams(undefined, params["action"], params["data"]);
			}
			else{
				setTimeout(function(){
					handleDictParams(undefined, params["action"], params["data"]);
				}, 500);
			}
		}
	});

	autocomplete(document.getElementById('wordSearchText'), function (val, callback) {
		var condition = val.length > 1 && val !== lastSuggestionInput;
		if (val.length > 1 && val !== lastSuggestionInput) {
			lastSuggestionInput = val;
			getSuggesstions(val, callback);
		}
		return condition;
	});

	ensureDataLoaded({name: "all-words.csv", file: "all-words.csv"});
	ensureDataLoaded({name: "ai-prompts"});

	$("#wordSearchText").keyup(function (event) {
		if (event.keyCode === 13) {
			$("#SearchD").click();
		}
	});

	if (isOS('Android')) {
		$("img[src='images/kybd.jpg']").hide();
	}
}

function updateState(key, value) {
	dState[key] = value;
	for (const [k, v] of Object.entries(dState)) {
		$("#" + key + " button").text(v.ar);
		$("#" + key + " button").prop('title', v.en);
	}
}

function updateStateIndex(lst){
	if(lst){
		var st = parent.getStatesFromKey('dict.html');
		if(st.action){
			updateDictStates('dict.html', st.action, `pos:${$(lst).prop('selectedIndex')}`);
		}
	}
}

function updateDictStates(context, a, d){
	var dictState = parent.getStatesFromKey(context);
	a = a=="undefined" ? undefined: a;
	d = d=="undefined" ? undefined: d;
	var action = a!=undefined ? a : dictState["action"];
	var data = a!=undefined ? d : dictState["data"];
	var val = { action: action, data:data };
	parent.updateStatesKey(context, val);
	return val;
}

function getPosIndex(data, fallback = 0) {
	if (!data || !data.startsWith('pos:')) {
		return fallback;
	}
	var data2 = data.includes(" ") ? data.split(" ")[0] : data;
	var index = parseInt(data2.substring(4), 10);
	return Number.isFinite(index) ? index : fallback;
}

function triggerPosIndex(data, filterClass, callback, delay = 150) {
	var index = getPosIndex(data);
	if (data && data.startsWith('pos:')) {
		setTimeout(function () {
			if (callback) callback(index);
			else if (filterClass) selectIndexAndTrigger(index, filterClass);
		}, delay);
		return true;
	}
	return false;
}

function selectAndTrigger(data, filterClass) {
	var d = data ? data.toLowerCase() : data;
	if (triggerPosIndex(d, 'nFilter')) {
		return;
	}

	const select = document.getElementsByClassName(filterClass)[0];
	if(select){
		for (let i = 0; i < select.options.length; i++) {
			if (arRemovePunct(select.options[i].value).toLowerCase().includes(d)) {
				$("." + filterClass).val(select.options[i].value);
				$("." + filterClass).trigger('onchange');
			}
		}
	}
}

function selectIndexAndTrigger(index, filterClass) {
	const select = document.getElementsByClassName(filterClass)[0];
	var i = index < select?.options.length ? index : 0;
	$("." + filterClass).val(select?.options[i].value);
	$("." + filterClass).trigger('onchange');
}

function selectWord(text) {
	$("#wordSearchText").val(text);
	var inp = document.getElementById('wordSearchText');
	fireInputEvent(inp);
}

function searchWord() {
	var txt = $("#wordSearchText").val();
	getSuggesstions(txt);
}

function loadWord(txt) {
	if(txt && txt !== ''){
		$("#wordSearchText").val(txt);
		analyzeSelectedWord(txt);
	}
	else{
		$(".dictionary").html("No word specified!");
	}
}

function handleDictBack(){
	if(parent){
		var st = parent.getStatesFromKey("dict.html");
		if(st.prevState && st.prevState.length > 0){
			var ps = st.prevState.pop();
			handleDictParams(null, ps.action, ps.data);
		}
	}
}

function postHandleDictParams(el, action){
	if(action && parent.dataCache
		&& parent.dataCache["action-tags"] 
		&& parent.dataCache["action-tags"].data)
	{
		// Update Previous Title button
		var prev = $(".dropbtn.active");
		if(prev.length > 0){
			var prevAction = prev.attr('default_tag');
			if(prevAction){
				var defaultTitle = parent.dataCache["action-tags"].data[prevAction]?.default;
				if(defaultTitle) prev.text(defaultTitle);
			}
			prev.removeClass("active");
		}

		// Update Current Title button
		var curElement = el ?? $(`[action_tag=${action}]`)[0];
		if(curElement !== undefined){
			var current = $(curElement).parent().prev();
			if(current.prop('tagName') !== 'INPUT'){
				var arTitle = parent.dataCache["action-tags"].data[action]?.ar;
				var enTitle = parent.dataCache["action-tags"].data[action]?.en;
				if(arTitle){
					$(current).addClass("active"); 
					$(current).text(arTitle);
					$(current).attr('title', enTitle);
				}
			}
			toggleDropdownContent(current);		
		}
	}
}

function handleDictParams(el, a, d){
	ensureDataLoaded({name: "action-tags"})
	.then(() => {
		handleDictActions(el || $(`[action_tag=${a}]`)[0], a, d)
	});
}

function handleDictActions(el, a, d) {
	var st = parent.getStatesFromKey("dict.html");
	var action = a ?? st.action;
	var data = d ?? (st.data == "undefined" ? undefined : st.data);

	switch (action) {
		case 'defs':	
			if(data){
				listDefinitions(data);
			}
			else{
				listDefinitions();
			}
		break;

		case 'analyze':
		case 'conjugate':
			var txt = $("#wordSearchText").val().trim() ?? 
			          $("#wordSearchText").text().trim();
			var word = txt !== '' ? txt : (data?.startsWith("pos:") ? undefined: data);
			data = word;
			if(action == 'analyze')
				loadWord(data);
			else
				analyzeSelectedWordOld(data);
			break;

		case 'cause-effect':
			showCauseAndEffects();	
			break;

		case 'noun':
		case 'noun-pat':
			showNounTable();
			if (params["data"]) {
				selectAndTrigger(data, 'nFilter');
			}
			break;

		case 'five-verbs':
		case 'five-nouns':
			showFive(action);
			break;

		case 'pronoun':
			showPronounInfo('ism', 'ضَمائر', 'Pronouns');
			var sel = decodeURI(data);
			if (sel?.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				filterPronounView(index);
			}else{
				filterPronounView();
			}
			break;

		case 'metonymy':
			setTimeout(function () {
				showMetonymies();
				if (data)
					selectAndTrigger(data, 'nFilter');
			});
			break;

		case 'prep':
			setTimeout(function () {
				showParticleTable();
				if (params["data"])
					selectAndTrigger(data, 'nFilter');
			});
			break;

		case 'tease-ph':
		case 'proverb-ph':
		case 'prep-ph':
			showPrepPhrasesTable(action);
			if (data && data != '@Key') {
				if (data.startsWith("pos:")) {
					var index = parseInt(data.substring(4));
					setTimeout(function () {
						selectIndexAndTrigger(index, 'nFilter');
					}, 150);
				}
				else if(action !== "tease-ph"){
					var dat = arRemovePunct(data);
					data = 'pos:0';
					setTimeout(function () {
						var table = $('#pTable:visible');
						const exp1 = new RegExp("(?:^|[a-z\\s])"+dat+"(?:$|[a-z\\s])", 'ig');
						const exp2 = new RegExp("(?:^|[a-z\\s])"+'ال'+dat, 'ig');
						table.find('tr').filter(function (n, el) {
							if (!exp1.test(arRemovePunct($(el).text())) &&
						        !exp2.test(arRemovePunct($(el).text())))
								$(el).hide();
						});
						$(".nFilter").hide();
					},150);
				}
			}
			break;

		case 'verb':
			var pos = getPosIndex(data);
			var data2 = data.startsWith("pos:") && data.includes(" ") ? 
					data.split(" ") : data;
			if (data.startsWith("pos:")) {
				setTimeout(function () {
					showAllVerbTables(pos, data2.length > 1 ? data2[1] : undefined);
				}, 150);
			}
			else showAllVerbTables(pos); 
			break;

		case 'verb-3': showTriliteralVerbTable(); break;
		case 'verb-inad': showInadequateVerbTable(); break;
		case 'verb-weak': showWeakVerbTable(); break;
		case 'verb-imp': showImperativeTable(); break;
		case 'verb-type':
		case 'masdar':
		case 'obj-effect':
		case 'adj':
		case 'adv':
			setTimeout(function () {
				showObjectEffects(action);
				if (data) {
					if (!triggerPosIndex(data, 'pronounFilter')) {
						selectAndTrigger(data, 'pronounFilter');
					}
				}
			});
			break;

		case 'cmp':
			if (data && data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showComparisions(index);
				//selectIndexAndTrigger(index, 'nFilter');
			}
			else showComparisions(0);
			break;

		case 'verb-cmp':
			if (data && data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showVerbComparisions(index);
			} else {
				showVerbComparisions(0);
			}
			break;
		case 'script':
		case 'lang':
		case 'grammar':
			if (data && data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showSentenceComparisions(index, action);
			} else {
				showSentenceComparisions(0, action);
			}
			break;

		case 'noun-cmp':
			if (data && data.startsWith("pos:")) {
				var index = parseInt(data.substring(4));
				showNounComparisions(index);
			} else {
				showNounComparisions(0);
			}
			break;

		case 'imp-verb':
		case 'inad-verb':
		case 'weak-verb':
			var pos = getPosIndex(data);
			if (action === 'imp-verb') {
				showImperativeTable(pos);
			} else if (action === 'inad-verb') {
				showInadequateVerbTable(pos);
			} else {
				showWeakVerbTable(pos);
			}
			break;

		case 'q-examples':
			listExamplesFromQuran();
			toggleDropdownContent($(this).parent().prev());
			break;

		case 'ar_quotes':
			listArabicQuotes();
		break;
		
		case 'list-search':
		default:
			var st = parent.getStatesFromKey('lastIndexSearch');
			if(st && (st.id || st.topic))
				listSearchIndex(st.id, st.topic);	
			else
				listSearchIndex('');
			break;
	}

	parent.updateStatesKey("dict.html", {action: action, data: data});
	postHandleDictParams(el, action);
}

function handleCompareCheck() {
	var chk = $("input");
	var sel = $("select option");
	sel.removeClass(".cmpVerb");
	if (chk.is(":checked")) {
		var selSel = $("select option:selected");
		selSel.addClass(".cmpVerb");
		$("#cmpLabel").html(selSel.val() + " Compare with ");
	}
	else {
		$("#cmpLabel").html("Compare");
	}
}

function handleFilterAction(val, topic){
	handleFilterIndex(val);
	if (topic === 'learning'){
		// Add order
		$('div[data_order]').css('order', function() {
			return $(this).attr('data_order'); 
		});
	}
	else if(topic !== ''){
		$("div[data_action]:not([data_action*='"+topic+"'])").hide();
		$('div[data_order]').css('order','');//remove order
	}
	saveLastSearchIndex(val.replace('id_',''), topic ?? $("#selIndexTopic").val());
}

function handleFilterIndex(val){
	if (val == 'id_ع'){
		$("div [id*=id_]").hide();
		$("div [id*=data_]").show();
	}
	else{
		$("div [id*=data_]").hide();
		$("div [id*=id_]").hide();
		if(val == "id_") 
			$("div [id*=id_]").show();
		else
			$("div [id="+val+"]").show();
	}
}

function checkWord(w) {
	$("#wordSearchText").val(w);
}

function analyzeSelectedWord(w) {

	var word = w ?? $("#wordSearchText").val();
	processSelectedWordPos(word.trim(),
	data => {
		var word = data.word;
		if(data.nouns.length > 0){
			word = data.nouns[0];
		}
		else if(data.verbs.length > 0){
			word = data.verbs[0];
		}
		posSearchObj.searchAndAddHtml(word, $(".dictionary"));
	});
}

function analyzeSelectedWordOld(sel) {
	var word = sel ?? $("#wordSearchText").val();
	if(sel)
		$("#wordSearchText").val(sel);
	var res = posAPIObj.analyzeWord(word, true);
	posAPIObj.addHtml($(".dictionary"), res, true);
}

function loadExamplesFromCmpData(dict, qselect) {
	if (!cmpAPI || !cmpAPI.cmpData || !cmpAPI.cmpData.length) {
		return;
	}
	var examples = {};
	cmpAPI.cmpData.forEach(function (item) {
		var features = item && item.features;
		if (!features) {
			return;
		}

		Object.entries(features).forEach(function ([key, value]) {
			if (!Array.isArray(value)) {
				return;
			}

			var matches = value.filter(function (v) {
				return /\[\d+\:\d+\]/ig.test(v);
			});

			if (!matches.length) {
				return;
			}

			examples[key] = examples[key]
				? examples[key] + "<br/>" + matches.join("<br/>")
				: matches.join("<br/>");
		});
	});

	var html = '<div style="font-size:12px;text-align:center;">';
	Object.entries(examples).forEach(function ([key, value]) {
		var keyExamples = String(value).split('<br/>');
		var div = keyExamples
			.filter(function (ex) {
				return /\[\d+\:\d+\]/ig.test(ex);
			})
			.map(function (ex) {
				return `
					<p style="font-size:10px;">
						${replaceQLink(ex.replaceAll('e.g.', ''))}
					</p>`;
			})
			.join('');

		if (div === '') {
			return;
		}

		var kval = arRemovePunct(key)
			.replaceAll(' ', '_')
			.replaceAll('(', '')
			.replaceAll(')', '')
			.replaceAll('/', '');
		qselect.append(`<option value="${kval}">${key}</option>`);
		html += `
			<div id="qid_${kval}" 
				style="margin:auto;padding:10px;display:inline-block;">
				<p>${key}
				${getPinIcon(`qid_${kval}`,'',parent.document)}</p>
				${div}
			</div><br/>`;
	});
	html += '</div>';
	dict.append($(html));
}

function loadExamplesFromDefinitions(dict, qselect, data){
	if (data) {
		var examples = data;
		var html = '<div style="font-size:12px;text-align:center;">';
		// Display examples
		Object.entries(examples).filter(function ([key, value]) {
			var div = '';
			if(value.examples){
				value.examples.every(function (ex, i) {
					if (/\[\d+\:\d+\]/ig.test(ex)) {
						div += `<p style="font-size:10px;">${replaceQLink(ex)}</p>`;
					}
					return true;
				});
			}
			if(value.types){
				value.types.map(function (v, i) {
					if(v.examples)
					{
						v.examples.every(function (ex, i) {
							if (/\[\d+\:\d+\]/ig.test(ex)) {
								div += `<p style="font-size:10px;">${replaceQLink(ex)}</p>`;
							}
						});
					}
				});
			}
			if (div !== '') {
				var kval = arRemovePunct(value.name_ar ?? key)
					.replaceAll(' ', '_')
					.replaceAll('(', '')
					.replaceAll(')', '')
					.replaceAll('/', '');
				qselect.append(`<option value="${kval}">${value.name_ar ?? `${key} (${value.en})`}</option>`);
				html += `
				<div id="qid_${kval}" 
					style="margin:auto;padding:10px;display:inline-block;">
					<p>
					${value.name_ar ?? `${key} (${value.en})`}
					${getPinIcon(`qid_${kval}`,'',parent.document)}
					</p>
					${div}
				</div><br/>`;
			}
		});
		html += '</div>';
		dict.append($(html));
	}
}

function loadExamplesFromObjectEffectData(dict, qselect, data) {
	if (data) {
		var examples = data;
		var html = '<div style="font-size:12px;text-align:center;">';
		// Display examples
		Object.entries(examples).filter(function ([key, value]) {
			var div = '';
			value.examples.every(function (ex, i) {
				if (/\[\d+\:\d+\]/ig.test(ex)) {
					div += `<p style="font-size:10px;">${replaceQLink(ex)}</p>`;
				}
				return true;
			});
			if (div !== '') {
				var kval = arRemovePunct(value.name_ar)
					.replaceAll(' ', '_')
					.replaceAll('(', '')
					.replaceAll(')', '')
					.replaceAll('/', '');
				qselect.append(`<option value="${kval}">${value.name_ar}</option>`);
				html += `
				<div id="qid_${kval}" 
					style="margin:auto;padding:10px;display:inline-block;">
					<p>
					${value.name_ar}
					${getPinIcon(`qid_${kval}`,'',parent.document)}
					</p>
					${div}
				</div><br/>`;
			}
		});
		html += '</div>';
		dict.append($(html));
	}
}

function loadExamplesFromData(dict, qselect, data, prefix) {
	var impExamples = data;
	if (!prefix) prefix = '';
	if (impExamples) {
		var examples = impExamples;
		var html = '<div style="font-size:12px;text-align:center;">';
		// Display examples
		Object.entries(examples).filter(function ([key, value]) {
			var div = '';
			var values = value.match ? [value] : value;
			values.every(function (ex, i) {
				if (/\[\d+\:\d+\]/ig.test(ex)) {
					div += `<p style="font-size:10px;">${
						replaceQLink(ex+'').replaceAll(']', ']<br/><br/>')
					}</p>`;
				}
				return true;
			});
			
			if (div !== '') {
				var kval = arRemovePunct(prefix + key).replaceAll(' ', '_');
				qselect.append(`<option value="${kval}">${prefix} ${key}</option>`);
				html += `
				<div id="qid_${kval}" 
					style="margin:auto;padding:10px;display:inline-block;">
					<p>
					${prefix} ${key}
					${getPinIcon(`qid_${kval}`,'',parent.document)}
					</p>
				${div}
				</div><br/>`;
			}
		});
		html += '</div>';
		dict.append($(html));
	}
}

function extractExamples(d){
	if(d){ //return data when inline call
		return Object.assign({}, ...$.map(d, function(value, key) {
			var obj = {};
			obj[key] = value.examples;
			return obj;
		}));
	}
	return d;
}

function listExamplesFromQuran(selText) {
	var dict = $(".dictionary");
	dict.empty();

	// Add select
	var qselect = `
			<select class="qs1" style="text-align:center;"
				onchange=" 
				$('div [id*=qid_]').hide();
				$('div [id*=qid_]').nextAll('br').hide();
				if($(this).val() == 'ALL'){ 
					$('div [id*=qid_]').show()
					$('div [id*=qid_]').nextAll('br').show();
				}else{
					var id = arRemovePunct($(this).val()).replaceAll(' ','_');
					$('div [id=qid_'+id+']').show();
					$('div [id=qid_'+id+']').nextAll('br').show();
				}
				">
				<option value="ALL">ALL</option>
			</select>
			`;
	var qSelectDiv = getListButtinWithSelect(qselect,
		'qs1', '',
		"\"listQListItems('.dictionary', '.qs1')\"");
	dict.append(qSelectDiv);
	qselect = $('.nFilterDiv .qs1');
	var btnDiv = $('.nFilterDiv .nFilterBtn');
	btnDiv.css('width', '280px');

	loadExamplesFromCmpData(dict, qselect);
	ensureDataLoaded({ name: "verb-examples" })
		.then((data) => {
			const exData = Object.fromEntries(
				Object.entries(data).map(([key, value]) => [
					key.replace("V1_", "Triliteral ")
						.replace("V1_", "Quadlateral ")
						.replace("V1_", "Extended"),
					value]
				)
			);
			loadExamplesFromObjectEffectData(dict, qselect, exData);
		});
	ensureDataLoaded({ name: "obj-effect" })
		.then((data) => {
			loadExamplesFromObjectEffectData(dict, qselect, data);
		});
	ensureDataLoaded({ name: "adv" })
		.then((data) => {
			loadExamplesFromObjectEffectData(dict, qselect, data);
		});
	ensureDataLoaded({ name: "def-data" })
		.then((data) => {
			loadExamplesFromDefinitions(dict, qselect, data);
		});
	ensureDataLoaded({ name: "ex-data" })
	.then((data)=>{
		loadExamplesFromData(dict, qselect, data["imperative"], "Imperative - Form");
		loadExamplesFromData(dict, qselect, extractExamples(data["weak-verb"]), "Weak Verbs");
		loadExamplesFromData(dict, qselect, extractExamples(data["inad-verb"]), "Inadequate Verbs");
		loadExamplesFromData(dict, qselect, data["objects"]);
	});
	if (posAPIObj)
		loadExamplesFromData(dict, qselect, posAPIObj.getMetonymies(1));

	if (selText) {
		setTimeout(function () {
			$(".qs1").val(selText);
			if ($(".qs1").val() !== '') {
				$(".qs1").trigger('change');
			}
		}, 40);
	}
}

function listDefinitions(bk){
	var container = $(".dictionary");
	ensureDataLoaded({name:'def-data'})
	.then((data) => {
		container.empty();
		//Add filters
		container.prepend(getListButtinWithSelect(
		`<select class="defFilter" 
					style="text-align: center;text-align-last: center;padding:6px;"
					onchange="updateStateIndex(this);
						filterTableRows(-1, '#defTable', 
										 $('.defFilter').prop('selectedIndex'), 
										 $('.defFilter').val()?.slice(1),
										 {useId: true, useRowIndex: true});">
		</select>`,
		'defFilter','defs'));
		var defSelect = $(".defFilter");
		
		container.append($(`<table id="defTable" 
				style="text-align:center;"><tbody></tbody></table>`));
		var table = $("#defTable tbody");
		Object.keys(data)
		      .sort()
			  .forEach(function(key) {
				var key_id = key.replaceAll(' ','_');
				var entry = data[key];
				table.append($(
				`<tr><td id="bm_${key_id}" style="border:none; border-bottom: 2px solid black;">
				<a href=".defFilter">[&#8593]</a>&nbsp;&nbsp;
				<b style="background-color:#F0F0A0">${key} (${entry.en})</b>
				&nbsp;&nbsp<a href="#" 
				   onclick="openGoogleAISearch(
							getPromptFromKey(['Definitions'], 
									{'0': ['${key} (${entry.en})', 
									        '${entry.types && entry.types.length > 0 ? 
												entry.types.map(x=>`${x.name}(${x.en})`).join(","):
												"find out types"}',
									        '${entry.def})']}, 
									true));">[AI]</a>
				<p style="direction:ltr;padding:2px;">${entry.def}</p>
				${entry.ref ? ':<u>References</u><br/>' : ''}
				${entry.ref ? `
				<div style="text-align:center;display:inline-flex;padding-bottom:6px;">
					${entry.ref.map(ex => `
						<a style="padding-left:20px;padding-right:20px;" 
							href="#" onclick="changeDefIndex('${ex}');">${ex}</a>`).join('')}
				</div>`: ''}
				<div style="background-color:lightgray;">${entry.examples ? entry.examples.map(ex => `${replaceQLink(ex)}</br/>`).join(''): ''}</div>
				${entry.types ? '<ul>' : ''}
				${entry.types ? entry.types.map(t => `
					<li style="list-style-type: none;">
					<u style="background-color:lightgray;">${t.name} (${t.en})</u><br/>
					${t.examples ? t.examples.map(ex => `${replaceQLink(ex)}</br/>`).join('<br/>'): ''}
					</li><br/>
					`).join(''): ''}
				${entry.types ? '</ul>' : ''}
				</td></tr>`));
				defSelect.append($(`<option value="#bm_${key_id}">${key} (${entry.en})</option>`)) 
			  }
			);

			if(bk){
				if(bk.startsWith("pos")){
					var index = parseInt(bk.split(":")[1]);
					defSelect.find(`option:eq(${index})`).prop('selected', true);
					defSelect.trigger('change');
				}else{
					bk = bk.startsWith("def:") ? bk.substring(4): bk;
					var bkId 	= bk.startsWith("#bm_") ? bk.substring(4) : bk;
					changeDefIndex(bkId);
				}
			}
	});
}

function listArabicQuotes(){
	ensureDataLoaded({name: 'ar_quotes'})
	.then((data)=>{
		$(".dictionary").empty();
		Object.keys(data).every((k)=>{
			var q = data[k][0];
			var a = data[k][1];
			$(".dictionary").append($(`				
				<blockquote style="direction:ltr;width:90%;padding:10px;background-color:#F4F6F8; border: 2px solid #F4F6F8;border-radius: 20px;">
				${q}<cite style="float:right"><a href="${a}" target="_blank">${k}</a></cite>
			</blockquote>`));	
			return true;
		});
	});
}

function listSearchIndex(indexKey='', topic) {
	ensureDataLoaded({name:'isearchData'})
	.then((data) => {
		$(".dictionary").empty();
		$(".dictionary").append('<div style="margin-top: 40px;"></div>');

		//sort by key
		var arSortedData = {}, arSortedDataOriginalKeys = {}, sortElements = {};
		const enSortedData = Object.keys(data)
			.sort()
			.reduce((tempObj, key) => {
				//  Arabic text
				var amatch = arRemovePunct(key).match(/([\u0621-\u064A]+\s?)+/)+'';
				if(amatch.includes(','))
					amatch = amatch.split(',')[0];
				if(amatch !== "null"){
					arSortedData[amatch] = data[key];
					arSortedDataOriginalKeys[amatch]=key;
				}

				// English text
				var ematch = key.match(/([a-zA-Z0-9]+\s?)+/)+'';
				if(ematch.includes(','))
					ematch = ematch.split(',')[0];
				if(ematch !== "null"){
					tempObj[ematch] = data[key];
				}
				return tempObj;
			}, {});

		// Add Alphabetic index
		var iDiv = "<div style='direction:ltr;text-align:left;padding:4px;'>";
		$.each([" عABCDEFGHIJKLMNOPQRSTUVWXYZ"],
			function (index, value) {
				iDiv += '<select id="selIndex" style="width:40;" onchange="handleFilterAction($(this).val(), $(this).next().val())" >';
				for (const charValue of value) {
					iDiv += "<option value=id_" + charValue + ">" + charValue + "</option>";
				};
				iDiv += "</select>";
				iDiv += `
				Topic: <select id="selIndexTopic" style="width:40;" onchange="handleFilterAction($(this).prev().val(), $(this).val());">
					<option value="">All</option>
					<option value="learning">Learning</option>
					<option value="cmp">Comparison</option>
					<option value="script">Script</option>
					<option value="lang">Language</option>
					<option value="grammar">Grammar</option>
					<option value="noun-cmp">Noun Comparison</option>
					<option value="noun-pat">Noun Patternns</option>
					<option value="masdar">Verbal Noun</option>
					<option value="verb">Verb</option>
					<option value="adj">Adjective</option>
					<option value="adv">Adverb</option>
					<option value="pronoun">Pronoun</option>
					<option value="prep">Preposition</option>
					<option value="Vocab">Vocabulary</option>
					<option value="Chart">Charts</option>
				</select>`;
			});
		$(".dictionary").append($(iDiv));
 
		var div = $(`<div style="display:grid;
			                     grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
								 gap: 4px;
								 direction:ltr;
								 width:100%;
								 height=100%;"></div>`);
		$.each(enSortedData, function (key, value) {
			div.append(getIndexEntry(null, key, value, 'id', 
				'cursor:pointer;margin:0;padding:0;padding-left:10px;padding-top:14px;width:220px;display:inline-block;float:left;'));
		});
		$.each(arSortedData, function (key, value) {
			var elem = getIndexEntry(arSortedDataOriginalKeys, key, value, 'data', 
				'cursor:pointer;margin:0;padding:0;padding-left:10px;padding-top:14px;width:220px;display:inline-block;float:right;'
			);
			sortElements[key] = elem;
			//div.append(elem);
		});
		// rearrange arabic index to be in the order of arabic letters
		var sortedKeys = Object.keys(sortElements).sort(function(a, b) {
			return a.localeCompare(b, 'ar');	
		});
		div.append(sortedKeys.map(function(key) {
			return sortElements[key];
		}));
		$(".dictionary").append(div);

		if(indexKey != ''){
			$('#selIndex').val('id_'+indexKey);
		}
		if(topic){
			$('#selIndexTopic').val(topic);
		}
		$('#selIndexTopic').trigger('change');
	});
}

function getIndexEntry(keys, key, value, id, style){
	
	var originalKey = keys ? keys[key] : key;
	if(originalKey.includes(";")){
		originalKey = originalKey.split(";")[0];
	}
	var link = `
	parent.redirect('${value.path}','${value.action}',
	${
		(value.data && value.data == '@key') ? `'${originalKey}');`:
		value.data ? `'${value.data}');`: ');'
	}`;
	var icon = getIndexEntryIcon(value.path, value.action);
	return `
		<div id="${id}_${key[0]}" 
		    data_action="${value.action}"
			data_order=${value.order}
			style="${style}">
			${icon}<a href="#" onclick="${link}">${key}</a>
		</div>
	`;
}

function getIndexEntryIcon(path, action){
	var style = "height:14px;padding:0;margin:0;display:inline";
	switch(path)
	{
		case 'charts.html':
		case 'cards.html':
			return `<img src="images/fcard.png" style="${style}}"/>`;
		default:
			break
	}
	switch(action)
	{
		case 'cmp':
		case 'noun-cmp':
		case 'script':
		case 'lang':
		case 'grammar':
			return `<img src="images/cmp.png" style="${style}"/>`;
		default:
			break
	}
	return '';
}

function openMeaning() {
	var txt = $("#wordSearchText").val();
	if (txt !== null && txt !== '') {
		lookUp(txt);
	}
}

function searchInQuran() {
	var txt = $("#wordSearchText").val();
	if (txt !== null && txt !== '') {
		loadSearch(txt, true);
	}
}

function OpenInChatGPT() {
	var txt = $("#wordSearchText").val();
	var lang = parent.getLang();

	var url = "https://chatgpt.com?q=";
	var prompt = "";
	switch (lang) {
		case 'en':
			prompt = decodeURI('Generate three sample sentences using word ' + txt + ' from the Quran or Hadith and translate into English language');
			break;

		case 'ur':
			prompt = decodeURI('Generate three sample sentences using word ' + txt + ' from the Quran or Hadith and translate into Urdu language');
			break;

		case 'ar':
			prompt = decodeURI('Generate three sample sentences using word ' + txt + ' from the Quran or Hadith and translate into English and Urdu languages');
			break;
	}
	parent ? parent.window.open(url + prompt, '_blank') : window.open(url + prompt, '_blank');
}

function loadComparision() {
	var comppSel = $("select option[class='.cmpVerb']");
	var verbCompare = comppSel.length > 0 ? comppSel.val() : '';
	cmpAPIObj.addComparisionTable(".dictionary", $(".dictionary select").val(), verbCompare);
}

function changeDefIndex(val){
	var refIndex = $(`.defFilter option[value="#bm_${val.replaceAll(' ','_')}"]`).index();
	$('.defFilter').prop('selectedIndex', refIndex);
	$('.defFilter').trigger('change');
}

function saveLastSearchIndex(id, topic){
	
	const stateName = "lastIndexSearch";
	if(topic != parent.states[stateName]?.topic ||
	   id != parent.states[stateName]?.id
	 )
	{
		parent.updateStatesKey(stateName, {
			id: id ?? parent.states[stateName]?.id,
			topic: topic ?? parent.states[stateName]?.topic
		});

	}
}

//
//	Author: munawwar_ali@yahoo.com
//

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