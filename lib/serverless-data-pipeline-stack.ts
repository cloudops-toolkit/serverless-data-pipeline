import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as snsSubscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as cwActions from 'aws-cdk-lib/aws-cloudwatch-actions';

export class ServerlessDataPipelineStack extends cdk.Stack {
    constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const table = new dynamodb.Table(this, 'TextFileDataTable', {
            partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING }
        });

        const lambdaFunction = new lambda.Function(this, 'TextFileProcessorFunction', {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset('lambda'),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: table.tableName
            }
        });

        table.grantReadWriteData(lambdaFunction);

        const api = new apigateway.RestApi(this, 'TextFileProcessorApi', {
            restApiName: 'Text File Processor API',
            description: 'API for uploading and processing text files.',
        });

        api.root.addMethod('POST', new apigateway.LambdaIntegration(lambdaFunction), {
            apiKeyRequired: true,
        });

        const plan = api.addUsagePlan('UsagePlan', {
            name: 'BasicUsagePlan',
            apiStages: [{ api, stage: api.deploymentStage }],
            throttle: { rateLimit: 10, burstLimit: 2 }
        });

        const key = api.addApiKey('ApiKey');
        plan.addApiKey(key);

        // CloudWatch Monitoring and Alarms
        const snsTopic = new sns.Topic(this, 'LambdaAlarmTopic', {
            displayName: 'Lambda Function Alarm Topic',
        });

        snsTopic.addSubscription(new snsSubscriptions.EmailSubscription('your-email@example.com'));

        const lambdaErrorMetric = lambdaFunction.metricErrors();
        const errorAlarm = new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
            metric: lambdaErrorMetric,
            threshold: 1,
            evaluationPeriods: 1,
            alarmDescription: 'Alarm when the Lambda function errors exceed 1 in 1 minute',
        });

        errorAlarm.addAlarmAction(new cwActions.SnsAction(snsTopic));

        const lambdaDurationMetric = lambdaFunction.metricDuration();
        const durationAlarm = new cloudwatch.Alarm(this, 'LambdaDurationAlarm', {
            metric: lambdaDurationMetric,
            threshold: 5000,
            evaluationPeriods: 1,
            alarmDescription: 'Alarm when the Lambda function duration exceeds 5 seconds',
        });

        durationAlarm.addAlarmAction(new cwActions.SnsAction(snsTopic));
    }
}
