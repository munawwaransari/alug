/*
 This function loads the question data from question json file;
 prepares the data as per quizlib requirements;
*/
function loadQuiz(quizzes, obj, ch, lang){
					
	var div = undefined;
	var div = $('<div id="'+obj.id+'"><h4>'+ch+' - '+obj[lang+"_display"]+'</h4></div>');
	if(obj.questions){
		obj.questions.forEach(function(q){
			var child = prepareQuestion(q, ch);
			div.append(child);
		});
		div.append($('<button type="button" onclick="showResults(this.parentNode.id);">Check Answers</button>'));
		$("body").append(div);
	}
}

function prepareQuestion(obj, ch){
	var divElement = undefined;
	var style = obj.style;
	if(style){
		style = ' style="' + style + '" ';
	}
	switch(obj.input){
		case 'text':
			console.log("keyboard: " + obj.keyboard);
			var k = (obj.keyboard) ? '<img src="images/kybd.jpg" style="cursor: pointer; margin-top: 10px; margin-left:4px" onclick="showKeyboard(\''+obj.keyboard+'\')"/>' : '';
			divElement = $('<div class="card quizlib-question">' + 
								'<div class="quizlib-question-title" '+style+'>'+obj.question+'</div>'+
								'<div class="quizlib-question-answers">'+
									'<input type="text" name="'+obj.name+'">' + k + 
								'</div>'+
						   '</div>');
		break;
		
		case "radio":
		case "checkbox":
			var ulOptions = "";
			for (const [val, opt] of Object.entries(obj.options)) {
				ulOptions = ulOptions + '<li><label '+style+'><input type="'+obj.input+'" name="'+obj.name+'" value="'+val+'">'+opt+'</label></li>';
			}
			divElement = $('<div class="card quizlib-question">'+
								'<div class="quizlib-question-title">'+obj.question+'</div>'+
								'<div class="quizlib-question-answers">'+
									'<ul '+style+'>' + ulOptions + '</ul>'+
								'</div>'+
							'</div>');
		break;
		
		default:
			console.log("Error: Invalid type of question in " + ch);
	}
	return divElement;
}

function showKeyboard(keybd){
	setTimeout(function(){
		console.log("Opening keyboard: " + keybd);
		window.open("keybd.html?layout="+keybd, "name", "top=0,left=0,width=600px,height=266px");
	}, 10);
}

//https://alpsquid.github.io/quizlib
/**
 * Callback for answer buttons. The implementation for this will vary depending on your requirements.
 * In this example, the same function is being used for every quiz so we pass the ID of the quiz element and
 * retrieve the respective quiz instance from the quiz map we created in the window.onload function.
 */
function showResults(quizID) {
    // Retrieve the quiz instance for this quiz element from the map.
    //var activeQuiz = quizzes[quizID];
	var activeQuiz =quizzesMap[quizID];
    // Check answers and continue if all questions have been answered
    if (activeQuiz.checkAnswers()) {
        var quizScorePercent = activeQuiz.result.scorePercentFormatted; // The unformatted percentage is a decimal in range 0 - 1
        
		//Add a new element
		// var resultElement = $('<div id="quiz-result-'+quizID+'" class="card">' +
            // 'You Scored <span id="quiz-percent"></span>% - <span id="quiz-score"></span>/<span id="quiz-max-score"></span><br/>'+
        // '</div>').prepend("#"+quizID+":first-child");
		
		var quizResultElementOriginal = document.getElementById('quiz-result');
		var quizResultElement = quizResultElementOriginal.cloneNode(true);
		quizResultElement.id = "quiz-result-"+quizID;
		
        // Move the quiz result element to the active quiz, placing it after the quiz title.
        var quizElement = document.getElementById(quizID);
        quizElement.insertBefore(quizResultElement, quizElement.children[1]);

        // Show the result element and add result values.
        quizResultElement.style.display = 'block';
        //document.getElementById('quiz-score').innerHTML = activeQuiz.result.score.toString();
        //document.getElementById('quiz-max-score').innerHTML = activeQuiz.result.totalQuestions.toString();
        //document.getElementById('quiz-percent').innerHTML = quizScorePercent.toString();
		document.getElementById('quiz-result-'+quizID).innerHTML = '<div style="color:white;text-align: center;width:100%">You scored '+
								quizScorePercent.toString()+'% - '+ 
								activeQuiz.result.score.toString()+' /'+
								activeQuiz.result.totalQuestions.toString()+
								'</div>';

        // Change background colour of results div according to score percent
        if (quizScorePercent >= 75) quizResultElement.style.backgroundColor = '#4caf50';
        else if (quizScorePercent >= 50) quizResultElement.style.backgroundColor = '#ffc107';
        else if (quizScorePercent >= 25) quizResultElement.style.backgroundColor = '#ff9800';
        else if (quizScorePercent >= 0) quizResultElement.style.backgroundColor = '#f44336';
        
        // Highlight questions according to whether they were correctly answered. The callback allows us to highlight/show the correct answer
        activeQuiz.highlightResults(handleAnswers);
		
		$("#"+quizID).find("*").prop('disabled',true);		
    }
}

//https://alpsquid.github.io/quizlib
/** Callback for Quiz.highlightResults. Highlights the correct answers of incorrectly answered questions 
 * Parameters are: the quiz object, the question element, question number, correctly answered flag
 */
function handleAnswers(quiz, question, no, correct) {
    if (!correct) {
        var answers = question.getElementsByTagName('input');
        for (var i = 0; i < answers.length; i++) {
            if (answers[i].type === "checkbox" || answers[i].type === "radio"){ 
                // If the current input element is part of the correct answer, highlight it
                if (quiz.answers[no].indexOf(answers[i].value) > -1) {
                    answers[i].parentNode.classList.add(Quiz.Classes.CORRECT);
                }
            } else {
                // If the input is anything other than a checkbox or radio button, show the correct answer next to the element
                var correctAnswer = document.createElement('span');
                correctAnswer.classList.add(Quiz.Classes.CORRECT);
                correctAnswer.classList.add(Quiz.Classes.TEMP); // quiz.checkAnswers will automatically remove elements with the temp class
                correctAnswer.innerHTML = quiz.answers[no];
                correctAnswer.style.marginLeft = '10px';
                answers[i].parentNode.insertBefore(correctAnswer, answers[i].nextSibling);
            }
        }
    }
}
