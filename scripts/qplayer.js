//
//	Author: munawwar_ali@yahoo.com
//

class qPlayerAPI {
		
	static AUDIO_CTL_PLAY = '\u23F5';
	static AUDIO_CTL_PAUSE = '\u23F8';
	static AUDIO_CTL_STOP = '\u23F9';
	static AUDIO_CTL_FF = '\u23E9';
	static AUDIO_CTL_FB = '\u23EA';
	
	static control;
	static ctlPlay;
	static callbackFunc;
	
	constructor(ctl, cbFuncName)
	{
		qPlayerAPI.control = ctl;
		var fn = cbFuncName;
		document.addEventListener('playEvent', function(e){
			console.log(e)
			fn(e.detail.value);
		});
	}
	
	loadPlayerControls(container, audio){
		qPlayerAPI.ctlPlay = audio;
		var raiseEvent = 'document.dispatchEvent(new CustomEvent(\'playEvent\', { \'detail\': { \'value\': \'X\'}, \'bubbles\': true }))';
		if(container && container.append){
			var divPlay = '<div class="play-controls">'+
				'<button title="backward" '+
					'onclick="'+raiseEvent.rneweplace(/X/g,qPlayerAPI.AUDIO_CTL_FB)+'">'+qPlayerAPI.AUDIO_CTL_FB+'</button>'+
				'<button title="forward" '+
					'onclick="'+raiseEvent.replace(/X/g,qPlayerAPI.AUDIO_CTL_FF)+'">'+qPlayerAPI.AUDIO_CTL_FF+'</button>'+
				'<button title="play" '+
					'onclick="'+raiseEvent.replace(/X/g,qPlayerAPI.AUDIO_CTL_PLAY)+'">'+qPlayerAPI.AUDIO_CTL_PLAY+'</button>'+
				'<button title="pause" '+
					'onclick="'+raiseEvent.replace(/X/g,qPlayerAPI.AUDIO_CTL_PAUSE)+'">'+qPlayerAPI.AUDIO_CTL_PAUSE+'</button>'+
				'<button title="stop" '+
					'onclick="'+raiseEvent.replace(/X/g,qPlayerAPI.AUDIO_CTL_STOP)+'">'+qPlayerAPI.AUDIO_CTL_STOP+'</button>'+
				//'<div><proggress max="'+audio_duration+'"></progress></div>'+
				'<div>';
			container.empty();
			container.append($(divPlay));
		}
	}
}
