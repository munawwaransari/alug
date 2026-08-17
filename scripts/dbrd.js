//
//	Author: munawwar_ali@yahoo.com
//

const dbcardSelectClass = 'dbcard-select';

function selectCard(el){
    if($(el).hasClass(dbcardSelectClass)){
        $(el).removeClass(dbcardSelectClass);
    }else{
        $(".dbcard").removeClass(dbcardSelectClass);
        $(el).addClass(dbcardSelectClass);
    }
    
    //toggle settings
    var selCard = $(".dbcard");
    if(selCard.hasClass(dbcardSelectClass)){
        // load selected settings
        selCard = $(`.${dbcardSelectClass}`)
        changeSettings(undefined, 'data-width', selCard.attr('data-width'));
        changeSettings(undefined, 'padding', selCard.css('padding'));
        changeSettings(undefined, 'border', selCard.css('border-width'));
        changeSettings(undefined, 'text', selCard.attr('data-text'));
        
        // show settings
        $(".dbcard-settings").show();
    }else{
        $(".dbcard-settings").hide();
    }
}

function narkCardsAsDeleted(){
    var dashboard = parent.dashboard;
    if(dashboard.cards){
        Object.keys(dashboard.cards).every(key => {
            dashboard.cards[key].html = 'DELETED';
            return true;
        });
    }
}

function refreshCards(){
    var container = $("#dbContainer");
    //container.empty();
    var dashboard = parent.dashboard;
    var dic = dashboard.cards;
    Object.keys(dic).every((k)=>{
        var el = $(`#${dic[k].id}`);
        if(el.length == 0){
            var div = `<div class="dbcard" id="${dic[k].id}"  
                        ondblclick="editCardText(this)"
                        style="height:auto" 
                        data-width="${dic[k].settings.size}" 
                        data-text="name"
                        onclick="selectCard(this)">${dic[k].html ?? `Card ${dic[k].num}`}</div>`;
            container.append($(div));
            changeSettings($(k), dic[k].settings.size, dic[k].settings.float);
        } 
        else if(dic[k].html == "DELETED"){
            el.remove();
            delete dic[k];
            //dashboard.count--;
        }        
        return true;
    });
}

function moveSelectedCard(direction){
    var elem = $(".dbcard-select");
    if(elem){
        const index = elem.index();
        if(direction == 'left'){
            if(index > 0){
                var prev = elem.prev();
                elem.parent().remove(elem);
                prev.before(elem);
            }
        }else{
            if(index > -1 && (index+1) < elem.parent().children().length){
                var next = elem.next();
                elem.parent().remove(elem);
                next.after(elem);
            }
        }
    }
}

function editCardText(el){
 if(el){
    var elem = $(el);
    if(elem.find("textarea").length == 0 && 
       elem.find('img').length == 0)
    {
        var id = elem.prop("id");
        elem.addClass('.dbcard-select');
        var elemHtml = elem.html();
        elem.html(`<textarea 
            onblur="
                var text = $(this).val();
                console.log('text:'+ text);
                if(text != ''){
                    $(this).parent().html(text);
                    parent.dashboard.cards['${id}'].html = text;      
                }
                console.log('remove');
                $(this).parent().remove($(this))">
            ${elemHtml}</textarea>`);
    }
 }
}

function changeSettings(src, prop, val){
    var elem = $(".dbcard-select");
    switch(prop){
        case 'data-width':
            if(src == 'ui'){
                elem.css('width', val);
                elem.attr('data-width', val);
            }
            else{
                $("#selSize").val(elem.attr('data-width'));
            }
            break;

        case 'padding':
            if(src == 'ui'){
                elem.css(prop, `${val}`);
            }
            else{
                $("#selPadding").val(elem.css(prop));
            }
            break;

        case 'border':
            if(src == 'ui'){
                elem.css('border-width', `${val}`);
            }
            else{
                $("#selBorder").val(elem.css('border-width'));
            }
            break;

        case 'text':
            if(src == 'ui'){
                if(elem.find('img').length == 0){
                    if(val == "name"){
                        elem.attr('data-text', "name");
                        elem.html(elem.prop('id').replace(/db([a-zA-Z]+)(\d+)$/ig,'$1 $2'));
                    }else{
                        elem.attr('data-text', val);
                        elem.html('&nbsp;'.repeat(val*4));
                    }
                }
            }
            else{
                if(elem.find('img').length == 0){
                   $("#selText").val(elem.attr('data-text'));
                }
            }
            break;
    }
}
