import { NextRequest, NextResponse } from "next/server"
import { externalAPI } from "@/lib/services/external-api"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const includeHierarchy = url.searchParams.get('includeHierarchy') === 'true'
    const parentOnly = url.searchParams.get('parentOnly') === 'true'

    const response = await externalAPI.getCategories({
      search,
      includeHierarchy,
      parentOnly
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    )
  }
}