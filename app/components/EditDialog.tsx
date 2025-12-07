'use client'
import { useState, useEffect, CSSProperties } from 'react'
import { X, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { EditDialogProps, RuleEditorProps, DriverGroup, MetadataRule, TabType } from '../types'

export default function EditDialog({ group, onClose, onSave }: EditDialogProps) {
  const [formData, setFormData] = useState<DriverGroup>(group)
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [saving, setSaving] = useState<boolean>(false)
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setFormData(group)
  }, [group])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/drivers/${group._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        onSave(formData)
        onClose()
      } else {
        alert('שגיאה בשמירה')
      }
    } catch (err) {
      alert('שגיאה בשמירה: ' + (err as Error).message)
    }
    setSaving(false)
  }

  const updateField = <K extends keyof DriverGroup>(field: K, value: DriverGroup[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const updateDriver = (index: number, value: string) => {
    const newDrivers = [...(formData.drivers || [])]
    newDrivers[index] = value
    updateField('drivers', newDrivers)
  }

  const addDriver = () => {
    updateField('drivers', [...(formData.drivers || []), ''])
  }

  const removeDriver = (index: number) => {
    const newDrivers = (formData.drivers || []).filter((_, i) => i !== index)
    updateField('drivers', newDrivers)
  }

  const updateRule = (ruleName: string, ruleData: MetadataRule) => {
    setFormData(prev => ({
      ...prev,
      metadataRules: {
        ...prev.metadataRules,
        [ruleName]: ruleData
      }
    }))
  }

  const addRule = () => {
    const ruleName = prompt('שם הכלל החדש (באנגלית):')
    if (ruleName) {
      updateRule(ruleName, { offset: 0, type: 'byte' })
      setExpandedRules(prev => ({ ...prev, [ruleName]: true }))
    }
  }

  const deleteRule = (ruleName: string) => {
    if (confirm(`למחוק את הכלל "${ruleName}"?`)) {
      const newRules = { ...formData.metadataRules }
      delete newRules[ruleName]
      setFormData(prev => ({ ...prev, metadataRules: newRules }))
    }
  }

  const toggleRule = (ruleName: string) => {
    setExpandedRules(prev => ({ ...prev, [ruleName]: !prev[ruleName] }))
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.dialog}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>עריכת קבוצת דרייברים</h2>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabs}>
          {(['general', 'drivers', 'rules'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                ...styles.tab,
                ...(activeTab === tab ? styles.tabActive : {})
              }}
            >
              {tab === 'general' && 'כללי'}
              {tab === 'drivers' && 'דרייברים'}
              {tab === 'rules' && 'חוקים'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={styles.content}>
          {/* General Tab */}
          {activeTab === 'general' && (
            <div style={styles.tabContent}>
              <div style={styles.formGroup}>
                <label style={styles.label}>מזהה קבוצה (Group ID)</label>
                <input
                  type="text"
                  value={formData.groupId || ''}
                  onChange={(e) => updateField('groupId', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>שם הקבוצה</label>
                <input
                  type="text"
                  value={formData.groupName || ''}
                  onChange={(e) => updateField('groupName', e.target.value)}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>הערות</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  style={styles.textarea as CSSProperties}
                  rows={3}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>מקור נתונים</label>
                <select
                  value={formData.dataSource || 'metadata'}
                  onChange={(e) => updateField('dataSource', e.target.value as 'metadata' | 'data')}
                  style={styles.select}
                >
                  <option value="metadata">Metadata (DEVMODE)</option>
                  <option value="data">Data (PostScript/PCL)</option>
                </select>
              </div>

              <div style={styles.formGroupRow}>
                <label style={styles.label}>פעיל</label>
                <button
                  onClick={() => updateField('enabled', !formData.enabled)}
                  style={{
                    ...styles.toggle,
                    backgroundColor: formData.enabled ? '#10b981' : '#e5e7eb'
                  }}
                >
                  <div style={{
                    ...styles.toggleKnob,
                    transform: formData.enabled ? 'translateX(20px)' : 'translateX(0)'
                  }} />
                </button>
              </div>
            </div>
          )}

          {/* Drivers Tab */}
          {activeTab === 'drivers' && (
            <div style={styles.tabContent}>
              <div style={styles.driversHeader}>
                <span>{formData.drivers?.length || 0} דרייברים</span>
                <button onClick={addDriver} style={styles.addButton}>
                  <Plus size={16} /> הוסף דרייבר
                </button>
              </div>
              
              {formData.drivers?.map((driver, index) => (
                <div key={index} style={styles.driverRow}>
                  <input
                    type="text"
                    value={driver}
                    onChange={(e) => updateDriver(index, e.target.value)}
                    style={styles.driverInput}
                    placeholder="שם הדרייבר..."
                  />
                  <button
                    onClick={() => removeDriver(index)}
                    style={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div style={styles.tabContent}>
              <div style={styles.driversHeader}>
                <span>{Object.keys(formData.metadataRules || {}).length} חוקים</span>
                <button onClick={addRule} style={styles.addButton}>
                  <Plus size={16} /> הוסף כלל
                </button>
              </div>

              {Object.entries(formData.metadataRules || {}).map(([ruleName, ruleData]) => (
                <div key={ruleName} style={styles.ruleCard}>
                  <div
                    style={styles.ruleHeader}
                    onClick={() => toggleRule(ruleName)}
                  >
                    <span style={styles.ruleName}>{ruleName}</span>
                    <div style={styles.ruleActions}>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRule(ruleName); }}
                        style={styles.ruleDeleteButton}
                      >
                        <Trash2 size={14} />
                      </button>
                      {expandedRules[ruleName] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {expandedRules[ruleName] && (
                    <div style={styles.ruleContent}>
                      <RuleEditor
                        ruleName={ruleName}
                        ruleData={ruleData}
                        onChange={(newData) => updateRule(ruleName, newData)}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button onClick={onClose} style={styles.cancelButton}>
            ביטול
          </button>
          <button onClick={handleSave} disabled={saving} style={styles.saveButton}>
            <Save size={16} />
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RuleEditor({ ruleName, ruleData, onChange }: RuleEditorProps) {
  const updateRuleField = <K extends keyof MetadataRule>(field: K, value: MetadataRule[K]) => {
    onChange({ ...ruleData, [field]: value })
  }

  const updateMapping = (key: string, value: string | number) => {
    const newMapping = { ...ruleData.mapping, [key]: value }
    onChange({ ...ruleData, mapping: newMapping })
  }

  const addMappingEntry = () => {
    const key = prompt('מפתח (Key):')
    if (key) {
      updateMapping(key, '')
    }
  }

  const deleteMappingEntry = (key: string) => {
    const newMapping = { ...ruleData.mapping }
    delete newMapping[key]
    onChange({ ...ruleData, mapping: newMapping })
  }

  const updateCondition = (field: 'operator' | 'value', value: any) => {
    onChange({
      ...ruleData,
      condition: { ...ruleData.condition!, [field]: value }
    })
  }

  return (
    <div style={styles.ruleEditor}>
      {/* Hardcoded */}
      {ruleData.hardcoded !== undefined && (
        <div style={styles.formGroup}>
          <label style={styles.labelSmall}>ערך קבוע (Hardcoded)</label>
          <select
            value={String(ruleData.hardcoded)}
            onChange={(e) => updateRuleField('hardcoded', e.target.value === 'true')}
            style={styles.inputSmall}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      )}

      {/* Offset */}
      {ruleData.offset !== undefined && (
        <div style={styles.formGroup}>
          <label style={styles.labelSmall}>Offset</label>
          <input
            type="number"
            value={ruleData.offset || 0}
            onChange={(e) => updateRuleField('offset', parseInt(e.target.value))}
            style={styles.inputSmall}
          />
        </div>
      )}

      {/* Type */}
      {ruleData.type && (
        <div style={styles.formGroup}>
          <label style={styles.labelSmall}>סוג</label>
          <select
            value={ruleData.type}
            onChange={(e) => updateRuleField('type', e.target.value as 'byte' | 'int16' | 'int32')}
            style={styles.inputSmall}
          >
            <option value="byte">Byte</option>
            <option value="int16">Int16</option>
            <option value="int32">Int32</option>
          </select>
        </div>
      )}

      {/* Conditional Offset */}
      {(ruleData.conditionalOffset !== undefined || ruleData.conditionalValue !== undefined) && (
        <div style={styles.conditionBox}>
          <h5 style={styles.conditionTitle}>תנאי מקדים</h5>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.labelSmall}>Conditional Offset</label>
              <input
                type="number"
                value={ruleData.conditionalOffset || 0}
                onChange={(e) => updateRuleField('conditionalOffset', parseInt(e.target.value))}
                style={styles.inputSmall}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.labelSmall}>Conditional Value</label>
              <input
                type="number"
                value={ruleData.conditionalValue || 0}
                onChange={(e) => updateRuleField('conditionalValue', parseInt(e.target.value))}
                style={styles.inputSmall}
              />
            </div>
          </div>
        </div>
      )}

      {/* Condition */}
      {ruleData.condition && (
        <div style={styles.conditionBox}>
          <h5 style={styles.conditionTitle}>תנאי</h5>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.labelSmall}>אופרטור</label>
              <select
                value={ruleData.condition.operator || 'equals'}
                onChange={(e) => updateCondition('operator', e.target.value)}
                style={styles.inputSmall}
              >
                <option value="equals">שווה (equals)</option>
                <option value="notEquals">לא שווה (notEquals)</option>
                <option value="lessThan">קטן מ (lessThan)</option>
                <option value="greaterThan">גדול מ (greaterThan)</option>
                <option value="in">אחד מ (in)</option>
              </select>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.labelSmall}>ערך</label>
              <input
                type="number"
                value={ruleData.condition.value || 0}
                onChange={(e) => updateCondition('value', parseInt(e.target.value))}
                style={styles.inputSmall}
              />
            </div>
          </div>
        </div>
      )}

      {/* Mapping */}
      {ruleData.mapping && (
        <div style={styles.mappingBox}>
          <div style={styles.mappingHeader}>
            <h5 style={styles.conditionTitle}>מיפוי ערכים</h5>
            <button onClick={addMappingEntry} style={styles.addSmallButton}>
              <Plus size={14} />
            </button>
          </div>
          {Object.entries(ruleData.mapping).map(([key, value]) => (
            <div key={key} style={styles.mappingRow}>
              <input
                type="text"
                value={key}
                disabled
                style={styles.mappingKey}
              />
              <span style={styles.mappingArrow}>→</span>
              <input
                type="text"
                value={value}
                onChange={(e) => updateMapping(key, isNaN(Number(e.target.value)) ? e.target.value : parseInt(e.target.value))}
                style={styles.mappingValue}
              />
              <button
                onClick={() => deleteMappingEntry(key)}
                style={styles.mappingDelete}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Default */}
      {ruleData.default !== undefined && (
        <div style={styles.formGroup}>
          <label style={styles.labelSmall}>ברירת מחדל</label>
          <input
            type="text"
            value={ruleData.default}
            onChange={(e) => updateRuleField('default', isNaN(Number(e.target.value)) ? e.target.value : parseInt(e.target.value))}
            style={styles.inputSmall}
          />
        </div>
      )}

      {/* Result */}
      {ruleData.result !== undefined && (
        <div style={styles.formGroup}>
          <label style={styles.labelSmall}>תוצאה (Result)</label>
          <select
            value={String(ruleData.result)}
            onChange={(e) => updateRuleField('result', e.target.value === 'true')}
            style={styles.inputSmall}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      )}
    </div>
  )
}

const styles: Record<string, CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  dialog: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '90%',
    maxWidth: '700px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e5e7eb',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 24px',
  },
  tab: {
    padding: '12px 20px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#6b7280',
    borderBottom: '2px solid transparent',
    marginBottom: '-1px',
  },
  tabActive: {
    color: '#3b82f6',
    borderBottomColor: '#3b82f6',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
  },
  tabContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  formGroupRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  formRow: {
    display: 'flex',
    gap: '12px',
  },
  label: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
  },
  labelSmall: {
    fontSize: '12px',
    fontWeight: '500',
    color: '#6b7280',
  },
  input: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  inputSmall: {
    padding: '8px 10px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '13px',
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  select: {
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white',
  },
  toggle: {
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    position: 'relative',
    transition: 'background-color 0.2s',
  },
  toggleKnob: {
    width: '20px',
    height: '20px',
    backgroundColor: 'white',
    borderRadius: '50%',
    position: 'absolute',
    top: '2px',
    left: '2px',
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  },
  driversHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
  },
  driverRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  driverInput: {
    flex: 1,
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    direction: 'ltr',
  },
  deleteButton: {
    padding: '8px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  ruleHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f9fafb',
    cursor: 'pointer',
  },
  ruleName: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#111827',
    fontFamily: 'monospace',
  },
  ruleActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  ruleDeleteButton: {
    padding: '4px',
    backgroundColor: 'transparent',
    color: '#dc2626',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  ruleContent: {
    padding: '16px',
    borderTop: '1px solid #e5e7eb',
  },
  ruleEditor: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  conditionBox: {
    backgroundColor: '#f3f4f6',
    padding: '12px',
    borderRadius: '8px',
  },
  conditionTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  mappingBox: {
    backgroundColor: '#fef3c7',
    padding: '12px',
    borderRadius: '8px',
  },
  mappingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  addSmallButton: {
    padding: '4px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  mappingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '6px',
  },
  mappingKey: {
    width: '60px',
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
    backgroundColor: '#e5e7eb',
    textAlign: 'center',
  },
  mappingArrow: {
    color: '#6b7280',
    fontSize: '14px',
  },
  mappingValue: {
    flex: 1,
    padding: '6px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '12px',
  },
  mappingDelete: {
    padding: '4px',
    backgroundColor: 'transparent',
    color: '#dc2626',
    border: 'none',
    cursor: 'pointer',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
  },
  cancelButton: {
    padding: '10px 20px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
  },
}

