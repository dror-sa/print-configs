'use client'
import { useState, useEffect, CSSProperties } from 'react'
import { Pencil } from 'lucide-react'
import EditDialog from './components/EditDialog'
import { DriverGroup } from './types'

export default function Home() {
  const [drivers, setDrivers] = useState<DriverGroup[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<DriverGroup | null>(null)
  const [editingGroup, setEditingGroup] = useState<DriverGroup | null>(null)

  const fetchDrivers = () => {
    fetch('/api/drivers')
      .then(res => res.json())
      .then((data: DriverGroup[]) => {
        setDrivers(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  const handleSave = (updatedGroup: DriverGroup) => {
    setDrivers(prev => prev.map(g => 
      g._id === updatedGroup._id ? updatedGroup : g
    ))
  }

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
            key={group._id.toString()}
            style={{
              ...styles.card,
              borderColor: group.enabled ? '#10b981' : '#ef4444'
            }}
          >
            <div style={styles.cardHeader}>
              <h3 
                style={styles.cardTitle}
                onClick={() => setSelectedGroup(selectedGroup?._id === group._id ? null : group)}
              >
                {group.groupName}
              </h3>
              <div style={styles.cardActions}>
                <button
                  onClick={() => setEditingGroup(group)}
                  style={styles.editButton}
                >
                  <Pencil size={16} />
                </button>
                <span style={{
                  ...styles.badge,
                  backgroundColor: group.enabled ? '#10b981' : '#ef4444'
                }}>
                  {group.enabled ? 'פעיל' : 'מושבת'}
                </span>
              </div>
            </div>
            
            <p style={styles.notes}>{group.notes}</p>
            
            <div style={styles.driversList}>
              {group.drivers?.slice(0, 3).map((driver, i) => (
                <span key={i} style={styles.driverTag}>{driver}</span>
              ))}
              {group.drivers && group.drivers.length > 3 && (
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

      {editingGroup && (
        <EditDialog
          group={editingGroup}
          onClose={() => setEditingGroup(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
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
    boxSizing: 'border-box',
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
    cursor: 'pointer',
  },
  cardActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  editButton: {
    padding: '6px',
    backgroundColor: '#dbeafe',
    color: '#2563eb',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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

