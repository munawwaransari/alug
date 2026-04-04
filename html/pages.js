var pages = "123456789abcdefghijklmnopqrstuvwxyz";
 
function getParamValue(paramName) {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName);
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