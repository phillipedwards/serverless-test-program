import * as AWS from "aws-sdk";
import { S3Event } from "aws-lambda";

const sqs = new AWS.SQS();
const sns = new AWS.SNS();

const queueName = process.env.QUEUE_NAME || "";
const dlqName = process.env.DLQ_NAME || "";
const topicArn = process.env.TOPIC_ARN || "";

export const handler = async (event: S3Event) => {

    console.log("Received request to create s3 objects");

    console.log(`Attempting to create ${event.Records.length} records`);

    const queueUrl = await sqs.getQueueUrl({ QueueName: queueName }).promise();
    const dlqUrl = await sqs.getQueueUrl({ QueueName: dlqName }).promise();

    for (const record of event.Records) {

        const s3Object = record.s3.object;
        console.log(`Creating object by key ${s3Object.key}`);

        const date = new Date().getUTCSeconds();
        if (date / 2 === 0) {
            await sqs.sendMessage({
                MessageBody: JSON.stringify(s3Object),
                QueueUrl: queueUrl.QueueUrl || "",
                MessageAttributes: {
                    Timestamp: {
                        DataType: "String",
                        StringValue: new Date().getUTCMilliseconds().toString(),
                    }
                }
            }).promise();
        } else {
            await sqs.sendMessage({
                MessageBody: JSON.stringify(s3Object),
                QueueUrl: dlqUrl.QueueUrl || "",
                MessageAttributes: {
                    Timestamp: {
                        DataType: "String",
                        StringValue: new Date().getUTCMilliseconds().toString(),
                    }
                }
            }).promise();
        }

        await sns.publish({
            TopicArn: topicArn,
            Message: "sqs message created",
        }).promise();

        console.log(`Successfully created object ${s3Object.key} record`);
    }
}