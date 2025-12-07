'use client'
import { useState, useEffect } from 'react'

export default function Home() {
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState(null)

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

  const filteredDrivers = drivers.filter(group => {
    const searchLower = search.toLowerCase()
    return (
      group.groupName?.toLowerCase().includes(searchLower) ||
      group.drivers?.some(d => d.toLowerCase().includes(searchLower)) ||
      group.notes?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) return <div style={styles.loading}>טוען...</div>

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>ניהול קונפיגורציית מדפסות</h1>
      
      <div style={styles.stats}>
        <span style={styles.statBadge}>{drivers.length} קבוצות</span>
        <span style={styles.statBadge}>{drivers.reduce((acc, g) => acc + (g.drivers?.length || 0), 0)} דרייברים</span>
      </div>

      <input
        type="text"
        placeholder="חיפוש דרייבר או קבוצה..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={styles.searchInput}
      />

      <div style={styles.grid}>
        {filteredDrivers.map((group) => (
          <div
            key={group._id}
            style={{
              ...styles.card,
              borderColor: group.enabled ? '#10b981' : '#ef4444'
            }}
            onClick={() => setSelectedGroup(selectedGroup?._id === group._id ? null : group)}
          >
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>{group.groupName}</h3>
              <span style={{
                ...styles.badge,
                backgroundColor: group.enabled ? '#10b981' : '#ef4444'
              }}>
                {group.enabled ? 'פעיל' : 'מושבת'}
              </span>
            </div>
            
            <p style={styles.notes}>{group.notes}</p>
            
            <div style={styles.driversList}>
              {group.drivers?.slice(0, 3).map((driver, i) => (
                <span key={i} style={styles.driverTag}>{driver}</span>
              ))}
              {group.drivers?.length > 3 && (
                <span style={styles.moreTag}>+{group.drivers.length - 3} עוד</span>
              )}
            </div>

            {selectedGroup?._id === group._id && (
              <div style={styles.details}>
                <h4 style={styles.detailsTitle}>כל הדרייברים:</h4>
                {group.drivers?.map((driver, i) => (
                  <div key={i} style={styles.detailDriver}>{driver}</div>
                ))}
                
                <h4 style={styles.detailsTitle}>חוקים:</h4>
                <pre style={styles.rulesCode}>
                  {JSON.stringify(group.metadataRules, null, 2)}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#1f2937',
  },
  stats: {
    marginBottom: '20px',
    display: 'flex',
    gap: '10px',
  },
  statBadge: {
    backgroundColor: '#3b82f6',
    color: 'white',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px',
    fontSize: '16px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    marginBottom: '20px',
    outline: 'none',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '24px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '10px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    margin: 0,
    color: '#1f2937',
  },
  badge: {
    color: 'white',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  notes: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '15px',
  },
  driversList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
  },
  driverTag: {
    backgroundColor: '#e5e7eb',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
    color: '#374151',
  },
  moreTag: {
    backgroundColor: '#dbeafe',
    color: '#1d4ed8',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '11px',
  },
  details: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e5e7eb',
  },
  detailsTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '8px',
    marginTop: '15px',
    color: '#374151',
  },
  detailDriver: {
    fontSize: '13px',
    padding: '4px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  rulesCode: {
    backgroundColor: '#f3f4f6',
    padding: '10px',
    borderRadius: '6px',
    fontSize: '11px',
    overflow: 'auto',
    maxHeight: '200px',
    direction: 'ltr',
    textAlign: 'left',
  },
}
