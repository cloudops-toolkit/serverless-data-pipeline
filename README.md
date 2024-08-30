## Serverless Data Pipeline

This project deploys a serverless data pipeline using AWS CDK.

### Prerequisites
- AWS CLI configured
- AWS CDK installed (`npm install -g aws-cdk`)

### Setup

1. Install dependencies:
   ```bash
   npm install

2. Bootstrap the CDK environment (if not already done):

   ```bash
   cdk bootstrap

3. Deploy the stack:

   ```bash
   cdk deploy

## Testing the Endpoint

Once deployed, you can use `curl` or Postman to test the API.

### Using `curl`

Here’s an example `curl` command to test the API:

```bash
curl -X POST https://<api-id>.execute-api.<region>.amazonaws.com/prod/ \
     -d @testfile.txt \
     --header "x-api-key: <api-key>"
```

### Create a New Postman Request

1. **Method:** POST

2. **URL:** `https://<api-id>.execute-api.<region>.amazonaws.com/<stage>/`

3. **Headers:** Add a header with the key `x-api-key` and the value set to the API key you created.

4. **Body:** Set the body to raw and select JSON format. Use the following example payload:

```json
{
  "body": "line1\nline2\nline3"
}
```

### Send the Request

Click the **Send** button in Postman. You should receive a response from the Lambda function indicating the status of the request.

