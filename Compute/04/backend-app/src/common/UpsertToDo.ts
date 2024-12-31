import { HttpRequest, HttpResponseInit, output, InvocationContext} from "@azure/functions";
import { randomUUID } from 'crypto';

import { ToDo } from "./ToDo";

export const sendToSql = output.sql({
  commandText: 'poc.todo',
  connectionStringSetting: 'SqlConnectionString',
});

export async function UpsertToDo(request: HttpRequest, context: InvocationContext, create: boolean): Promise<HttpResponseInit> {
  let requestBody: ToDo;
  try {
    requestBody = await request.json() as ToDo;
    context.log(`UpsertToDo function processed request for requestBody: ${JSON.stringify(requestBody)}, create: ${create}`);
  } catch {
    return {status: 500, body: 'Error while parsing payload'}
  }

  const {order, title, url, completed} = requestBody;

  if (!title || !url) {
    return {status: 500, body: 'Title and Url are required'}
  }

  //array of records for SQL output
  const thisId = create ? randomUUID() : request.params.id;
  const data = [
    {
      id: thisId,
      order: order??1,
      title: title,
      url: url,
      completed: completed??false,
    },
  ];

  context.extraOutputs.set(sendToSql, JSON.stringify(data));

  const successStatus = create ? 201 : 200;

  return {status: successStatus, jsonBody: data[0]}
}