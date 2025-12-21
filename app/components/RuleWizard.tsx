'use client'
import { useState } from 'react'
import { ArrowRight, ArrowLeft, Check, Plus, Trash2, X } from 'lucide-react'
import { MetadataRule } from '../types'
import styles from './RuleWizard.module.css'

interface RuleWizardProps {
  onComplete: (ruleName: string, ruleData: MetadataRule) => void
  onCancel: () => void
}

type WizardStep = 'name' | 'basic' | 'conditional' | 'condition' | 'mapping' | 'additional'

export default function RuleWizard({ onComplete, onCancel }: RuleWizardProps) {
  const [step, setStep] = useState<WizardStep>('name')
  const [ruleName, setRuleName] = useState('')
  
  // Basic fields
  const [hasHardcoded, setHasHardcoded] = useState(false)
  const [hardcodedValue, setHardcodedValue] = useState(false)
  const [offset, setOffset] = useState(0)
  const [type, setType] = useState<'byte' | 'int16' | 'int32'>('byte')
  
  // Conditional offset
  const [hasConditional, setHasConditional] = useState(false)
  const [conditionalOffset, setConditionalOffset] = useState(0)
  const [conditionalValue, setConditionalValue] = useState(0)
  
  // Condition
  const [hasCondition, setHasCondition] = useState(false)
  const [conditionOperator, setConditionOperator] = useState<'equals' | 'notEquals' | 'lessThan' | 'greaterThan' | 'in'>('equals')
  const [conditionValue, setConditionValue] = useState(0)
  const [conditionValues, setConditionValues] = useState<number[]>([])
  
  // Mapping
  const [hasMapping, setHasMapping] = useState(false)
  const [mapping, setMapping] = useState<Record<string, string | number>>({})
  
  // Additional
  const [hasDefault, setHasDefault] = useState(false)
  const [defaultValue, setDefaultValue] = useState<string | number>('')
  const [hasResult, setHasResult] = useState(false)
  const [resultValue, setResultValue] = useState(false)
  const [description, setDescription] = useState('')
  
  const steps: WizardStep[] = ['name', 'basic', 'conditional', 'condition', 'mapping', 'additional']
  const currentStepIndex = steps.indexOf(step)

  const handleNext = () => {
    const nextIndex = currentStepIndex + 1
    if (nextIndex < steps.length) {
      setStep(steps[nextIndex])
    }
  }

  const handleBack = () => {
    const prevIndex = currentStepIndex - 1
    if (prevIndex >= 0) {
      setStep(steps[prevIndex])
    }
  }

  const handleComplete = () => {
    const rule: MetadataRule = {}
    
    if (hasHardcoded) {
      rule.hardcoded = hardcodedValue
    } else {
      rule.offset = offset
      rule.type = type
    }
    
    if (hasConditional) {
      rule.conditionalOffset = conditionalOffset
      rule.conditionalValue = conditionalValue
    }
    
    if (hasCondition) {
      rule.condition = {
        operator: conditionOperator,
        ...(conditionOperator === 'in' ? { values: conditionValues } : { value: conditionValue })
      }
    }
    
    if (hasMapping) {
      rule.mapping = mapping
    }
    
    if (hasDefault) {
      rule.default = defaultValue
    }
    
    if (hasResult) {
      rule.result = resultValue
    }
    
    if (description) {
      // @ts-ignore - description is a custom field
      rule.description = description
    }
    
    onComplete(ruleName, rule)
  }

  const addMappingEntry = () => {
    const key = prompt('מפתח (Key):')
    if (key) {
      setMapping({ ...mapping, [key]: '' })
    }
  }

  const updateMapping = (key: string, value: string | number) => {
    setMapping({ ...mapping, [key]: value })
  }

  const deleteMappingEntry = (key: string) => {
    const newMapping = { ...mapping }
    delete newMapping[key]
    setMapping(newMapping)
  }

  const canGoNext = () => {
    switch (step) {
      case 'name':
        return ruleName.trim() !== ''
      case 'basic':
        return hasHardcoded || (offset >= 0 && type)
      default:
        return true
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.wizard}>
        <div className={styles.header}>
          <h2>יצירת כלל חדש</h2>
          <button onClick={onCancel} className={styles.closeButton}>
            <X size={24} />
          </button>
        </div>

        {/* Progress */}
        <div className={styles.progress}>
          {steps.map((s, idx) => (
            <div
              key={s}
              className={`${styles.progressStep} ${idx <= currentStepIndex ? styles.progressStepActive : ''}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className={styles.content}>
          {step === 'name' && (
            <div className={styles.stepContent}>
              <h3>שם הכלל</h3>
              <p className={styles.stepDescription}>בחר שם ייחודי לכלל (באנגלית, למשל: pageSize, color, booklet)</p>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                placeholder="pageSize"
                className={styles.input}
                autoFocus
              />
            </div>
          )}

          {step === 'basic' && (
            <div className={styles.stepContent}>
              <h3>הגדרות בסיסיות</h3>
              
              <div className={styles.toggle}>
                <label>
                  <input
                    type="checkbox"
                    checked={hasHardcoded}
                    onChange={(e) => setHasHardcoded(e.target.checked)}
                  />
                  <span>ערך קבוע (Hardcoded)</span>
                </label>
              </div>

              {hasHardcoded ? (
                <div className={styles.formGroup}>
                  <label>ערך</label>
                  <select
                    value={String(hardcodedValue)}
                    onChange={(e) => setHardcodedValue(e.target.value === 'true')}
                    className={styles.select}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label>Offset (מיקום בזיכרון)</label>
                    <input
                      type="number"
                      value={offset}
                      onChange={(e) => setOffset(parseInt(e.target.value) || 0)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Type (סוג נתונים)</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as 'byte' | 'int16' | 'int32')}
                      className={styles.select}
                    >
                      <option value="byte">Byte (8 bit)</option>
                      <option value="int16">Int16 (16 bit)</option>
                      <option value="int32">Int32 (32 bit)</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'conditional' && (
            <div className={styles.stepContent}>
              <h3>תנאי מקדים (אופציונלי)</h3>
              <p className={styles.stepDescription}>האם Offset מותנה בערך אחר?</p>
              
              <div className={styles.toggle}>
                <label>
                  <input
                    type="checkbox"
                    checked={hasConditional}
                    onChange={(e) => setHasConditional(e.target.checked)}
                  />
                  <span>יש תנאי מקדים</span>
                </label>
              </div>

              {hasConditional && (
                <>
                  <div className={styles.formGroup}>
                    <label>Conditional Offset</label>
                    <input
                      type="number"
                      value={conditionalOffset}
                      onChange={(e) => setConditionalOffset(parseInt(e.target.value) || 0)}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Conditional Value</label>
                    <input
                      type="number"
                      value={conditionalValue}
                      onChange={(e) => setConditionalValue(parseInt(e.target.value) || 0)}
                      className={styles.input}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          {step === 'condition' && (
            <div className={styles.stepContent}>
              <h3>תנאי (אופציונלי)</h3>
              <p className={styles.stepDescription}>האם יש תנאי להחזרת תוצאה?</p>
              
              <div className={styles.toggle}>
                <label>
                  <input
                    type="checkbox"
                    checked={hasCondition}
                    onChange={(e) => setHasCondition(e.target.checked)}
                  />
                  <span>יש תנאי</span>
                </label>
              </div>

              {hasCondition && (
                <>
                  <div className={styles.formGroup}>
                    <label>אופרטור</label>
                    <select
                      value={conditionOperator}
                      onChange={(e) => setConditionOperator(e.target.value as any)}
                      className={styles.select}
                    >
                      <option value="equals">שווה (equals)</option>
                      <option value="notEquals">לא שווה (notEquals)</option>
                      <option value="lessThan">קטן מ (lessThan)</option>
                      <option value="greaterThan">גדול מ (greaterThan)</option>
                      <option value="in">אחד מ (in)</option>
                    </select>
                  </div>

                  {conditionOperator === 'in' ? (
                    <div className={styles.formGroup}>
                      <div className={styles.header} style={{ marginBottom: '8px' }}>
                        <label>ערכים</label>
                        <button
                          onClick={() => setConditionValues([...conditionValues, 0])}
                          className={styles.addButton}
                          type="button"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      {conditionValues.map((val, idx) => (
                        <div key={idx} className={styles.valueRow}>
                          <input
                            type="number"
                            value={val}
                            onChange={(e) => {
                              const newValues = [...conditionValues]
                              newValues[idx] = parseInt(e.target.value) || 0
                              setConditionValues(newValues)
                            }}
                            className={styles.input}
                          />
                          <button
                            onClick={() => setConditionValues(conditionValues.filter((_, i) => i !== idx))}
                            className={styles.deleteButton}
                            type="button"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.formGroup}>
                      <label>ערך</label>
                      <input
                        type="number"
                        value={conditionValue}
                        onChange={(e) => setConditionValue(parseInt(e.target.value) || 0)}
                        className={styles.input}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 'mapping' && (
            <div className={styles.stepContent}>
              <h3>מיפוי ערכים (אופציונלי)</h3>
              <p className={styles.stepDescription}>מיפוי ערכים מקוריים לערכים מתורגמים</p>
              
              <div className={styles.toggle}>
                <label>
                  <input
                    type="checkbox"
                    checked={hasMapping}
                    onChange={(e) => setHasMapping(e.target.checked)}
                  />
                  <span>יש מיפוי</span>
                </label>
              </div>

              {hasMapping && (
                <div className={styles.mappingSection}>
                  <button onClick={addMappingEntry} className={styles.addButton}>
                    <Plus size={14} /> הוסף מיפוי
                  </button>
                  {Object.entries(mapping).map(([key, value]) => (
                    <div key={key} className={styles.mappingRow}>
                      <input
                        type="text"
                        value={key}
                        disabled
                        className={styles.mappingKey}
                      />
                      <span>→</span>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateMapping(key, isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
                        className={styles.input}
                      />
                      <button
                        onClick={() => deleteMappingEntry(key)}
                        className={styles.deleteButton}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'additional' && (
            <div className={styles.stepContent}>
              <h3>הגדרות נוספות (אופציונלי)</h3>
              
              <div className={styles.toggle}>
                <label>
                  <input
                    type="checkbox"
                    checked={hasDefault}
                    onChange={(e) => setHasDefault(e.target.checked)}
                  />
                  <span>ברירת מחדל</span>
                </label>
              </div>
              {hasDefault && (
                <div className={styles.formGroup}>
                  <input
                    type="text"
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
                    className={styles.input}
                    placeholder="1"
                  />
                </div>
              )}

              <div className={styles.toggle}>
                <label>
                  <input
                    type="checkbox"
                    checked={hasResult}
                    onChange={(e) => setHasResult(e.target.checked)}
                  />
                  <span>תוצאה (Result)</span>
                </label>
              </div>
              {hasResult && (
                <div className={styles.formGroup}>
                  <select
                    value={String(resultValue)}
                    onChange={(e) => setResultValue(e.target.value === 'true')}
                    className={styles.select}
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>תיאור (Description)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={styles.textarea}
                  placeholder="תיאור אופציונלי לכלל..."
                  rows={3}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button
            onClick={handleBack}
            disabled={currentStepIndex === 0}
            className={styles.backButton}
          >
            <ArrowRight size={16} />
            אחורה
          </button>
          
          <span className={styles.stepIndicator}>
            שלב {currentStepIndex + 1} מתוך {steps.length}
          </span>

          {currentStepIndex < steps.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!canGoNext()}
              className={styles.nextButton}
            >
              הבא
              <ArrowLeft size={16} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className={styles.completeButton}
            >
              <Check size={16} />
              סיים
            </button>
          )}
        </div>
      </div>
    </div>
  )
}








