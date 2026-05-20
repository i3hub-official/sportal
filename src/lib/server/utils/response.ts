// src/lib/server/utils/response.ts
import { json } from '@sveltejs/kit';

export const ok        = <T>(data: T, status = 200)   => json({ success: true,  data },           { status });
export const created   = <T>(data: T)                  => json({ success: true,  data },           { status: 201 });
export const badRequest = (message: string)            => json({ success: false, error: message }, { status: 400 });
export const unauthorized = (message = 'Unauthorized') => json({ success: false, error: message }, { status: 401 });
export const forbidden  = (message = 'Forbidden')      => json({ success: false, error: message }, { status: 403 });
export const notFound   = (message = 'Not found')      => json({ success: false, error: message }, { status: 404 });
export const serverError = (message = 'Server error')  => json({ success: false, error: message }, { status: 500 });
