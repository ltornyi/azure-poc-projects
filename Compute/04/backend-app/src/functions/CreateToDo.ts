import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { sendToSql, UpsertToDo } from "../common/UpsertToDo";

export async function CreateToDo(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  return UpsertToDo(request, context, true);
};

app.http('CreateToDo', {
  methods: ['POST'],
  route: 'todo',
  extraOutputs: [sendToSql],
  authLevel: 'function',
  handler: CreateToDo
});
