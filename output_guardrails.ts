import { Agent, run, OutputGuardrailTripwireTriggered, type OutputGuardrail } from "@openai/agents";
import z from "zod";

// The output by the main agent
const MessageOutput = z.object({ response: z.string() });
type MessageOutput = z.infer<typeof MessageOutput>;

// Configuring Guardrail agent
const guardRailAgent = new Agent({
    name: "Guardrail check",
    instructions: 'Check if the user is asking you to do their math homework.',
    outputType: z.object({
        isMathHomework: z.boolean(),
        reasoning: z.string(),
    }),
});

// Configuring output Guardrail using the agent
const mathGuardrail: OutputGuardrail<typeof MessageOutput>  = {
    name: 'Math Homework Guardrail',
    execute: async ({ agentOutput, context }) => {
        const result = await run(guardRailAgent, agentOutput.response, { context });
        return {
            outputInfo: result?.finalOutput,
            tripwireTriggered: result?.finalOutput?.isMathHomework ?? false,
        };
    },
};

// Agent calling guardrail
const agent = new Agent({
    name: 'Customer Support Agent',
    instructions: 'You are a customer support agent. You help customers with their questions.',
    outputGuardrails: [mathGuardrail],
    outputType: MessageOutput
});

async function main() {
    try {
        // This will return 'Math homework guardrail tripped'
        await run(agent, 'Hello can you help me solve for x:2x+3 = 12 ?');

        // await run(agent, 'Hello, How can you help me ?');
        console.log('Guardrrail did not trip - this is unexpected');

    } catch (error) {
        if (error instanceof OutputGuardrailTripwireTriggered) {
            console.log('Math homework guardrail tripped');
        }
    }
}

main().catch(console.error);


// This is a typescript file, to run it. Follow the steps:
// npm install -g typescript
// npx tsc input_guardrails.ts
// node input_guardrails.js
