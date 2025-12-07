import { MongoClient } from 'mongodb'
import { NextResponse } from 'next/server'

const client = new MongoClient(process.env.MONGODB_URI!)

export async function GET() {
  try {
    await client.connect()
    const db = client.db('printers')
    const drivers = await db.collection('driverGroups').find({}).toArray()
    
    return NextResponse.json(drivers)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    )
  }
}

