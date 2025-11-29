import { Agent, run } from '@openai/agents'

const agent = new Agent({
  name: 'Storyteller',
  instructions:
    'You are a storyteller. You will be given a topic and you will tell a story about it.'
})

async function main () {
  const result = await run(agent, 'Tell me a story about a cat.', {
    stream: true
  });
  
//   Normally we get the response with toTextStream. But to get all the response just like we get on GPT, we add compatibleWithNodeStreams and pipe it to process.stdout
  const stream = await result?.toTextStream({
    compatibleWithNodeStreams: true
  }).pipe(process.stdout);

  for await(const val of stream){
    console.log(val);
  }
  
}

main()
