import express from "express";
import { WebhookClient } from "dialogflow-fulfillment";
import { ChatGPT } from "chatgpt-official";
import { validarCedula } from "./controllers/cedula.validator.js";
import { v4 as uuidv4 } from 'uuid';
import morgan from "morgan";

const app = express();
// Middlewares
app.use(morgan("dev"));
const optionsCategorizer = {
	temperature: 0.7, // OpenAI parameter
	max_tokens: 100, // OpenAI parameter [Max response size by tokens]
	top_p: 0.9, // OpenAI parameter
	frequency_penalty: 0, // OpenAI parameter
	presence_penalty: 0, // OpenAI parameter
	instructions: `debes categorizar los mensajes dentro de 1 de las siguientes categorias: AFFILIATE_NUMBER, NUCLEUS_FAMILY, ACCOUNT_STATUS, MEDICINE_COVERAGE, HEALTH_PLAN. solo responde con el tipo de categoría, no respondas nada más NUNCA`, // initial instructions for the bot
	model: "gpt-3.5-turbo", // OpenAI parameter  `gpt-3.5-turbo` is PAID
};

const optionsAnswer = {
	temperature: 0.8, // OpenAI parameter
	max_tokens: 100, // OpenAI parameter [Max response size by tokens]
	top_p: 0.9, // OpenAI parameter
	frequency_penalty: 0.3, // OpenAI parameter
	presence_penalty: 0, // OpenAI parameter
	instructions: `Eres un agente basado inteligencia artificial trabajado por Opensoft Dominicana. Tú nombre es Zoe, estás a cargo de brindarle ayuda a los pacientes, usuarios y clientes de ARS Plan Salud. Debes ayudar a los usuarios con todas las preguntas respecto a la ARS o algo referente a la salud pero no des consejos de medicamentos. La dirección de nuestras oficinas es: Av. Pedro Henríquez Ureña esq. Av. Leopoldo Navarro. Los números de teléfonos son: (809) 221-9111 extensiones 4000, 3925 y 3920. Si no necesitan más ayuda o que ya no tienen más preguntas, dile al usuario que muchas gracias por utilizar nuestros servicios y que pase feliz resto del día. Las respuestas que sean precisas y que no sean largas. Si preguntan por "sisaril" dale una respuesta en base a "sisalril". Para el numero de afiliado, debes preguntarle a los usuarios su numero de cedula. Para saber el nucleo familiar, debes pedirle a los usuarios su numero de cedula. Para saber su estado de cuenta, dedbes pedirle a los usuarios su numero de cedula. Para saber la cobertura de medicamentos, debes pedirle que tipo de plan de salud tiene activo en su cuenta. Si el usuario no sabe que plan tiene activo, preguntale su numero de cedula para poder brindarle esa informacion. Para saber el plan de salud, debes pedirle su numero de cedula. Si dicen "Hola" Es un saludo, debes tomarlo como tal`, // initial instructions for the bot
	model: "gpt-3.5-turbo", // OpenAI parameter  `gpt-3.5-turbo` is PAID
};


const bot = new ChatGPT("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", optionsAnswer);
const botCategorizer = new ChatGPT("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", optionsCategorizer);

app.post("/", express.json(), function (request, response) {
  const agent = new WebhookClient({ request, response });

  async function fallback(agent) {
    const conversationId = "regular-conversation";
      const categorizerID = "categorizer";
      const responseCategorizer = await botCategorizer.ask(request.body.queryResult.queryText, categorizerID);
      const response1 = await bot.ask(request.body.queryResult.queryText, conversationId);
      
      
      if (responseCategorizer == 'AFFILIATE_NUMBER') {
        
        await agent.context.set('AFFILIATE_NUMBER', 1, {'cedula' : request.body.queryResult.queryText});
        
        //console.log(agent.context.get('AFFILIATE_NUMBER'));        
        const cedulaValidator = validarCedula(request.body.queryResult.queryText);

        if (cedulaValidator) {                 
          const cedulaValidatorS = validarCedula(request.body.queryResult.queryText);
          if (cedulaValidatorS) {
            agent.add("Su número de afiliado es 100470726");
            setTimeout(() => {
              agent.context.delete('AFFILIATE_NUMBER');
            }, 2000);
          }
        }  else {
          agent.add("Para poder brindar información personal sobre un usuario necesitaré hacer unas preguntas de seguridad");
          agent.add("Por favor ingresar un número de cédula válido para poder brindarle su número de afiliado en formato (XXXXXXXXXXX)");
        }
        agent.context.delete('AFFILIATE_NUMBER');

        
        
        
        
        
      } else if (responseCategorizer == 'NUCLEUS_FAMILY') {
        agent.add('Entiendo que deseas saber tu nucleo familiar');
        agent.add('Actualmente estamos trabajando conectando los webservice para proveerte esa información');
      } else if (responseCategorizer == 'ACCOUNT_STATUS') {
        agent.add('Entiendo que deseas saber tu estado de cuenta');
        agent.add('Actualmente estamos trabajando conectando los webservice para proveerte esa información');
      } else if (responseCategorizer == 'MEDICINE_COVERAGE') {
        agent.add('Entiendo que deseas saber la cobertura de médicamentos');
        agent.add('Actualmente estamos trabajando conectando los webservice para proveerte esa información');
      } else if (responseCategorizer == 'HEALTH_PLAN') {
        agent.add('Entiendo que deseas saber el plan de salud');
        agent.add('Actualmente estamos trabajando conectando los webservice para proveerte esa información');

      } else {
        agent.add(response1);
        
      }
      console.log(response1);
  
  }

  let intentMap = new Map();
  intentMap.set("Default Fallback Intent", fallback);
  agent.handleRequest(intentMap);
});

let port = 3000;

app.listen(port, () => {
  console.log('we are online');
})