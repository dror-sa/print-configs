import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'
import * as js2xmlparser from 'js2xmlparser'

const client = new MongoClient(process.env.MONGODB_URI!)

// ══════════════════════════════════════════════════════════════
// TYPES
// ══════════════════════════════════════════════════════════════

interface DriverGroup {
  groupId: string
  groupName: string
  enabled: boolean
  drivers: Array<{ name: string; enabled: boolean }> 
  dataSource: 'metadata' | 'data'
  notes?: string
  metadataRules?: Record<string, any>
  driverSettings?: Array<{
    driverName: string
    takeCopiesFromData?: boolean
    notes?: string
  }>
}

// ══════════════════════════════════════════════════════════════
// CONVERT TO XML FORMAT
// ══════════════════════════════════════════════════════════════

function toXmlFormat(group: DriverGroup, requestedDriver: string): any {
  const result: any = {
    groupId: group.groupId,
    groupName: group.groupName,
    drivers: requestedDriver,
    enabled: group.enabled,
    dataSource: group.dataSource,
    notes: group.notes
  }

  // Metadata Rules - convert mapping objects to item arrays
  if (group.metadataRules) {
    result.metadataRules = {}
    for (const [name, rule] of Object.entries(group.metadataRules)) {
      result.metadataRules[name] = convertMappings(rule)
    }
  }

  // Driver Settings - filter for requested driver only
  if (group.driverSettings?.length) {
    const settings = group.driverSettings.filter(s => s.driverName === requestedDriver)
    if (settings.length) {
      result.driverSettings = { setting: settings }
    }
  }

  return result
}

function convertMappings(rule: any): any {
  if (!rule || typeof rule !== 'object') return rule

  const converted = { ...rule }

  // mapping: { "0": "color" } → { item: [{ key: "0", value: "color" }] }
  if (rule.mapping && typeof rule.mapping === 'object' && !Array.isArray(rule.mapping)) {
    converted.mapping = {
      item: Object.entries(rule.mapping).map(([key, value]) => ({
        key,
        value: String(value)
      }))
    }
  }

  return converted
}

// ══════════════════════════════════════════════════════════════
// API HANDLERS
// ══════════════════════════════════════════════════════════════

export async function GET() {
  try {
    await client.connect()
    const collection = client.db('printers').collection<DriverGroup>('driverGroups')
    const drivers = await collection.distinct('drivers')
    return NextResponse.json({ count: drivers.length, drivers })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 })
  }
}
export async function POST(request: Request) {
  try {
    const { drivers } = await request.json()

    if (!Array.isArray(drivers)) {
      return xmlResponse({ Error: { message: 'drivers must be an array' } }, 400)
    }

    await client.connect()
    const collection = client.db('printers').collection<DriverGroup>('driverGroups')

    const results = await Promise.all(
      drivers.map(async (driverName: string) => {
        // חיפוש גרופ פעיל שמכיל את הדרייבר
        const group = await collection.findOne({
          enabled: true,
          drivers: {
            $elemMatch: {
              name: driverName,
              enabled: true
            }
          }
        })

        return {
          driver: driverName,
          found: !!group,
          config: group ? toXmlFormat(group, driverName) : undefined
        }
      })
    )

    return xmlResponse({ Driver: results })
  } catch (error) {
    return xmlResponse({ Error: { message: (error as Error).message } }, 500)
  }
}

function xmlResponse(data: any, status = 200) {
  const xml = js2xmlparser.parse('DriverLookupResults', data, {
    declaration: { encoding: 'UTF-8' }
  })
  return new NextResponse(xml, {
    status,
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  })
}