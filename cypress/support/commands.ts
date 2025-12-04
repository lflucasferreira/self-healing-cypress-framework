/// <reference types="cypress" />

import { selfHealingEngine } from './self-healing'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Self-healing element finder that automatically recovers from broken locators
       * @param locator - CSS selector or other locator
       * @param elementName - Unique name for this element (used for fingerprinting)
       * @example cy.heal('#submit-btn', 'submitButton')
       */
      heal(locator: string, elementName: string): Chainable<JQuery<HTMLElement>>

      /**
       * Registers an element for future self-healing
       * Call this during initial test development to capture element fingerprint
       * @param locator - CSS selector or other locator
       * @param elementName - Unique name for this element
       * @example cy.registerForHealing('#submit-btn', 'submitButton')
       */
      registerForHealing(locator: string, elementName: string): Chainable<JQuery<HTMLElement>>

      /**
       * Saves the self-healing report at the end of test run
       * @example cy.saveHealingReport()
       */
      saveHealingReport(): Chainable<null>
    }
  }
}

/**
 * Self-healing get command
 * Uses primary locator first, falls back to AI-based healing if it fails
 */
Cypress.Commands.add('heal', (locator: string, elementName: string) => {
  const testFile = Cypress.spec.relative
  const testName = Cypress.currentTest.title

  Cypress.log({
    name: 'heal',
    displayName: '🔧 HEAL',
    message: `Finding "${elementName}"`,
    consoleProps: () => ({
      locator,
      elementName,
      testFile,
      testName,
    }),
  })

  return selfHealingEngine.findElement(locator, elementName, { testFile, testName })
})

/**
 * Register element for self-healing
 * Captures element fingerprint for future healing attempts
 */
Cypress.Commands.add('registerForHealing', (locator: string, elementName: string) => {
  Cypress.log({
    name: 'registerForHealing',
    displayName: '📝 REGISTER',
    message: `Registering "${elementName}" for self-healing`,
    consoleProps: () => ({
      locator,
      elementName,
    }),
  })

  return selfHealingEngine.registerElement(locator, elementName)
})

/**
 * Save healing report
 */
Cypress.Commands.add('saveHealingReport', () => {
  return selfHealingEngine.saveReport()
})

