const { Kafka } = require('kafkajs');
const readline = require('readline');

// Create a Kafka instance
const kafka = new Kafka({
  clientId: 'my-app', // Name of the client
  brokers: ['192.168.29.175:9092'], // Replace with the correct broker address
});

// Create a readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const producer = kafka.producer();

async function run() {
  try {
    // Connect to the Kafka broker
    await producer.connect();
    console.log('Kafka producer connected.');

    // Set prompt for user input
    rl.setPrompt('Enter rider name and location (e.g., John North): ');
    rl.prompt();

    rl.on('line', async (line) => {
      const [riderName, location] = line.trim().split(' '); // Split by space

      if (!riderName || !location) {
        console.log('Invalid input. Format: <Name> <Location>');
        rl.prompt();
        return;
      }

      const partition = location.toLowerCase() === 'north' ? 0 : 1;

      // Send message to Kafka
      await producer.send({
        topic: 'rider-updates', // Topic name
        messages: [
          {
            partition,
            key: 'location-update',
            value: JSON.stringify({ name: riderName, loc: location }),
          },
        ],
      });

      console.log(`Message sent: { Name: ${riderName}, Location: ${location}, Partition: ${partition} }`);
      rl.prompt();
    }).on('close', async () => {
      console.log('Closing producer...');
      await producer.disconnect();
      console.log('Producer disconnected. Goodbye!');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);
    await producer.disconnect();
    process.exit(1);
  }
}

// Run the Kafka producer
run();
