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
                
                case "openai":
                    resolve(runOpenAISearch(options));
                    break;

                case "anthropic":
                    resolve(runAnthropicAISearch(options));
                    break;

                default:
                    reject("Providei is not integrated yet!");
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
    const openai = new OpenAI({ 
        dangerouslyAllowBrowser: true,
        apiKey: options.apiKey
    });

    if(options.flags["IMAGE"] == true){
        return("TODO: Image call");
    }
    const completion = await openai.chat.completions.create({
        model: options.aimodel,
        messages: [
            {"role": "user", "content": options.prompt}
        ]
    });
    return chatCompletion.choices[0].message.content;
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