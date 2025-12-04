import {
  ElementAttributes,
  ElementFingerprint,
  LocatorStrategy,
  LocatorType,
  ParentInfo,
} from './types'

/**
 * Captures a complete fingerprint of a DOM element for self-healing purposes
 */
export function captureElementFingerprint(
  element: HTMLElement,
  name: string,
  primaryLocator: string
): ElementFingerprint {
  const attributes = extractAttributes(element)
  const alternativeLocators = generateAlternativeLocators(element, attributes)

  return {
    name,
    primaryLocator,
    alternativeLocators,
    attributes,
    lastSeen: new Date(),
    healCount: 0,
  }
}

/**
 * Extracts all relevant attributes from an element
 */
function extractAttributes(element: HTMLElement): ElementAttributes {
  const rect = element.getBoundingClientRect()
  const parent = element.parentElement

  const dataAttributes: Record<string, string> = {}
  Array.from(element.attributes).forEach((attr) => {
    if (attr.name.startsWith('data-')) {
      dataAttributes[attr.name] = attr.value
    }
  })

  const parentInfo: ParentInfo | undefined = parent
    ? {
        tagName: parent.tagName.toLowerCase(),
        className: parent.className || undefined,
        id: parent.id || undefined,
      }
    : undefined

  return {
    tagName: element.tagName.toLowerCase(),
    text: element.textContent?.trim().substring(0, 100) || undefined,
    innerText: (element as HTMLElement).innerText?.trim().substring(0, 100) || undefined,
    className: element.className || undefined,
    id: element.id || undefined,
    name: element.getAttribute('name') || undefined,
    placeholder: element.getAttribute('placeholder') || undefined,
    title: element.getAttribute('title') || undefined,
    ariaLabel: element.getAttribute('aria-label') || undefined,
    role: element.getAttribute('role') || undefined,
    type: element.getAttribute('type') || undefined,
    href: element.getAttribute('href') || undefined,
    src: element.getAttribute('src') || undefined,
    value: (element as HTMLInputElement).value || undefined,
    dataAttributes: Object.keys(dataAttributes).length > 0 ? dataAttributes : undefined,
    position: {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
    },
    parentInfo,
  }
}

/**
 * Generates alternative locator strategies with priority scoring
 */
function generateAlternativeLocators(
  element: HTMLElement,
  attributes: ElementAttributes
): LocatorStrategy[] {
  const locators: LocatorStrategy[] = []

  // data-testid (highest priority for testing)
  if (attributes.dataAttributes?.['data-testid']) {
    locators.push({
      type: 'data-testid',
      value: `[data-testid="${attributes.dataAttributes['data-testid']}"]`,
      priority: 1,
      confidence: 0.95,
    })
  }

  // data-cy (Cypress specific)
  if (attributes.dataAttributes?.['data-cy']) {
    locators.push({
      type: 'data-cy',
      value: `[data-cy="${attributes.dataAttributes['data-cy']}"]`,
      priority: 2,
      confidence: 0.95,
    })
  }

  // ID
  if (attributes.id) {
    locators.push({
      type: 'id',
      value: `#${attributes.id}`,
      priority: 3,
      confidence: 0.9,
    })
  }

  // aria-label (great for accessibility-focused apps)
  if (attributes.ariaLabel) {
    locators.push({
      type: 'aria-label',
      value: `[aria-label="${attributes.ariaLabel}"]`,
      priority: 4,
      confidence: 0.85,
    })
  }

  // name attribute
  if (attributes.name) {
    locators.push({
      type: 'name',
      value: `[name="${attributes.name}"]`,
      priority: 5,
      confidence: 0.8,
    })
  }

  // placeholder (for inputs)
  if (attributes.placeholder) {
    locators.push({
      type: 'placeholder',
      value: `[placeholder="${attributes.placeholder}"]`,
      priority: 6,
      confidence: 0.75,
    })
  }

  // role + text combination
  if (attributes.role && attributes.text) {
    locators.push({
      type: 'role',
      value: `[role="${attributes.role}"]`,
      priority: 7,
      confidence: 0.7,
    })
  }

  // Text content (useful for buttons, links)
  if (attributes.text && attributes.text.length < 50) {
    const textLocator = generateTextLocator(element.tagName.toLowerCase(), attributes.text)
    if (textLocator) {
      locators.push({
        type: 'text',
        value: textLocator,
        priority: 8,
        confidence: 0.7,
      })
    }
  }

  // Class-based (lower confidence due to styling changes)
  if (attributes.className && !attributes.className.includes(' ')) {
    locators.push({
      type: 'class',
      value: `.${attributes.className}`,
      priority: 9,
      confidence: 0.5,
    })
  }

  // CSS selector with parent context
  const cssWithContext = generateContextualCss(element, attributes)
  if (cssWithContext) {
    locators.push({
      type: 'css',
      value: cssWithContext,
      priority: 10,
      confidence: 0.6,
    })
  }

  return locators.sort((a, b) => a.priority - b.priority)
}

/**
 * Generates a text-based locator using Cypress contains
 */
function generateTextLocator(tagName: string, text: string): string | null {
  const safeText = text.replace(/"/g, '\\"')

  switch (tagName) {
    case 'button':
      return `button:contains("${safeText}")`
    case 'a':
      return `a:contains("${safeText}")`
    case 'label':
      return `label:contains("${safeText}")`
    default:
      return `${tagName}:contains("${safeText}")`
  }
}

/**
 * Generates a CSS selector with parent context for uniqueness
 */
function generateContextualCss(element: HTMLElement, attributes: ElementAttributes): string | null {
  const parts: string[] = []

  // Add parent context if available
  if (attributes.parentInfo?.id) {
    parts.push(`#${attributes.parentInfo.id}`)
  } else if (attributes.parentInfo?.className) {
    const firstClass = attributes.parentInfo.className.split(' ')[0]
    if (firstClass) {
      parts.push(`.${firstClass}`)
    }
  }

  // Add element selector
  let elementSelector = attributes.tagName || ''

  if (attributes.type) {
    elementSelector += `[type="${attributes.type}"]`
  }

  if (elementSelector) {
    parts.push(elementSelector)
  }

  return parts.length > 0 ? parts.join(' > ') : null
}

