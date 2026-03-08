import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyResult } from "aws-lambda";
import createLogger from "../../../Logger/logger";

const client = new DynamoDBClient({});
const TABLE_NAME = "Courses";
const logger = createLogger("createCourseService");

export const createCourse = async (
  body: any,
): Promise<APIGatewayProxyResult> => {
  const { courseId, date, title, description } = body;

  if (!courseId || !date || !title) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: "courseId, date, and title are required",
      }),
    };
  }

  try {
    await client.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        ConditionExpression: "attribute_not_exists(courseId)",
        Item: {
          courseId: { S: courseId },
          date: { S: date },
          title: { S: title },
          ...(description && { description: { S: description } }),
        },
      }),
    );
  } catch (err: any) {
    logger.error("Failed to create course", { courseId, error: err.message });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to create course" }),
    };
  }

  return {
    statusCode: 201,
    body: JSON.stringify({ message: "Course created", courseId }),
  };
};
