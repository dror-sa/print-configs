import { ObjectId } from 'mongodb'

export interface MetadataRuleCondition {
  operator: 'equals' | 'notEquals' | 'lessThan' | 'greaterThan' | 'in'
  value: number
}

export interface MetadataRule {
  hardcoded?: boolean
  offset?: number
  type?: 'byte' | 'int16' | 'int32'
  conditionalOffset?: number
  conditionalValue?: number
  condition?: MetadataRuleCondition
  mapping?: Record<string, string | number>
  default?: string | number
  result?: boolean
}

export interface DriverGroup {
  _id: string | ObjectId
  groupId?: string
  groupName: string
  notes?: string
  dataSource?: 'metadata' | 'data'
  enabled: boolean
  drivers?: string[]
  metadataRules?: Record<string, MetadataRule>
}

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

