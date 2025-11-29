import { Agent, run } from '@openai/agents'

// Creating the agent
const agent = new Agent({
  name: 'History Tutor',
  instructions:
    'You provide assitance with historical queries. Explain important events and context clarity based on the user input'
})

// Running the agent
async function main () {
  const result = await run(agent, 'When did the sharks first appear ?')
  console.log(result?.finalOutput);
}

main()