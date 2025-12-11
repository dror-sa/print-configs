import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'
import { DriverGroup, DriverLookupResult } from '../../../types'
import * as js2xmlparser from 'js2xmlparser'

const client = new MongoClient(process.env.MONGODB_URI!)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const drivers: string[] = body.drivers

    if (!Array.isArray(drivers)) {
      const xmlError = js2xmlparser.parse('Error', { message: 'drivers must be an array of strings' })
      return new NextResponse(xmlError, {
        status: 400,
        headers: { 'Content-Type': 'application/xml' }
      })
    }

    await client.connect()
    const db = client.db('printers')
    const collection = db.collection<DriverGroup>('driverGroups')

    const results: DriverLookupResult[] = []

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

    const xml = js2xmlparser.parse('DriverLookupResults', { Driver: results })
    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml' }
    })
  } catch (error) {
    const xmlError = js2xmlparser.parse('Error', { message: (error as Error).message })
    return new NextResponse(xmlError, {
      status: 500,
      headers: { 'Content-Type': 'application/xml' }
    })
  }
}