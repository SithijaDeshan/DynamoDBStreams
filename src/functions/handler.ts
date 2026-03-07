import { Handler } from "aws-lambda";

export const handler: Handler = async (event: any) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "Hello world!",
        timestamp: new Date().toISOString(),
      },
      null,
      2,
    ),
  };

  return response;
};
