import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyResult } from "aws-lambda";
import createLogger from "../../../Logger/logger";

const client = new DynamoDBClient({});
const TABLE_NAME = "Courses";
const logger = createLogger("editCourseService");

export const editCourse = async (body: any): Promise<APIGatewayProxyResult> => {
  const { courseId, date, title, description } = body;

  if (!courseId || !date) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "courseId and date are required" }),
    };
  }

  try {
    await client.send(
      new UpdateItemCommand({
        TableName: TABLE_NAME,
        Key: {
          courseId: { S: courseId },
          date: { S: date },
        },
        UpdateExpression: "SET #title = :title, #description = :description",
        ExpressionAttributeNames: {
          "#title": "title",
          "#description": "description",
        },
        ExpressionAttributeValues: {
          ":title": { S: title ?? "" },
          ":description": { S: description ?? "" },
        },
        ConditionExpression: "attribute_exists(courseId)",
      }),
    );
  } catch (err: any) {
    logger.error("Failed to edit course", { courseId, error: err.message });
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Failed to edit course" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Course updated", courseId }),
  };
};
