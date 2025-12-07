'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/drivers')
      .then(res => res.json())
      .then(data => {
        setDrivers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <h1>טוען...</h1>

  return (
    <div>
      <h1>ניהול קונפיגורציית מדפסות</h1>
      <p>מספר קבוצות דרייברים: {drivers.length}</p>
      
      {drivers.length === 0 ? (
        <p>אין נתונים עדיין. צריך לייבא את הקונפיגורציה ל-MongoDB.</p>
      ) : (
        <ul>
          {drivers.map((driver, index) => (
            <li key={index} style={{ marginBottom: '10px' }}>
              <strong>{driver.groupName}</strong>
              <br />
              <small>{driver.drivers?.join(', ')}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
