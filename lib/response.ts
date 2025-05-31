import { NextResponse } from 'next/server';

/**
 * Standard CORS headers for API routes.
 */
export const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
};

/**
 * Helper for returning JSON error responses with standard CORS headers.
 */
export function errorResponse(body: unknown, status = 400) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}

/**
 * Helper for returning JSON success responses with standard CORS headers.
 */
export function successResponse(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: CORS_HEADERS });
}