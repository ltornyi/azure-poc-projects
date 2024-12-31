import { app, HttpRequest, HttpResponseInit, input, InvocationContext } from "@azure/functions";
import { ToDo } from "../common/ToDo";

const sqlInput = input.sql({
  commandText: 'select id, [order], title, url, completed from poc.todo',
  commandType: 'Text',
  connectionStringSetting: 'SqlConnectionString',
});

export async function AllTodos(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`AllTodos function processed request for url "${request.url}"`);

    const toDoItems = context.extraInputs.get(sqlInput) as ToDo[];
    context.log(`todoitems count: ${toDoItems.length}`);
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
