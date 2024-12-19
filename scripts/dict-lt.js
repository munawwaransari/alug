//
//	Author: munawwar_ali@yahoo.com
//

var pluralCSV = undefined;
var synonymsCSV = undefined;
var antonymsCSV = undefined;

function loadArabicLTTable(csv, key, v1, v2){
	updateState(key, {ar: v1, en: v2});
	
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
		var w = parent ? parent.window: window;
		var loc =  getLocationPath(); //w.location.href.substring(0,window.location.href.lastIndexOf("/")+1);
		var path = encodeURI(loc + 'data/arabiclt/' + csv);
		loadHtmlData(path, loadTable);
	}else if(table && table.length > 0){
		addAsHtmlTable($(".dictionary"), table, table[0].split(","));
	}else{
		console.log('Error: something went wrogn with the csv table');
	}
}

function loadTable(data){
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
		addAsHtmlTable($(".dictionary"), tableData, columns);
	}
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
			
		headings+= "<th>"+col+"</th>";
		return true;
	});
	headings+="</tr><table>";
	var htmlTable = $('<table class="csvTable"><tr>'+headings+'</tr></table>');
	var alink = '<a href="#" style=" text-decoration: none" '+
					' onclick="checkWord(\'$\');">$</a>';
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
				tableRows+= "<td>"+alink.replaceAll('$', colVal.trim())+"</td>";
			else
				tableRows+= "<td>"+colVal+"</td>";
			return true;
		});
		tableRows+="</tr>";
		return true;
	});
	
	
	container.append('<input id="txtFilter" style="font-size:18px; max-width=100px;" onchange="filterTable('+wordColumn+');"/>')
	container.append($('<a style="font-size:10px; width:100%;text-align:center;" href="#" onclick="var w = parent ? parent.window: window;'+
							'w.open(\'https://github.com/mdanok/ArabicLT\',\'_blank\')">'+
							'Data source: https://github.com/mdanok/ArabicLT'+
					 '</a>'));container.append(htmlTable);
	
	$(".csvTable tbody").append($(tableRows));
	container.find("p").remove();
}

function filterTable(wordColumn){
	filterTableRows('.csvTable', wordColumn, $("#txtFilter").val());
}

/*
function getRowData(columns, row){
	var rowData = {};
	columns.every(function(val, index){
		var data =  row[index];
		rowData[columns[index]] = val.trim();
		return true;
	});
	return rowData;
}
*/