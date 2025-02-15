export type AmplifyDependentResourcesAttributes = {
    "auth": {
        "platelet61a0ac07": {
            "IdentityPoolId": "string",
            "IdentityPoolName": "string",
            "UserPoolId": "string",
            "UserPoolArn": "string",
            "UserPoolName": "string",
            "AppClientIDWeb": "string",
            "AppClientID": "string",
            "CreatedSNSRole": "string"
        }
    },
    "api": {
        "platelet": {
            "GraphQLAPIIdOutput": "string",
            "GraphQLAPIEndpointOutput": "string"
        }
    },
    "function": {
        "PlateletTaskResolvers": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        },
        "plateletImageResize": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "geo": {
        "plateletPlaceIndex": {
            "Name": "string",
            "Region": "string",
            "Arn": "string"
        }
    },
    "storage": {
        "plateletStorage": {
            "BucketName": "string",
            "Region": "string"
        }
    }
}