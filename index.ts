import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";

import { ServerlessComponent } from "./serverless";

export = async () => {
    const awsProvider = new aws.Provider("aws-provider", {
        accessKey: process.env["AWS_ACCESS_KEY_ID"],
        secretKey: process.env["AWS_SECRET_ACCESS_KEY"],
        token: process.env["AWS_SESSION_TOKEN"],
    });
    
    for (let i = 0; i < 2; i++) {
        new ServerlessComponent(`serverless-comp-${i}`, {
            tags: {
                Project: pulumi.getProject(),
                Stack: pulumi.getStack(),
                Component: `serverless-${i}`
            }    
        }, { provider: awsProvider})
    }

    return {
        "HI": "HI"
    }
};

/*
===============
Pulumi Service Backend
===============
- pulumi up -f --non-interactive -p 250     :: 6:17
- pulumi up -f --non-interactive -p 100     :: 6:31
- pulumi up -f --non-interactive            :: 9:59

===============
Local Filestate Backend
===============
- pulumi up -f --non-interactive -p 250     :: 5:20
- pulumi up -f --non-interactive -p 100     :: 5:22
- pulumi up -f --non-interactive            :: 5:12

*/