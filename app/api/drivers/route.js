import { MongoClient } from 'mongodb'

const client = new MongoClient(process.env.MONGODB_URI)

export async function GET() {
  try {
    await client.connect()
    const db = client.db('printers')
    const drivers = await db.collection('driverGroups').find({}).toArray()
    
    return Response.json(drivers)
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}
