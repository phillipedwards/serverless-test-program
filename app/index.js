"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = require("aws-sdk");
const sqs = new AWS.SQS();
const sns = new AWS.SNS();
const queueName = process.env.QUEUE_NAME || "";
const dlqName = process.env.DLQ_NAME || "";
const topicArn = process.env.TOPIC_ARN || "";
exports.handler = (event) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Received request to create s3 objects");
    console.log(`Attempting to create ${event.Records.length} records`);
    const queueUrl = yield sqs.getQueueUrl({ QueueName: queueName }).promise();
    const dlqUrl = yield sqs.getQueueUrl({ QueueName: dlqName }).promise();
    for (const record of event.Records) {
        const s3Object = record.s3.object;
        console.log(`Creating object by key ${s3Object.key}`);
        const date = new Date().getUTCSeconds();
        if (date / 2 === 0) {
            yield sqs.sendMessage({
                MessageBody: JSON.stringify(s3Object),
                QueueUrl: queueUrl.QueueUrl || "",
                MessageAttributes: {
                    Timestamp: {
                        DataType: "String",
                        StringValue: new Date().getUTCMilliseconds().toString(),
                    }
                }
            }).promise();
        }
        else {
            yield sqs.sendMessage({
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
        yield sns.publish({
            TopicArn: topicArn,
            Message: "sqs message created",
        }).promise();
        console.log(`Successfully created object ${s3Object.key} record`);
    }
});
//# sourceMappingURL=index.js.map