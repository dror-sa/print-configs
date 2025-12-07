import { ObjectId } from 'mongodb'

export interface MetadataRuleCondition {
  operator: 'equals' | 'notEquals' | 'lessThan' | 'greaterThan' | 'in'
  value?: number
  values?: number[]
}

export interface ComplexCondition {
  checkOffset: number
  checkOperator: 'equals' | 'notEquals' | 'lessThan' | 'greaterThan'
  checkValue: number
  andOffset: number
  andOperator: 'equals' | 'notEquals' | 'lessThan' | 'greaterThan'
  andValue: number
}

export interface RuleAction {
  setBooklet?: boolean
  setPagesPerSheet?: number
}

export interface MetadataRule {
  hardcoded?: boolean
  offset?: number
  type?: 'byte' | 'int16' | 'int32'
  conditionalOffset?: number
  conditionalValue?: number
  condition?: MetadataRuleCondition | ComplexCondition
  action?: RuleAction
  mapping?: Record<string, string | number>
  default?: string | number | boolean
  result?: boolean
  description?: string
}

export interface DriverGroup {
  _id: string | ObjectId
  groupId: string
  groupName: string
  notes?: string
  dataSource: 'metadata' | 'data'
  enabled: boolean
  drivers: string[]
  metadataRules: Record<string, MetadataRule>
}

// Response type for the lookup API
export interface DriverLookupResult {
  driver: string
  found: boolean
  config: DriverGroup | null
}

// Props interfaces
export interface EditDialogProps {
  group: DriverGroup
  onClose: () => void
  onSave: (updatedGroup: DriverGroup) => void
}

export interface RuleEditorProps {
  ruleName: string
  ruleData: MetadataRule
  onChange: (newData: MetadataRule) => void
}

export type TabType = 'general' | 'drivers' | 'rules'