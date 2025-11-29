import { Agent, run, tool } from '@openai/agents'
import z from 'zod'
import fs from 'node:fs/promises'

// Tool for fetching available flight
const fetchAvailableFlights = tool({
  name: 'fetch_available_flights',
  description: 'Fetches the available flights for the user',
  parameters: z.object({
    flight_number: z.string().describe('Flight Number'),
    price: z.number().describe('The flight number'),
    time: z.string().describe('The time of the flight')
  }),
  execute: async function () {
    return [
      {
        flight_number: 'AI1223',
        price: 3442,
        time: '12:20'
      },
      {
        flight_number: 'IN1343',
        price: 3454,
        time: '8:42'
      },
      {
        flight_number: 'SP1463',
        price: 6754,
        time: '02:40'
      }
    ]
  }
})

const bookingTool = tool({
  name: 'booking_tool',
  description: 'tool which books the user flights',
  parameters: z.object({
    name: z.string().describe('name of the person booking'),
    date: z.string().describe('Date of travel'),
    numberOfPassengers: z
      .number()
      .describe('number of the passengers travelling')
  }),
  execute: async function ({ name, date, numberOfPassengers }) {
    await fs.appendFile(
      './bookingTicket.txt',
      `Ticket Booked for ${name} for ${date} and number of travelling passengers are ${numberOfPassengers}\n`,
      'utf-8'
    )
    return `Booked ticket for ${name} on ${date} for ${numberOfPassengers} passenger(s).`
  }
})

const bookingAgent = new Agent({
  name: 'Booking expert',
  instructions: 'Answer booking questions and modify reservations.',
  tools: [bookingTool]
})

const refundAgent = new Agent({
  name: 'Refund expert',
  instructions: 'Help customers process refunds and credits.'
})

const customerFacingAgent = new Agent({
  name: 'Customer Facing Agent',
  instructions:
    'Talk to the user directly. When they need booking or refund help, call the matching tool as needed',
  tools: [
    // asTool helps convert the agent into a tool
    bookingAgent.asTool({
      toolName: 'booking_expert',
      toolDescription: 'Handles booking questions and requests'
    }),
    refundAgent.asTool({
      toolName: 'refund_expert',
      toolDescription: 'Handles refund questions and requests'
    }),
    fetchAvailableFlights
  ]
})

async function runAgent (query = '') {
  const result = await run(customerFacingAgent, query)
  console.log(result.finalOutput)
}

// Get the data for a particular flight
// runAgent(`Hey There, What are the available flights for flight number AI1223 ?`);

// Booking flight
runAgent(
  `I want to book the flight AI1223 for 20th December. My name is Aditya Trivedi and number of travelling people is 1`
)

// Refund Agent
// runAgent(`I want refund on my flight AI1223`);
