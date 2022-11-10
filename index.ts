import * as pulumi from "@pulumi/pulumi";
import * as awsx from "@pulumi/awsx";
import * as aws from "@pulumi/aws";


import { ServerlessComponent } from "./serverless";

export = async () => {

    for (let i = 0; i < 2; i++) {
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