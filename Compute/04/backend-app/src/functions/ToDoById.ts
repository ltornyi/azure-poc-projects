import { app, HttpRequest, HttpResponseInit, input, InvocationContext } from "@azure/functions";

const sqlInput = input.sql({
  commandText: 'select id, [order], title, url, completed from poc.todo where id=@Id',
  commandType: 'Text',
  parameters: '@Id={id}',
  connectionStringSetting: 'SqlConnectionString',
});

export async function ToDoById(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`ToDoById function processed request for url "${request.url}"`);

    const toDoItems = context.extraInputs.get(sqlInput);
    context.log(`todoitems:`, toDoItems);
    const todo = toDoItems[0];
    if (todo) {
      return {
        jsonBody: todo,
      };
    } else {
      return {
        status: 404
      }
    }
};

app.http('ToDoById', {
    methods: ['GET'],
    route: 'todo/{id}',
    extraInputs: [sqlInput],
    authLevel: 'function',
    handler: ToDoById
});
