import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function ServerTime(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`ServerTime function processed request for url "${request.url}"`);

    const now = new Date();
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(now);
    const response = {formattedDate: formattedDate, now: now};

    return { jsonBody: response};
};

app.http('ServerTime', {
    methods: ['GET'],
    authLevel: 'function',
    handler: ServerTime
});
