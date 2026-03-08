import { DynamoDBStreamEvent, DynamoDBStreamHandler } from "aws-lambda";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import createLogger from "../../Logger/logger";

const logger = createLogger("CourseAuditLogger");

export const handler: DynamoDBStreamHandler = async (
  event: DynamoDBStreamEvent,
) => {
  for (const record of event.Records) {
    try {
      const eventType = record.eventName;

      const newImage = record.dynamodb?.NewImage
        ? unmarshall(record.dynamodb.NewImage as Record<string, AttributeValue>)
        : null;

      const oldImage = record.dynamodb?.OldImage
        ? unmarshall(record.dynamodb.OldImage as Record<string, AttributeValue>)
        : null;

      logger.info(`Course ${eventType}`, { eventType, oldImage, newImage });
    } catch (error) {
      logger.error("Error processing DynamoDB stream record", {
        error,
        record,
      });
    }
  }
};
