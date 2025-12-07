import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'

const client = new MongoClient(process.env.MONGODB_URI!)

interface DriverGroup {
  _id: string
  groupId: string
  groupName: string
  enabled: boolean
  drivers: string[]
  dataSource: string
  notes?: string
  metadataRules: Record<string, unknown>
}

interface LookupResult {
  driver: string
  found: boolean
  config: DriverGroup | null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const drivers: string[] = body.drivers

    if (!Array.isArray(drivers)) {
      return NextResponse.json(
        { error: 'drivers must be an array of strings' },
        { status: 400 }
      )
    }

    await client.connect()
    const db = client.db('printers')
    const collection = db.collection<DriverGroup>('driverGroups')

    const results: LookupResult[] = []

    for (const driverName of drivers) {
      const group = await collection.findOne({
        drivers: driverName,
        enabled: true
      })

      results.push({
        driver: driverName,
        found: !!group,
        config: group
      })
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}