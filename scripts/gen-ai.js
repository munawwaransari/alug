import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

const GEMINI_MODEL = "gemini-2.5-flash"; 

if(!window.runGeminiGenAISearch)
window.runGeminiGenAISearch = function (apiKey, aimodel, flags, prompt, useSelLang){
	
    return new Promise(async function (resolve, reject) {
        if(apiKey == undefined || apiKey == ""){
            reject("Error: API KEY is required!");
            return;
        }

        if(useSelLang){
            prompt += '\n Provide Final response in language: '+ parent.getLang();
        }

        if(flags["HTML"] == true){
            prompt += "\n Provide response in HTML format.";
        }

        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            var modelname = aimodel == "default" ? GEMINI_MODEL : aimodel;
            var modalities = flags["IMAGE"] == true ? ["image"] : undefined; 
            const model = genAI.getGenerativeModel({ model: modelname ?? GEMINI_MODEL});
            var res = (modalities === undefined) ?
                await model.generateContent(prompt):
                await model.generateContent({
                    generationConfig: {
                        responseModalities: modalities
                    }
                });
            resolve(res);
        } 
        catch (error) {
            reject("Error: " + error.message);
        }
    });
}

const OPENAI_MODEL = "gpt-3.5-turbo";

if(!window.runOpenAISearch)
window.runOpenAISearch = function (apiKey, aimodel, flags, prompt, useSelLang){
	
    return new Promise(async function (resolve, reject) {
        if(apiKey == undefined || apiKey == ""){
            reject("Error: API KEY is required!");
            return;
        }

        if(useSelLang){
            prompt += '\n Provide Final response in language: '+ parent.getLang();
        }

        if(flags["HTML"] == true){
            prompt += "\n Provide response in HTML format.";
        }

        try {
            const openai = new OpenAI({ 
                //dangerouslyAllowBrowser: true,
                apiKey: apiKey 
            });

            var modelname = aimodel == "default" ? OPENAI_MODEL : aimodel;
            const completion = await openai.chat.completions.create({
                model: modelname,
                messages: [
                    {"role": "user", "content": prompt}
                ]
            });
            resolve(chatCompletion.choices[0].message.content);
        } 
        catch (error) {
            reject("Error: " + error.message);
        }
    });
}
