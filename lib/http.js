import { NextResponse } from 'next/server';

export const json = (data, status = 200) => NextResponse.json(data, { status });
export const badRequest = (message) => json({ error: message }, 400);
export const unauthorized = (message = 'unauthorized') => json({ error: message }, 401);
export const notFound = (message = 'not_found') => json({ error: message }, 404);
export const notConfigured = (message) => json({ error: message }, 503);

export const VALID_DOMAINS = ['hubungan', 'karier', 'uang'];
