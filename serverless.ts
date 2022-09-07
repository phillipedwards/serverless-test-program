import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

export interface ServerlessArgs {
    tags: { [key: string]: string };
}

export class ServerlessComponent extends pulumi.ComponentResource {
    constructor(name: string, args: ServerlessArgs, opts?: pulumi.ComponentResourceOptions) {
        super("index:pkg:serverless", name, opts);

        const options = pulumi.mergeOptions(opts, {
            parent: this
        });

        const queue = new aws.sqs.Queue(`${name}-consumer`, {
            tags: args.tags,
        }, options);

        const topic = new aws.sns.Topic(`${name}-consumer`, {
            tags: args.tags
        }, options);

        const queueDlq = new aws.sqs.Queue(`${name}-consumer-dlq`, {
            tags: args.tags,
        }, options);

        new aws.cloudwatch.MetricAlarm(`${name}-dlq`, {
            alarmDescription: "Alarm for DLQ",
            namespace: "AWS/SQS",
            metricName: "ApproximateNumberOfMessagesDelayed",
            dimensions: {
                "Name": "QueueName",
                "Value": queueDlq.name
            },
            statistic: "Sum",
            period: 300,
            datapointsToAlarm: 1,
            evaluationPeriods: 2,
            threshold: 1,
            comparisonOperator: "GreaterThanOrEqualToThreshold",
            tags: args.tags
        }, options);

        // const bucket = new aws.s3.Bucket(`${name}`, {}, options);
        const role = new aws.iam.Role(`${name}role`, {
            assumeRolePolicy: {
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: "sts:AssumeRole",
                        Principal: {
                            Service: "lambda.amazonaws.com",
                        },
                        Effect: "Allow",
                        Sid: "",
                    },

                ]
            },
            tags: args.tags
        }, options);

        const policy = new aws.iam.Policy(`${name}-consumer`, {
            policy: JSON.stringify({
                Version: "2012-10-17",
                Statement: [
                    {
                        Action: "sns:*",
                        Effect: "Allow",
                        Resource: "*"
                    },
                    {
                        Action: ["sqs:*"],
                        Effect: "Allow",
                        Resource: "*"
                    },
                ]
            }),
            tags: args.tags
        }, options);

        new aws.iam.RolePolicyAttachment(`${name}SqsSns`, {
            role: role,
            policyArn: policy.arn,
        }, options);

        new aws.iam.RolePolicyAttachment(`${name}BasicExecutionRole`, {
            role: role,
            policyArn: aws.iam.ManagedPolicy.AWSLambdaBasicExecutionRole,
        }, options);

        new aws.lambda.Function(`${name}`, {
            runtime: aws.lambda.Runtime.NodeJS16dX,
            handler: "index.handler",
            code: new pulumi.asset.FileArchive("./app"),
            role: role.arn,
            environment: {
                variables: {
                    QUEUE_ARN: queue.arn, // sqs queue to write to
                    DLQ_ARN: queueDlq.arn,
                    TOPIC_ARN: topic.arn
                }
            },
            tags: args.tags
        }, options);

        //bucket.onObjectCreated(`${name}OnCreate`, lambda, {}, options);
    }
}