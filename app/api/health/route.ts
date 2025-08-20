import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'MAPOS POS System',
    version: '1.0.0'
  })
}

export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}