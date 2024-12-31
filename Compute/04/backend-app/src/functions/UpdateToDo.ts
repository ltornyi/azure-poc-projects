import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { sendToSql, UpsertToDo } from "../common/UpsertToDo";

export async function UpdateToDo(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    return UpsertToDo(request, context, false);
};

app.http('UpdateToDo', {
    methods: ['PUT'],
    route: 'todo/{id}',
    extraOutputs: [sendToSql],
    authLevel: 'function',
    handler: UpdateToDo
});
