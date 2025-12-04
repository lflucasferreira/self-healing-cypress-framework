import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3333',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    env: {
      selfHealing: {
        enabled: true,
        confidenceThreshold: 0.6,
        maxAlternatives: 5,
        reportPath: 'cypress/reports/healing-report.json',
        autoUpdateLocators: false,
      },
    },
    setupNodeEvents(on, config) {
      on('task', {
        logHealingEvent(event) {
          console.log('\n🔧 SELF-HEALING EVENT:')
          console.log(`   Element: ${event.elementName}`)
          console.log(`   Original Locator: ${event.originalLocator}`)
          console.log(`   Healed Locator: ${event.healedLocator}`)
          console.log(`   Confidence: ${(event.confidence * 100).toFixed(1)}%`)
          console.log(`   Strategy: ${event.strategy}\n`)
          return null
        },
        saveHealingReport(report) {
          const fs = require('fs')
          const path = require('path')
          const reportPath = path.join(__dirname, 'cypress/reports/healing-report.json')
          const dir = path.dirname(reportPath)
          
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true })
          }
          
          fs.writeFileSync(reportPath, JSON.stringify(report, null, 2))
          console.log(`📊 Healing report saved to: ${reportPath}`)
          return null
        },
      })
      return config
    },
  },
})

