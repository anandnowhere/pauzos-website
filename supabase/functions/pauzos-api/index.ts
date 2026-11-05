import { handle } from './handler.mjs';
Deno.serve(request => handle(request, Deno.env.toObject()));
