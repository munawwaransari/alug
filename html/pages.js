var pages = "123456789abcdefghijklmnopqrstuvwxyz";
 
 function getParamValue(paramName){
	var url = window.location.search.substring(1); //get rid of "?" in querystring
	var qArray = url.split('&'); //get key-value pairs
	for (var i = 0; i < qArray.length; i++) 
	{
		var pArr = qArray[i].split('='); //split key and value
		if (pArr[0] == paramName) 
			return pArr[1]; //return value
	}
 }

 window.onload = function(){
    var p = getParamValue("page");
	if(p !== null && p !== undefined){
		var page = (p > -1 && p < pages.length) ? pages[p-1] : -1;
		if(page !== -1){
			document.getElementById('pf'+page).scrollIntoView();
		}
	}
 }