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

    // Filter to only include Sales category and its children for POS
    let filteredData = response.data
    
    if (Array.isArray(filteredData)) {
      // Find the Sales category
      const salesCategory = filteredData.find(cat => cat.name === 'Sales')
      
      if (salesCategory) {
        if (includeHierarchy && salesCategory.children) {
          // If hierarchy is requested, return Sales with its children
          filteredData = [salesCategory]
        } else {
          // If flat structure, return Sales and all its children
          const salesChildren = filteredData.filter(cat => cat.parent_id === salesCategory.id)
          filteredData = [salesCategory, ...salesChildren]
        }
      } else {
        // If no Sales category found, return empty array
        filteredData = []
      }
    }

    return NextResponse.json({
      ...response,
      data: filteredData,
      count: filteredData.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories', details: error.message },
      { status: 500 }
    )
  }
}