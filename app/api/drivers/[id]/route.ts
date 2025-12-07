import { MongoClient, ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

const client = new MongoClient(process.env.MONGODB_URI!)

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const data = await request.json()
    
    await client.connect()
    const db = client.db('printers')
    
    // מסיר את ה-_id מהנתונים כי אי אפשר לעדכן אותו
    delete data._id
    
    const result = await db.collection('driverGroups').updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    
    await client.connect()
    const db = client.db('printers')
    
    const result = await db.collection('driverGroups').deleteOne(
      { _id: new ObjectId(id) }
    )
    
    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    )
  }
}

