import { app, HttpRequest, HttpResponseInit, input, InvocationContext } from "@azure/functions";

const sqlInput = input.sql({
  commandText: 'delete poc.todo where id=@Id',
  commandType: 'Text',
  parameters: '@Id={id}',
  connectionStringSetting: 'SqlConnectionString',
});

export async function DeleteById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
  context.log(`DeleteById function processed request for url "${request.url}"`);

  context.extraInputs.get(sqlInput);
  return {status: 204};
};

app.http('DeleteById', {
  methods: ['DELETE'],
  route: 'todo/{id}',
  extraInputs: [sqlInput],
  authLevel: 'function',
  handler: DeleteById
});
