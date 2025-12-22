'use client'
import { useState, useEffect } from 'react'
import { X, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { EditDialogProps, RuleEditorProps, DriverGroup, MetadataRule, TabType, HistoryItem } from '../types'
import RuleWizard from './RuleWizard'
import styles from './EditDialog.module.css'

export default function EditDialog({ group, onClose, onSave }: EditDialogProps) {
  const [formData, setFormData] = useState<DriverGroup>(group)
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [saving, setSaving] = useState<boolean>(false)
  const [expandedRules, setExpandedRules] = useState<Record<string, boolean>>({})
  const [showWizard, setShowWizard] = useState<boolean>(false)
  const [changeReason, setChangeReason] = useState<string>('')
  const [selectedSnapshot, setSelectedSnapshot] = useState<HistoryItem | null>(null)

  useEffect(() => {
    setFormData(group)
  }, [group])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/drivers/${group._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          _changeReason: changeReason || 'עדכון'
        })
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
    setShowWizard(true)
  }
  
  const handleWizardComplete = (ruleName: string, ruleData: MetadataRule) => {
    updateRule(ruleName, ruleData)
    setExpandedRules(prev => ({ ...prev, [ruleName]: true }))
    setShowWizard(false)
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
    <>
      <div className={styles.overlay}>
        <div className={styles.dialog}>
          {/* Header */}
          <div className={styles.header}>
            <h2 className={styles.headerTitle}>עריכת קבוצת דרייברים</h2>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className={styles.tabs}>
            {(['general', 'drivers', 'rules', 'history'] as TabType[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
              >
                {tab === 'general' && 'כללי'}
                {tab === 'drivers' && 'דרייברים'}
                {tab === 'rules' && 'חוקים'}
                {tab === 'history' && 'היסטוריה'}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className={styles.content}>
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className={styles.tabContent}>
              <div className={styles.formGroup}>
                <label className={styles.label}>מזהה קבוצה (Group ID)</label>
                <input
                  type="text"
                  value={formData.groupId || ''}
                  onChange={(e) => updateField('groupId', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>שם הקבוצה</label>
                <input
                  type="text"
                  value={formData.groupName || ''}
                  onChange={(e) => updateField('groupName', e.target.value)}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>הערות</label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => updateField('notes', e.target.value)}
                  className={styles.textarea}
                  rows={3}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>מקור נתונים</label>
                <select
                  value={formData.dataSource || 'metadata'}
                  onChange={(e) => updateField('dataSource', e.target.value as 'metadata' | 'data')}
                  className={styles.select}
                >
                  <option value="metadata">Metadata (DEVMODE)</option>
                  <option value="data">Data (PostScript/PCL)</option>
                </select>
              </div>

              <div className={styles.formGroupRow}>
                <label className={styles.label}>פעיל</label>
                <button
                  onClick={() => updateField('enabled', !formData.enabled)}
                  className={styles.toggle}
                  style={{ backgroundColor: formData.enabled ? '#10b981' : '#e5e7eb' }}
                >
                  <div 
                    className={styles.toggleKnob}
                    style={{ transform: formData.enabled ? 'translateX(20px)' : 'translateX(0)' }}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Drivers Tab */}
          {activeTab === 'drivers' && (
            <div className={styles.tabContent}>
              <div className={styles.driversHeader}>
                <span>{formData.drivers?.length || 0} דרייברים</span>
                <button onClick={addDriver} className={styles.addButton}>
                  <Plus size={16} /> הוסף דרייבר
                </button>
              </div>
              
              {formData.drivers?.map((driver, index) => (
                <div key={index} className={styles.driverRow}>
                  <input
                    type="text"
                    value={driver}
                    onChange={(e) => updateDriver(index, e.target.value)}
                    className={styles.driverInput}
                    placeholder="שם הדרייבר..."
                  />
                  <button
                    onClick={() => removeDriver(index)}
                    className={styles.deleteButton}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Rules Tab */}
          {activeTab === 'rules' && (
            <div className={styles.tabContent}>
              <div className={styles.driversHeader}>
                <span>{Object.keys(formData.metadataRules || {}).length} חוקים</span>
                <button onClick={addRule} className={styles.addButton}>
                  <Plus size={16} /> הוסף כלל
                </button>
              </div>

              {Object.entries(formData.metadataRules || {}).map(([ruleName, ruleData]) => (
                <div key={ruleName} className={styles.ruleCard}>
                  <div
                    className={styles.ruleHeader}
                    onClick={() => toggleRule(ruleName)}
                  >
                    <span className={styles.ruleName}>{ruleName}</span>
                    <div className={styles.ruleActions}>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteRule(ruleName); }}
                        className={styles.ruleDeleteButton}
                      >
                        <Trash2 size={14} />
                      </button>
                      {expandedRules[ruleName] ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                  </div>

                  {expandedRules[ruleName] && (
                    <div className={styles.ruleContent}>
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

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className={styles.tabContent}>
              <div className={styles.historyHeader}>
                <span>גרסה נוכחית: {formData.version || 1}</span>
                <span>{(formData.history || []).length} גרסאות קודמות</span>
              </div>
              
              {(!formData.history || formData.history.length === 0) ? (
                <div className={styles.emptyHistory}>
                  אין היסטוריה עדיין
                </div>
              ) : (
                <div className={styles.historyList}>
                  {[...formData.history].reverse().map((item, index) => (
                    <div key={index} className={styles.historyItem}>
                      <div className={styles.historyItemHeader}>
                        <span className={styles.historyVersion}>גרסה {item.version}</span>
                        <span className={styles.historyDate}>
                          {new Date(item.savedAt).toLocaleString('he-IL')}
                        </span>
                      </div>
                      <div className={styles.historyReason}>{item.changeReason}</div>
                      <div className={styles.historyActions}>
                        <button 
                          onClick={() => setSelectedSnapshot(
                            selectedSnapshot?.version === item.version ? null : item
                          )}
                          className={styles.historyViewButton}
                        >
                          {selectedSnapshot?.version === item.version ? 'הסתר' : 'הצג מצב'}
                        </button>
                      </div>
                      
                      {selectedSnapshot?.version === item.version && (
                        <div className={styles.snapshotView}>
                          <pre className={styles.snapshotCode}>
                            {JSON.stringify(item.snapshot, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <input
            type="text"
            placeholder="סיבת השינוי (אופציונלי)..."
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            className={styles.input}
            style={{ flex: 1, marginLeft: '10px' }}
          />
          <button onClick={onClose} className={styles.cancelButton}>
            ביטול
          </button>
          <button onClick={handleSave} disabled={saving} className={styles.saveButton}>
            <Save size={16} />
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
        </div>
      </div>
      
      {/* Rule Wizard */}
      {showWizard && (
        <RuleWizard
          onComplete={handleWizardComplete}
          onCancel={() => setShowWizard(false)}
        />
      )}
    </>
  )
}

function RuleEditor({ ruleName, ruleData, onChange }: RuleEditorProps) {
  const updateRuleField = <K extends keyof MetadataRule,>(field: K, value: MetadataRule[K]) => {
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

  const updateCondition = (field: 'operator' | 'value' | 'values', value: any) => {
    onChange({
      ...ruleData,
      condition: { ...ruleData.condition!, [field]: value }
    })
  }

  return (
    <div className={styles.ruleEditor}>
      {/* Hardcoded */}
      {ruleData.hardcoded !== undefined && (
        <div className={styles.formGroup}>
          <label className={styles.labelSmall}>ערך קבוע (Hardcoded)</label>
          <select
            value={String(ruleData.hardcoded)}
            onChange={(e) => updateRuleField('hardcoded', e.target.value === 'true')}
            className={styles.inputSmall}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      )}

      {/* Offset */}
      {ruleData.offset !== undefined && (
        <div className={styles.formGroup}>
          <label className={styles.labelSmall}>Offset</label>
          <input
            type="number"
            value={ruleData.offset || 0}
            onChange={(e) => updateRuleField('offset', parseInt(e.target.value))}
            className={styles.inputSmall}
          />
        </div>
      )}

      {/* Type */}
      {ruleData.type && (
        <div className={styles.formGroup}>
          <label className={styles.labelSmall}>סוג</label>
          <select
            value={ruleData.type}
            onChange={(e) => updateRuleField('type', e.target.value as 'byte' | 'int16' | 'int32')}
            className={styles.inputSmall}
          >
            <option value="byte">Byte</option>
            <option value="int16">Int16</option>
            <option value="int32">Int32</option>
          </select>
        </div>
      )}

      {/* Conditional Offset */}
      {(ruleData.conditionalOffset !== undefined || ruleData.conditionalValue !== undefined) && (
        <div className={styles.conditionBox}>
          <h5 className={styles.conditionTitle}>תנאי מקדים</h5>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label className={styles.labelSmall}>Conditional Offset</label>
              <input
                type="number"
                value={ruleData.conditionalOffset || 0}
                onChange={(e) => updateRuleField('conditionalOffset', parseInt(e.target.value))}
                className={styles.inputSmall}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.labelSmall}>Conditional Value</label>
              <input
                type="number"
                value={ruleData.conditionalValue || 0}
                onChange={(e) => updateRuleField('conditionalValue', parseInt(e.target.value))}
                className={styles.inputSmall}
              />
            </div>
          </div>
        </div>
      )}

      {/* Condition */}
      {ruleData.condition && (
        <div className={styles.conditionBox}>
          <h5 className={styles.conditionTitle}>תנאי</h5>
          <div className={styles.formGroup}>
            <label className={styles.labelSmall}>אופרטור</label>
            <select
              value={(ruleData.condition as any).operator || 'equals'}
              onChange={(e) => updateCondition('operator', e.target.value)}
              className={styles.inputSmall}
            >
              <option value="equals">שווה (equals)</option>
              <option value="notEquals">לא שווה (notEquals)</option>
              <option value="lessThan">קטן מ (lessThan)</option>
              <option value="greaterThan">גדול מ (greaterThan)</option>
              <option value="in">אחד מ (in)</option>
            </select>
          </div>
          
          {(ruleData.condition as any).operator === 'in' ? (
            <div className={styles.formGroup}>
              <div className={styles.driversHeader}>
                <label className={styles.labelSmall}>ערכים</label>
                <button 
                  onClick={() => {
                    const values = (ruleData.condition as any)?.values || []
                    updateCondition('values', [...values, 0])
                  }}
                  className={styles.addSmallButton}
                  type="button"
                >
                  <Plus size={14} />
                </button>
              </div>
              {((ruleData.condition as any).values || []).map((val: any, idx: number) => (
                <div key={idx} className={styles.mappingRow}>
                  <input
                    type="number"
                    value={val}
                    onChange={(e) => {
                      const newValues = [...((ruleData.condition as any)?.values || [])]
                      newValues[idx] = parseInt(e.target.value) || 0
                      updateCondition('values', newValues)
                    }}
                    className={styles.inputSmall}
                    style={{ flex: 1 }}
                  />
                  <button
                    onClick={() => {
                      const newValues = ((ruleData.condition as any)?.values || []).filter((_: any, i: number) => i !== idx)
                      updateCondition('values', newValues)
                    }}
                    className={styles.mappingDelete}
                    type="button"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label className={styles.labelSmall}>ערך</label>
              <input
                type="number"
                value={(ruleData.condition as any).value || 0}
                onChange={(e) => updateCondition('value', parseInt(e.target.value))}
                className={styles.inputSmall}
              />
            </div>
          )}
        </div>
      )}

      {/* Mapping */}
      {ruleData.mapping && (
        <div className={styles.mappingBox}>
          <div className={styles.mappingHeader}>
            <h5 className={styles.conditionTitle}>מיפוי ערכים</h5>
            <button onClick={addMappingEntry} className={styles.addSmallButton}>
              <Plus size={14} />
            </button>
          </div>
          {Object.entries(ruleData.mapping).map(([key, value]) => (
            <div key={key} className={styles.mappingRow}>
              <input
                type="text"
                value={key}
                disabled
                className={styles.mappingKey}
              />
              <span className={styles.mappingArrow}>→</span>
              <input
                type="text"
                value={value}
                onChange={(e) => updateMapping(key, isNaN(Number(e.target.value)) ? e.target.value : parseInt(e.target.value))}
                className={styles.mappingValue}
              />
              <button
                onClick={() => deleteMappingEntry(key)}
                className={styles.mappingDelete}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Default */}
      {ruleData.default !== undefined && (
        <div className={styles.formGroup}>
          <label className={styles.labelSmall}>ברירת מחדל</label>
          <input
            type="text"
            value={ruleData.default as string}
            onChange={(e) => updateRuleField('default', isNaN(Number(e.target.value)) ? e.target.value : parseInt(e.target.value))}
            className={styles.inputSmall}
          />
        </div>
      )}

      {/* Result */}
      {ruleData.result !== undefined && (
        <div className={styles.formGroup}>
          <label className={styles.labelSmall}>תוצאה (Result)</label>
          <select
            value={String(ruleData.result)}
            onChange={(e) => updateRuleField('result', e.target.value === 'true')}
            className={styles.inputSmall}
          >
            <option value="true">True</option>
            <option value="false">False</option>
          </select>
        </div>
      )}
    </div>
  )
}
