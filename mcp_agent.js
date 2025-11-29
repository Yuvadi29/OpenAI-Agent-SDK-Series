import { Agent, hostedMcpTool, run } from '@openai/agents';

export const agent = new Agent({
  name: 'MCP Assistant',
  instructions: 'You must always use the MCP tools to answer questions.',
  tools: [
    hostedMcpTool({
      serverLabel: 'gitmcp',
      serverUrl: 'https://gitmcp.io/Yuvadi29/OpenAI-Agent-SDK-Series',
    }),
  ],
});

async function main() {
  const result = await run(
    agent,
    'Which is the language i have written all the code in ?',
    {stream: true}
  );

  for await (const event of result) {
    if (
      event.type === 'raw_model_stream_event' &&
      event.data.type === 'model' &&
      event.data.event.type !== 'response.mcp_call_arguments.delta' &&
      event.data.event.type !== 'response.output_text.delta'
    ) {
      console.log(`Got event of type ${JSON.stringify(event.data)}`);
    }
  }
  console.log(`Done streaming; final result: ${result.finalOutput}`);
}

main().catch(console.error);