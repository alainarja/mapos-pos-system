import { NextResponse } from "next/server"

/**
 * Verifies that an incoming Request is authorized to access the external APIs that this
 * application exposes. The caller must provide a valid `x-api-key` header whose value
 * matches the `EXTERNAL_API_KEY` environment variable. If the key is missing or
 * incorrect, an immediate 401 JSON response is returned – otherwise `null` is
 * returned so the calling route can continue processing.
 */
export function authorizeExternalRequest(request: Request): NextResponse | null {
  const apiKeyHeader = request.headers.get("x-api-key")?.trim()
  const authHeader = request.headers.get("authorization")?.trim()

  const expectedKey = process.env.EXTERNAL_API_KEY

  const bearerMatch = authHeader?.match(/^Bearer\s+(.*)$/i)
  const providedKey = apiKeyHeader || bearerMatch?.[1]

  if (!expectedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  return null
}