const config = {
  s3: {
    REGION: "sa-east-1",
    BUCKET: "dbx-notes-app",
  },
  apiGateway: {
    REGION: "sa-east-1",
    URL: "https://mgezb0xxlg.execute-api.sa-east-1.amazonaws.com/dev",
  },
  cognito: {
    REGION: "sa-east-1",
    USER_POOL_ID: "sa-east-1_L8StFriGS",
    APP_CLIENT_ID: "5856863gvq3atkrs7nf9bgh9h3",
    IDENTITY_POOL_ID: "sa-east-1:8d5236c2-a59d-47d6-9222-e894116cb40c",
  },
};

export default config;

