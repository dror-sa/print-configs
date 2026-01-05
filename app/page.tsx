'use client'
import { useState, useEffect } from 'react'
import { Pencil } from 'lucide-react'
import EditDialog from './components/EditDialog'
import { DriverGroup } from './types'
import styles from './page.module.css'

export default function Home() {
  const [drivers, setDrivers] = useState<DriverGroup[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [search, setSearch] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<DriverGroup | null>(null)
  const [editingGroup, setEditingGroup] = useState<DriverGroup | null>(null)

  const fetchDrivers = () => {
    fetch('/api/drivers', { cache: 'no-store' })
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
      group.drivers?.some(d => (typeof d === 'string' ? d : d.name).toLowerCase().includes(searchLower)) ||
      group.notes?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) return <div className={styles.loading}>טוען...</div>

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>ניהול קונפיגורציית מדפסות</h1>
      
      <div className={styles.stats}>
        <span className={styles.statBadge}>{drivers.length} קבוצות</span>
        <span className={styles.statBadge}>{drivers.reduce((acc, g) => acc + (g.drivers?.length || 0), 0)} דרייברים</span>
      </div>

      <input
        type="text"
        placeholder="חיפוש דרייבר או קבוצה..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
      />

      <div className={styles.grid}>
        {filteredDrivers.map((group) => (
          <div
            key={group._id.toString()}
            className={`${styles.card} ${group.enabled ? styles.cardEnabled : styles.cardDisabled}`}
          >
            <div className={styles.cardHeader}>
              <h3 
                className={styles.cardTitle}
                onClick={() => setSelectedGroup(selectedGroup?._id === group._id ? null : group)}
              >
                {group.groupName}
              </h3>
              <div className={styles.cardActions}>
                <button
                  onClick={() => setEditingGroup(group)}
                  className={styles.editButton}
                >
                  <Pencil size={16} />
                </button>
                <span className={`${styles.badge} ${group.enabled ? styles.badgeEnabled : styles.badgeDisabled}`}>
                  {group.enabled ? 'פעיל' : 'מושבת'}
                </span>
              </div>
            </div>
            
            <p className={styles.notes}>{group.notes}</p>
            
            <div className={styles.driversList}>
              {group.drivers?.slice(0, 3).map((driver, i) => (
                <span key={i} className={styles.driverTag}>
                  {typeof driver === 'string' ? driver : driver.name}
                </span>
              ))}
              {group.drivers && group.drivers.length > 3 && (
                <span className={styles.moreTag}>+{group.drivers.length - 3} עוד</span>
              )}
            </div>

            {selectedGroup?._id === group._id && (
              <div className={styles.details}>
                <h4 className={styles.detailsTitle}>כל הדרייברים:</h4>
                {group.drivers?.map((driver, i) => (
                  <div key={i} className={styles.detailDriver}>
                    {typeof driver === 'string' ? driver : driver.name}
                  </div>
                ))}
                
                <h4 className={styles.detailsTitle}>חוקים:</h4>
                <pre className={styles.rulesCode}>
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

