import { MongoClient, ObjectId } from 'mongodb'
import { NextRequest, NextResponse } from 'next/server'

const client = new MongoClient(process.env.MONGODB_URI!)

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // הפרדת שדות מיוחדים מהנתונים
    const { _id, _changeReason, history: _, ...newData } = body
    
    await client.connect()
    const db = client.db('printers')
    const collection = db.collection('driverGroups')
    
    // שליפת המסמך הנוכחי
    const current = await collection.findOne({ _id: new ObjectId(id) })
    
    if (!current) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    // יצירת snapshot מהמצב הנוכחי (בלי history כדי לא לכפול)
    const { history: existingHistory, ...snapshotData } = current
    
    const newVersion = (current.version || 1) + 1
    
    // עדכון עם הוספה להיסטוריה
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...newData,
          version: newVersion,
          updatedAt: new Date().toISOString()
        },
        $push: {
          history: {
            version: current.version || 1,
            savedAt: new Date().toISOString(),
            changeReason: _changeReason || 'עדכון',
            snapshot: snapshotData
          }
        }
      }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    
    return NextResponse.json({ success: true, version: newVersion })
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