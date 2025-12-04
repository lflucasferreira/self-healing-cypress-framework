import { ElementAttributes, ElementFingerprint, LocatorStrategy, LocatorType } from './types'

interface MatchResult {
  element: HTMLElement | null
  locator: LocatorStrategy | null
  confidence: number
  matchedBy: LocatorType | 'similarity'
}

/**
 * AI-inspired element matcher that finds elements using multiple strategies
 */
export class ElementMatcher {
  private confidenceThreshold: number

  constructor(confidenceThreshold = 0.6) {
    this.confidenceThreshold = confidenceThreshold
  }

  /**
   * Attempts to find an element using the fingerprint's alternative locators
   */
  findElement(fingerprint: ElementFingerprint): MatchResult {
    // Try each alternative locator in priority order
    for (const locator of fingerprint.alternativeLocators) {
      try {
        const elements = document.querySelectorAll(locator.value)

        if (elements.length === 1) {
          return {
            element: elements[0] as HTMLElement,
            locator,
            confidence: locator.confidence,
            matchedBy: locator.type,
          }
        }

        // If multiple elements found, try to narrow down using attributes
        if (elements.length > 1) {
          const bestMatch = this.findBestMatch(
            Array.from(elements) as HTMLElement[],
            fingerprint.attributes
          )
          if (bestMatch.confidence >= this.confidenceThreshold) {
            return {
              ...bestMatch,
              locator,
              matchedBy: locator.type,
            }
          }
        }
      } catch {
        // Invalid selector, continue to next
        continue
      }
    }

    // Last resort: similarity-based search
    return this.findBySimilarity(fingerprint.attributes)
  }

  /**
   * Finds the best matching element from a list using attribute similarity
   */
  private findBestMatch(
    elements: HTMLElement[],
    targetAttributes: ElementAttributes
  ): { element: HTMLElement | null; confidence: number } {
    let bestElement: HTMLElement | null = null
    let bestScore = 0

    for (const element of elements) {
      const score = this.calculateSimilarityScore(element, targetAttributes)
      if (score > bestScore) {
        bestScore = score
        bestElement = element
      }
    }

    return {
      element: bestElement,
      confidence: bestScore,
    }
  }

  /**
   * Searches the entire DOM for elements similar to the fingerprint
   */
  private findBySimilarity(targetAttributes: ElementAttributes): MatchResult {
    if (!targetAttributes.tagName) {
      return { element: null, locator: null, confidence: 0, matchedBy: 'similarity' }
    }

    const candidates = document.querySelectorAll(targetAttributes.tagName)
    const { element, confidence } = this.findBestMatch(
      Array.from(candidates) as HTMLElement[],
      targetAttributes
    )

    return {
      element,
      locator: null,
      confidence,
      matchedBy: 'similarity',
    }
  }

  /**
   * Calculates a similarity score between an element and target attributes
   * Uses weighted scoring for different attribute types
   */
  calculateSimilarityScore(element: HTMLElement, target: ElementAttributes): number {
    const weights = {
      text: 0.25,
      ariaLabel: 0.2,
      dataAttributes: 0.15,
      placeholder: 0.1,
      name: 0.1,
      className: 0.05,
      position: 0.1,
      role: 0.05,
    }

    let totalScore = 0
    let totalWeight = 0

    // Text similarity
    if (target.text) {
      const elementText = element.textContent?.trim() || ''
      const textSimilarity = this.stringSimilarity(elementText, target.text)
      totalScore += textSimilarity * weights.text
      totalWeight += weights.text
    }

    // aria-label
    if (target.ariaLabel) {
      const elementAriaLabel = element.getAttribute('aria-label') || ''
      const ariaScore = elementAriaLabel === target.ariaLabel ? 1 : 0
      totalScore += ariaScore * weights.ariaLabel
      totalWeight += weights.ariaLabel
    }

    // data attributes
    if (target.dataAttributes) {
      let dataScore = 0
      let dataCount = 0
      for (const [key, value] of Object.entries(target.dataAttributes)) {
        const elementValue = element.getAttribute(key)
        if (elementValue === value) {
          dataScore += 1
        }
        dataCount++
      }
      if (dataCount > 0) {
        totalScore += (dataScore / dataCount) * weights.dataAttributes
        totalWeight += weights.dataAttributes
      }
    }

    // Placeholder
    if (target.placeholder) {
      const elementPlaceholder = element.getAttribute('placeholder') || ''
      const placeholderScore = elementPlaceholder === target.placeholder ? 1 : 0
      totalScore += placeholderScore * weights.placeholder
      totalWeight += weights.placeholder
    }

    // Name attribute
    if (target.name) {
      const elementName = element.getAttribute('name') || ''
      const nameScore = elementName === target.name ? 1 : 0
      totalScore += nameScore * weights.name
      totalWeight += weights.name
    }

    // Class similarity (partial match)
    if (target.className) {
      const elementClasses = new Set(element.className.split(' '))
      const targetClasses = new Set(target.className.split(' '))
      const intersection = [...targetClasses].filter((c) => elementClasses.has(c))
      const classScore = intersection.length / targetClasses.size
      totalScore += classScore * weights.className
      totalWeight += weights.className
    }

    // Position proximity (if position data available)
    if (target.position) {
      const rect = element.getBoundingClientRect()
      const positionScore = this.calculatePositionSimilarity(rect, target.position)
      totalScore += positionScore * weights.position
      totalWeight += weights.position
    }

    // Role
    if (target.role) {
      const elementRole = element.getAttribute('role') || ''
      const roleScore = elementRole === target.role ? 1 : 0
      totalScore += roleScore * weights.role
      totalWeight += weights.role
    }

    return totalWeight > 0 ? totalScore / totalWeight : 0
  }

  /**
   * Calculates string similarity using Levenshtein distance
   */
  private stringSimilarity(str1: string, str2: string): number {
    if (str1 === str2) return 1
    if (!str1 || !str2) return 0

    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1

    if (longer.length === 0) return 1

    const distance = this.levenshteinDistance(longer, shorter)
    return (longer.length - distance) / longer.length
  }

  /**
   * Levenshtein distance algorithm
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = []

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i]
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1]
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          )
        }
      }
    }

    return matrix[str2.length][str1.length]
  }

  /**
   * Calculates position similarity based on distance
   */
  private calculatePositionSimilarity(
    rect: DOMRect,
    target: { x: number; y: number; width: number; height: number }
  ): number {
    const maxDistance = 200 // pixels
    const distance = Math.sqrt(Math.pow(rect.x - target.x, 2) + Math.pow(rect.y - target.y, 2))

    const sizeMatch =
      Math.abs(rect.width - target.width) < 50 && Math.abs(rect.height - target.height) < 50
        ? 0.5
        : 0

    const positionMatch = Math.max(0, 1 - distance / maxDistance) * 0.5

    return positionMatch + sizeMatch
  }
}

