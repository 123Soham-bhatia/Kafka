const { Kafka } = require('kafkajs');

// Create a Kafka instance
const kafka = new Kafka({
  clientId: 'my-app', // Name of the client
  brokers: ['192.168.29.175:9092'], // Replace with the correct broker address
});

// Retrieve group ID from command line arguments
const groupId = process.argv[2] || 'default-group'; // Default group if none provided

// Create a Kafka consumer with the specified group ID
const consumer = kafka.consumer({ groupId });

async function run() {
  try {
    // Connect to the Kafka consumer
    await consumer.connect();
    console.log(`Kafka consumer connected to group: ${groupId}`);

    // Subscribe to the 'rider-updates' topic
    await consumer.subscribe({ topic: 'rider-updates', fromBeginning: true });
    console.log("Subscribed to topic 'rider-updates'");

    // Run the consumer to process messages
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        const key = message.key ? message.key.toString() : null;
        const value = message.value.toString();

        console.log(`Group: ${groupId} | Received message:
          Topic: ${topic}
          Partition: ${partition}
          Key: ${key}
          Value: ${value}`);
      },
    });
  } catch (error) {
    console.error(`Error in consumer (Group: ${groupId}):`, error);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log(`Disconnecting consumer from group: ${groupId}`);
  await consumer.disconnect();
  console.log(`Consumer in group: ${groupId} disconnected. Goodbye!`);
  process.exit(0);
});

// Run the Kafka consumer
run().catch(console.error);
