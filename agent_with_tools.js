import { Agent, run, tool } from "@openai/agents";
import z from "zod";

// Creating a tool to get weather of a given city
const getWeather = tool({
    name: 'get_weathter',
    description: 'Return the weather of a given city.',
    parameters: z.object({
        city: z.string()
    }),
    // Here we are just hardcoding the response
    async execute({city}){
        return `The weather in ${city} is sunny.`;
    },

});

const agent = new Agent({
    name: 'Weather Bot',
    instructions: 'You are a helpful weather bot',
    model: 'gpt-4.1',
    tools:[getWeather],
});

async function runAgentWithTool() {
    const result = await run(agent,'Bengaluru');
    console.log(result?.finalOutput);
}

runAgentWithTool();