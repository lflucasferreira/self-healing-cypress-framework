/**
 * Self-Healing Cypress Framework
 *
 * A framework that automatically recovers from broken locators
 * using AI-inspired element matching strategies.
 *
 * @author Lucas Ferreira
 * @license MIT
 */

export * from './types'
export * from './element-fingerprint'
export * from './element-matcher'
export * from './locator-store'
export * from './healing-reporter'

import { captureElementFingerprint } from './element-fingerprint'
import { ElementMatcher } from './element-matcher'
import { locatorStore } from './locator-store'
import { healingReporter } from './healing-reporter'
import { ElementFingerprint, HealingEvent, SelfHealingConfig } from './types'

/**
 * Main self-healing engine that orchestrates element finding and healing
 */
export class SelfHealingEngine {
  private matcher: ElementMatcher
  private config: SelfHealingConfig

  constructor(config: Partial<SelfHealingConfig> = {}) {
    this.config = {
      enabled: true,
      confidenceThreshold: 0.6,
      maxAlternatives: 5,
      reportPath: 'cypress/reports/healing-report.json',
      autoUpdateLocators: false,
      ...config,
    }
    this.matcher = new ElementMatcher(this.config.confidenceThreshold)
  }

  /**
   * Attempts to find an element, using self-healing if primary locator fails
   */
  findElement(
    primaryLocator: string,
    elementName: string,
    context: { testFile: string; testName: string }
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.document().then((doc) => {
      // First, try the primary locator
      const primaryResult = doc.querySelectorAll(primaryLocator)

      if (primaryResult.length === 1) {
        // Primary locator works - update fingerprint
        const element = primaryResult[0] as HTMLElement
        const fingerprint = captureElementFingerprint(element, elementName, primaryLocator)
        locatorStore.saveFingerprint(fingerprint)

        return cy.wrap(Cypress.$(element))
      }

      // Primary locator failed - attempt self-healing
      if (!this.config.enabled) {
        throw new Error(`Element not found: ${primaryLocator}`)
      }

      return this.healAndFind(primaryLocator, elementName, context)
    })
  }

  /**
   * Performs the self-healing process
   */
  private healAndFind(
    primaryLocator: string,
    elementName: string,
    context: { testFile: string; testName: string }
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    const fingerprint = locatorStore.getFingerprint(elementName)

    if (!fingerprint) {
      throw new Error(
        `Element "${elementName}" not found and no fingerprint available for self-healing. ` +
          `Original locator: ${primaryLocator}`
      )
    }

    // Use the matcher to find the element
    const result = this.matcher.findElement(fingerprint)

    if (!result.element || result.confidence < this.config.confidenceThreshold) {
      throw new Error(
        `Self-healing failed for "${elementName}". ` +
          `Best match confidence: ${(result.confidence * 100).toFixed(1)}% ` +
          `(threshold: ${(this.config.confidenceThreshold * 100).toFixed(1)}%)`
      )
    }

    // Record the healing event
    const healingEvent: HealingEvent = {
      timestamp: new Date(),
      elementName,
      originalLocator: primaryLocator,
      healedLocator: result.locator?.value || 'similarity-based',
      strategy: result.matchedBy,
      confidence: result.confidence,
      testFile: context.testFile,
      testName: context.testName,
    }

    locatorStore.recordHealingEvent(healingEvent)

    // Log the healing event visually in Cypress
    Cypress.log({
      name: '🔧 HEALED',
      displayName: '🔧 SELF-HEALED',
      message: `"${elementName}" found via ${result.matchedBy} (${(result.confidence * 100).toFixed(0)}% confidence)`,
      consoleProps: () => ({
        '🎯 Element Name': elementName,
        '❌ Original Locator (broken)': primaryLocator,
        '✅ Healed Locator': result.locator?.value || 'similarity-based',
        '🔍 Strategy Used': result.matchedBy,
        '📊 Confidence': `${(result.confidence * 100).toFixed(1)}%`,
        '📁 Test File': context.testFile,
        '🧪 Test Name': context.testName,
      }),
    })

    // Also log to terminal
    cy.task('logHealingEvent', healingEvent)

    // Update fingerprint with new heal count
    const updatedFingerprint: ElementFingerprint = {
      ...fingerprint,
      healCount: fingerprint.healCount + 1,
      lastSeen: new Date(),
    }
    locatorStore.saveFingerprint(updatedFingerprint)

    return cy.wrap(Cypress.$(result.element))
  }

  /**
   * Registers an element for self-healing (call this during initial test development)
   */
  registerElement(
    locator: string,
    elementName: string
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    return cy.get(locator).then(($el) => {
      const element = $el[0]
      const fingerprint = captureElementFingerprint(element, elementName, locator)
      locatorStore.saveFingerprint(fingerprint)

      Cypress.log({
        name: 'registerElement',
        message: `Registered "${elementName}" for self-healing`,
        consoleProps: () => ({
          elementName,
          locator,
          alternativeLocators: fingerprint.alternativeLocators.length,
        }),
      })

      return cy.wrap($el)
    })
  }

  /**
   * Gets the healing report
   */
  getReport() {
    return healingReporter.generateReport()
  }

  /**
   * Saves the healing report
   */
  saveReport(): Cypress.Chainable<null> {
    const report = healingReporter.generateReport()
    return cy.task('saveHealingReport', report)
  }
}

// Default engine instance
export const selfHealingEngine = new SelfHealingEngine()

