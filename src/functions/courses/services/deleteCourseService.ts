import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyResult } from "aws-lambda";
import createLogger from "../../../Logger/logger";

const client = new DynamoDBClient({});
const TABLE_NAME = "Courses";
const logger = createLogger("deleteCourseService");

export const deleteCourse = async (
  body: any,
): Promise<APIGatewayProxyResult> => {
  const { courseId, date } = body;

  if (!courseId || !date) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "courseId and date are required" }),
    };
  }

  try {
    await client.send(
      new DeleteItemCommand({
        TableName: TABLE_NAME,
        Key: {
          courseId: { S: courseId },
          date: { S: date },
        },
        ConditionExpression: "attribute_exists(courseId)",
      }),
    );
  } catch (err: any) {
    logger.error("Failed to delete course", { courseId, error: err.message });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to delete course" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Course deleted", courseId }),
  };
};
