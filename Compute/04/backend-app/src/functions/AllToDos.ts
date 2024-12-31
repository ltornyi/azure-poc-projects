import { app, HttpRequest, HttpResponseInit, input, InvocationContext } from "@azure/functions";

const sqlInput = input.sql({
  commandText: 'select id, [order], title, url, completed from poc.todo',
  commandType: 'Text',
  connectionStringSetting: 'SqlConnectionString',
});

export async function AllTodos(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`AllTodos function processed request for url "${request.url}"`);

    const toDoItems = context.extraInputs.get(sqlInput);
    context.log(`todoitems:`, toDoItems);
    return {
      jsonBody: toDoItems,
    };
};

app.http('AllTodos', {
    methods: ['GET'],
    route: 'todo',
    extraInputs: [sqlInput],
    authLevel: 'function',
    handler: AllTodos
});
