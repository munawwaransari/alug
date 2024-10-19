
$(document).ready(function()
{
	nodeInserted("#languages");
	$(document).on("nodeInserted",function(e,q){
		if (q === "#languages"){
			$("#languages").parent().hide();
		}
		
		$("#text").text("");
		//$("#play").click();
	});
	
	$("#text").text('');
	$("#text").hide();
	//$("#play").hide();

	var support = document.getElementById("support").innerHTML;

	if(support.startsWith("Hurray")){
		speech_synthesis_supportd = true;
		toggleAutoplay();

		$("#s3_2").hide();
		$("#s3_1").show();
		$("#s3_1+p").text(support);
	}
	else{
		speech_synthesis_supportd = false;
		$("#s3_1").hide();
		$("#s3_2").show();
		$("#s3_2+p").text(support);
	}	

	document.getElementById('playSections').addEventListener('change', function() {
		const selectedValue = this.value;
		$("#text").text(selectedValue);
		$("#play").click();
	});
});


/*
function buildIcon(id, icon, tooltiptext){
	
	var tooltip = $('<img id="'+id+'" class="tooltip" src="'+icon+'"/>"');
	tooltip.append(tooltiptext);
	$(".right").append(tooltip);
}

function buildtooltips(){
		
	buildIcon("s1", "images/email.png", $('<a class="tooltiptext" href="mailto:munawwar_ali@yahoo.com">Mail to author</a>'));
	
}
*/

function toggleAutoplay(){
	
	if(!speech_synthesis_supportd){
		alert('Speech synthesis is not supported on your browser!');
	}else{
		toggleIcon("#s4");
		autoplay = !autoplay;
		
		if(autoplay){
			$("#playSections").show();
			$("#play").show();
		}else{
			$("#playSections").hide();
			$("#play").hide();
		}
	}
	console.log('autoplay :' + autoplay);
};

function toggleIcon(id){
	[id+'_1', id+'_2'].forEach(function(id){
		console.log('toggleIcon: ' + id); 
		$(id).toggle();	
	});
	
};

async function loadAutoPlayScript(url,  callback)
{
	try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        callback(data);
    } catch (error) {
        console.error('Fetch error:', error);
    }
};

//ref: https://stackoverflow.com/questions/7434685/how-can-i-be-notified-when-an-element-is-added-to-the-page
function nodeInserted(elementQuerySelector){
    if ($(elementQuerySelector).length===0){
        setTimeout(function(){
            nodeInserted(elementQuerySelector);
        },100);
    }else{
        $(document).trigger("nodeInserted",[elementQuerySelector]);
    }
};
