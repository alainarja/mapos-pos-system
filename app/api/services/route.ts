import { NextRequest, NextResponse } from "next/server"
import { externalAPI } from "@/lib/services/external-api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '100')
    const search = searchParams.get('search') || ''

    const response = await externalAPI.getServices({
      page,
      perPage,
      search
    })

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services data' },
      { status: 500 }
    )
  }
}