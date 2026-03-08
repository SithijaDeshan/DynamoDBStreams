import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from "aws-lambda";
import { createCourse } from "./services/createCourseService";
import { editCourse } from "./services/editCourseService";
import { deleteCourse } from "./services/deleteCourseService";

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const path = event.path;
    const body = event.body ? JSON.parse(event.body) : {};

    switch (path) {
        case "/courses/add":
            return await createCourse(body);

        case "/courses/edit":
            return await editCourse(body);

        case "/courses/delete":
            return await deleteCourse(body);

        default:
            return {
                statusCode: 404,
                body: JSON.stringify({ message: `Route not found: ${path}` }),
            };
    }
};