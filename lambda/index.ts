import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

export const handler = async (event: any) => {
    const client = new DynamoDBClient({});
    const dynamoDb = DynamoDBDocumentClient.from(client);
    const data = event.body;

    // Example processing: split the text file content into lines
    const lines = data.split('\n');

    // Store each line in DynamoDB
    for (const line of lines) {
        await dynamoDb.send(new PutCommand({
            TableName: process.env.TABLE_NAME!,
            Item: { id: new Date().toISOString(), content: line }
        }));
    }

    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File processed successfully!' })
    };
};