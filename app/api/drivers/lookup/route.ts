import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'
import { DriverGroup, DriverLookupResult } from '../../../types'
import * as js2xmlparser from 'js2xmlparser'

const client = new MongoClient(process.env.MONGODB_URI!)

// פונקציה לניקוי והמרת הנתונים ל-XML
function prepareForXml(obj: any): any {
  if (obj === null || obj === undefined) return obj
  
  if (Array.isArray(obj)) {
    return obj.map(prepareForXml)
  }
  
  if (typeof obj === 'object') {
    const newObj: any = {}
    
    for (const [key, value] of Object.entries(obj)) {
      // מוחק _id של MongoDB
      if (key === '_id') continue
      
      // ממיר mapping object למערך
      if (key === 'mapping' && typeof value === 'object' && !Array.isArray(value)) {
        newObj[key] = {
          item: Object.entries(value || {}).map(([k, v]: [any, any]) => ({
            key: k,
            value: v
          }))
        }
      } else {
        newObj[key] = prepareForXml(value)
      }
    }
    return newObj
  }
  
  return obj
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const drivers: string[] = body.drivers

    if (!Array.isArray(drivers)) {
      const xmlError = js2xmlparser.parse('Error', { 
        message: 'drivers must be an array of strings' 
      })
      return new NextResponse(xmlError, {
        status: 400,
        headers: { 'Content-Type': 'application/xml; charset=utf-8' }
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
        config: group ? prepareForXml(group) : undefined
      })
    }

    const xml = js2xmlparser.parse('DriverLookupResults', 
      { Driver: results },
      { 
        declaration: { encoding: 'UTF-8' }
      }
    )
    
    return new NextResponse(xml, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    })
  } catch (error) {
    const xmlError = js2xmlparser.parse('Error', { 
      message: (error as Error).message 
    })
    return new NextResponse(xmlError, {
      status: 500,
      headers: { 'Content-Type': 'application/xml; charset=utf-8' }
    })
  }
}