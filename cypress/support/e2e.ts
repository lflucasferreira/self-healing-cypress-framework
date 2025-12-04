/// <reference types="cypress" />

import './commands'

// Save healing report after all tests complete
after(() => {
  cy.saveHealingReport()
})

// Log when self-healing is enabled
beforeEach(() => {
  const config = Cypress.env('selfHealing')
  if (config?.enabled) {
    Cypress.log({
      name: 'Self-Healing',
      displayName: '🔧 CONFIG',
      message: `Self-healing enabled (threshold: ${config.confidenceThreshold * 100}%)`,
    })
  }
})

