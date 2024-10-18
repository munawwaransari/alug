window.onload = function()
{
	$("#languages").hide();
	$("#play").hide();
	$("#text").hide();
	var support = document.getElementById("support").innerHTML;

	if(support.startsWith("Hurray")){
		$("#s3_2").hide();
		$("#s3_1").show();
		$("#s3_1+p").text(support);
	}
	else{
		$("#s3_1").hide();
		$("#s3_2").show();
		$("#s3_2+p").text(support);
	}
}