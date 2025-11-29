import { Agent, run, tool } from '@openai/agents'
import z from 'zod'
import axios from 'axios'
import { configDotenv } from 'dotenv'

configDotenv();

const weatherOutputType = z.object({
  city: z.string().describe("Name of the city"),
  degree: z.number().describe("The degree ceclius of the temperature"),
  condition: z.string().optional().describe("Condition of the weather")
});

// Creating a tool to get weather of a given city
const getWeather = tool({
  name: 'get_weathter',
  description: 'Return the weather of a given city.',
  parameters: z.object({
    city: z.string().describe('Name of the city')
  }),
  // Here we are just hardcoding the response
  // async execute({city}){
  //     return `The weather in ${city} is sunny.`;
  // },

  // Let's make an api call to get realtime weather data
  async execute ({ city }) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.toLowerCase()}&appid=${
      process.env.WEATHER_API_KEY
    }`
    const response = await axios.get(url, { responseType: 'text' })
    return `Weather of ${city} is ${response?.data}`
  }
})

// Creating a tool to send the response of the weather on the mail
const sendMail = tool({
  name: 'send_mail',
  description:
    'Sending a mail report on the email id provided by the user of the weather report generated',
  parameters: z.object({
    toEmail: z.string().describe('Email address to send'),
    subject: z.string().describe('Subject of the email'),
    body: z.string().describe('Body of the Email')
  }),
  async execute ({ body, toEmail, subject }) {
    // All logic to send the email
  }
})

const agent = new Agent({
  name: 'Weather Bot',
  instructions: 'You are a helpful weather bot',
  model: 'gpt-4.1',
  // tools: [getWeather, sendMail]
  tools: [getWeather],
  outputType: weatherOutputType
})

async function runAgentWithTool () {
  const result = await run(agent, 'What is the weather of Mumbai');
  console.log(result?.finalOutput);
}

runAgentWithTool()
