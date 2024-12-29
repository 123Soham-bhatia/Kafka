const { Kafka } = require('kafkajs');

const kafka = new Kafka({
    clientId: "my-app",
    brokers: ["192.168.29.175:9092"], // Use your broker's address
});

const admin = kafka.admin();

async function init() {
  // Connect to Kafka
  try {
    await admin.connect();
    console.log('Connecting to Kafka');
    console.log('Kafka connected');

    // Create topic with replication-factor of 1
    console.log("Creating topic 'rider-updates' with replication-factor 1");

    await admin.createTopics({
      topics: [
        {
          topic: 'rider-provider',
          numPartitions: 2, // Number of partitions
          replicationFactor: 1, // Ensure you have enough brokers for this replication factor
        },
      ],
    });

    console.log("Topic 'rider-updates' created successfully");
  } catch (error) {
    console.error('Error creating topic:', error);
  } finally {
    // Disconnect the admin once done
    console.log('Disconnecting admin');
    await admin.disconnect();
  }
}

init().catch(console.error);
