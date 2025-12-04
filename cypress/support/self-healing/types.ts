/**
 * Element fingerprint containing multiple identification strategies
 */
export interface ElementFingerprint {
  /** Unique identifier for this element in tests */
  name: string
  /** Primary locator (the one used in test code) */
  primaryLocator: string
  /** Alternative locators for fallback */
  alternativeLocators: LocatorStrategy[]
  /** Visual/positional attributes for AI matching */
  attributes: ElementAttributes
  /** Last known state */
  lastSeen?: Date
  /** Number of times this element was healed */
  healCount: number
}

export interface LocatorStrategy {
  type: LocatorType
  value: string
  priority: number
  confidence: number
}

export type LocatorType =
  | 'id'
  | 'data-testid'
  | 'data-cy'
  | 'aria-label'
  | 'text'
  | 'css'
  | 'xpath'
  | 'class'
  | 'name'
  | 'placeholder'
  | 'title'
  | 'role'

export interface ElementAttributes {
  tagName?: string
  text?: string
  innerText?: string
  className?: string
  id?: string
  name?: string
  placeholder?: string
  title?: string
  ariaLabel?: string
  role?: string
  type?: string
  href?: string
  src?: string
  value?: string
  dataAttributes?: Record<string, string>
  position?: ElementPosition
  parentInfo?: ParentInfo
}

export interface ElementPosition {
  x: number
  y: number
  width: number
  height: number
}

export interface ParentInfo {
  tagName: string
  className?: string
  id?: string
}

export interface HealingEvent {
  timestamp: Date
  elementName: string
  originalLocator: string
  healedLocator: string
  strategy: LocatorType
  confidence: number
  testFile: string
  testName: string
}

export interface HealingReport {
  generatedAt: Date
  totalTests: number
  totalHealingEvents: number
  events: HealingEvent[]
  summary: HealingSummary
}

export interface HealingSummary {
  byStrategy: Record<LocatorType, number>
  byElement: Record<string, number>
  averageConfidence: number
  successRate: number
}

export interface SelfHealingConfig {
  enabled: boolean
  confidenceThreshold: number
  maxAlternatives: number
  reportPath: string
  autoUpdateLocators: boolean
}

