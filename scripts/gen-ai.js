import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "@openai";

if(!window.runAISearch)
window.runAISearch = function (name, options){
    return new Promise(async function (resolve, reject) {
        try 
        {
            var p = handleAIArgs(options);
            switch(name){
                case "google":
                    resolve(runGeminiAISearch(options));
                    break;
                default:
                    resolve(runOpenAISearch(options));
                    break;
            }
        } 
        catch (error) {
            reject("Error: " + error.message);
        }
    });
}

//google
async function runGeminiAISearch(options){
    const genAI = new GoogleGenerativeAI(options.apiKey);
    const model = genAI.getGenerativeModel({ model: options.aimodel });
    return (options.flags["IMAGE"] !== true) ?
        await model.generateContent(options.prompt):
        await model.generateContent(options.prompt,{
            generationConfig: {
                responseModalities: ["image"]
            }
        });
}


//opeai
async function runOpenAISearch(options){	
    var openaiConfig = {
        apiKey: options.apiKey,
        dangerouslyAllowBrowser: true
    };
    if(options.flags["PROXY"]==true){
        console.log("Using proxy: openrouter.ai");
        openaiConfig.baseURL= 'https://openrouter.ai/api/v1';
        openaiConfig.fetch = (url, o) => {
            return fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${options.apiKey}`,
                    'HTTP-Referer': url,
                    'Content-Type': 'application/json',
                },
                body: o.body
            })
            .catch(err =>{
                var div = document.getElementById('output');
                div.innerHTML = `<div><b style="color:red">Error:</b>${err.toString()}</div>`;
            })
        }
    }
    const openai = new OpenAI(openaiConfig);
    
    if(options.flags["IMAGE"] == true){
        return("TODO: Image call");
    }
    const completion = await openai.chat.completions.create({
        model: options.flags["PROXY"]==true ? `${options.aiprovider}/${options.aimodel}`:
               options.aimodel,
        messages: [
            {"role": "user", "content": options.prompt}
        ]
    });
    return completion.choices[0].message.content;
}

function handleAIArgs(options){
    if(options.apiKey == undefined || options.apiKey == ""){
        throw new Error("API KEY is required!");
    }

    var p = options.prompt;
    if(options.useSelLang){
        p += '\n Provide Final response in language: '+ parent.getLang();
    }

    if(options.flags["HTML"] == true){
        p += "\n Provide response in HTML format.";
    }
    return p;
}