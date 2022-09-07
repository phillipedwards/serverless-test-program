import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

import { ServerlessComponent } from "./serverless";

export = async () => {

    for (let i = 0; i < 50; i++) {
        new ServerlessComponent(`serverless-comp-${i}`, {
            tags: {
                Project: pulumi.getProject(),
                Stack: pulumi.getStack(),
                Component: `serverless-${i}`
            }    
        })
    }

    return {
        "HI": "HI"
    }
};
