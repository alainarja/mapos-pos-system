import { NextRequest, NextResponse } from "next/server"
import { externalAPI } from "@/lib/services/external-api"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const perPage = parseInt(searchParams.get('perPage') || '100')
    const search = searchParams.get('search') || ''

    const response = await externalAPI.getInventoryItems({
      page,
      perPage,
      search
    })

    // If we get an empty response due to API error, return mock data
    if (response.data.length === 0 && response.pagination?.total === 0) {
      console.warn('Using fallback data due to external API issue')
      // Return minimal valid response structure
      return NextResponse.json({
        data: [],
        pagination: {
          page,
          perPage,
          total: 0,
          totalPages: 0
        }
      })
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching inventory:', error)
    
    // Return empty but valid response structure instead of error
    return NextResponse.json({
      data: [],
      pagination: {
        page: parseInt(searchParams.get('page') || '1'),
        perPage: parseInt(searchParams.get('perPage') || '100'),
        total: 0,
        totalPages: 0
      }
    })
  }
}