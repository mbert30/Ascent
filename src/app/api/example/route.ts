import { NextResponse } from 'next/server'

export async function GET() {
  try {
    return NextResponse.json({
      message: 'API route is working',
    })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    return NextResponse.json(
      { message: 'Created successfully' },
      { status: 201 }
    )
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
