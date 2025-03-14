//
//	Author: munawwar_ali@yahoo.com
//

function getLastDateStr(){
	return (last_Date.Day < 10 ? ("0"+last_Date.Day) : last_Date.Day )+
		   "-"+
		   ((last_Date.Month+1) < 10 ? ("0"+(last_Date.Month+1)) : (last_Date.Month+1)) +
		   "-"+
		   last_Date.Year;
}
function getPrayerAPI(cType, city){
	var url = "";
	if(cType === 'hijri'){
		var dateStr = last_Date.Year+"/"+(last_Date.Month+1);
		url = 'https://api.aladhan.com/v1/hijriCalendarByCity/'+dateStr+'?country=IN&city='+city;
	}else{
		url = 'https://api.aladhan.com/v1/timingsByCity/'+getLastDateStr()+'?country=IN&city='+city;
	}
	return url;
}

function showPrayerTimings(container, cType, city){
	if(city){
		var url = getPrayerAPI(cType, city);
		console.log('Loading prayr times for '+ cType + ' for city' + city);
		loadJsonData(url, function(data){
			var dir = cType === 'hijri' ? 'direction:rtl;text-align:right;font-size:18px;' : 'direction:ltr;text-align:left';
			var prayTable = '<table style="margin-top:10px;'+dir+';">'+
							'<tr><th style="width:80px;"><th colspan="2" style="'+dir+';">'+transTimeText(cType, 'Prayer Timings')+':</th></tr>'+
							'<tr><th/><th style="'+dir+';width:150px;">'+transTimeText(cType, 'Event')+'</th>'+
							'<th style="'+dir+';width:150px;">'+transTimeText(cType, 'Time')+'</th></tr>';
			
			var timings = (calendarType === 'hijri') ? 
				  data.data.filter(t=> t.date.hijri.date === getLastDateStr())[0].timings
				: data.data.timings;
				
			var flag = 0, cblink = "", pastFlag = 0, rows = '';
			Object.keys(timings).forEach(function(key){
				
				if(key === "Midnight" || key === "Firstthird" || key === "Lastthird")
					return false;
				
				pastFlag = isPastTime(timings[key]);
				if(!flag && pastFlag){
					cblink = ' class="blink"';
					flag = 1;
				}else{
					cblink = '';
				}
				
				if(key !== ''){
					if(pastFlag)
						rows += '<tr'+cblink+'><td/><td style="'+dir+'">'+transTimeText(cType, key)+'</td><td>'+timings[key]+'</td></tr>';
					else
						rows = '<tr'+cblink+'><td/><td style="'+dir+'">'+transTimeText(cType, key)+'</td><td>'+timings[key]+'</td></tr>' + rows;
				}
			});
			
			prayTable += rows + '</table>';
			container.html(prayTable);
		});
	}
	
	function isPastTime(timing){
		if(timing){
			var date = new Date();
			var timingHours = parseInt(timing.substr(0,2));
			var timingMinutes = parseInt(timing.substr(3,2));
			
			if (date.getHours() < timingHours)
				return true;
			
			if ((date.getHours() === timingHours) && (date.getMinutes() < timingMinutes))
				return true;
		}
		return false;
	}
	
	var timeTransMap = {
		"Prayer Timings": "مواقيت الصلاة",
		"Event": "حدث",
		"Time": "وقت",
		"Imsak": "إمساك",
		"Sunrise": "شروق الشمس",
		"Fajr": "الفجر",
		"Dhuhr": "الظهر",
		"Asr": "العصر",
		"Sunset": "غروب الشمس",
		"Maghrib": "المغرب",
		"Isha": "العِشاء"
	};
	
	function transTimeText(cType, txt){
		if(cType === 'hijri' && timeTransMap[txt])
			return timeTransMap[txt];
		return txt;
	}
}