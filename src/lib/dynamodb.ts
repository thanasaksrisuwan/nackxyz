import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const region = process.env.AWS_DEFAULT_REGION || process.env.AWS_REGION || "ap-southeast-1";

const clientConfig: any = {
  region,
};

// If AWS credentials are explicitly provided in environment
if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
  clientConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
}

const ddbClient = new DynamoDBClient(clientConfig);

export const ddbDocClient = DynamoDBDocumentClient.from(ddbClient, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

export const TABLE_NAME = process.env.DYNAMODB_TABLE || "";
