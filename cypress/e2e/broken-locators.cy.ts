/**
 * Broken Locator Recovery Tests
 *
 * These tests demonstrate how the framework recovers from
 * intentionally broken locators using the stored fingerprints.
 */

describe('Broken Locator Recovery', () => {
  beforeEach(() => {
    cy.visit('/')

    // Always register elements first to capture fingerprints
    cy.registerForHealing('#username', 'usernameInput')
    cy.registerForHealing('#password', 'passwordInput')
    cy.registerForHealing('#login-btn', 'loginButton')
    cy.registerForHealing('#search-input', 'searchInput')
    cy.registerForHealing('#search-btn', 'searchButton')
  })

  describe('ID-based Locator Failures', () => {
    it('should recover when ID changes from #username to #user-email', () => {
      // Simulating a broken locator - ID was changed by developers
      // The framework should fall back to data-testid or aria-label
      cy.heal('#user-email-field', 'usernameInput')
        .should('be.visible')
        .type('healed-user')
        .should('have.value', 'healed-user')
    })

    it('should recover when login button ID is removed', () => {
      // Trying to find by a non-existent ID
      // Should fall back to text content "Login" or data-testid
      cy.heal('#submit-login', 'loginButton')
        .should('be.visible')
        .click()

      // Form submitted with empty fields shows error
      cy.get('#login-message')
        .should('have.class', 'error')
    })
  })

  describe('Class-based Locator Failures', () => {
    it('should recover when classes are randomized', () => {
      // Register button by class first
      cy.registerForHealing('.btn-secondary', 'resetButtonByClass')

      // Try finding by a different class
      cy.heal('.random-button-class', 'resetButtonByClass')
        .should('be.visible')
    })
  })

  describe('Complete Workflow with Broken Locators', () => {
    it('should complete login even with multiple broken locators', () => {
      // All these locators are "wrong" but the framework should heal them
      cy.heal('#email-input', 'usernameInput')
        .type('admin')

      cy.heal('#pass-field', 'passwordInput')
        .type('password')

      cy.heal('#submit-btn', 'loginButton')
        .click()

      cy.get('#login-message')
        .should('contain', 'Login successful')
    })

    it('should complete search with healed elements', () => {
      cy.heal('#query-input', 'searchInput')
        .type('electronics')

      cy.heal('#find-btn', 'searchButton')
        .click()

      cy.get('[data-testid="results-list"]')
        .find('li')
        .should('have.length.at.least', 1)
    })
  })

  describe('Fallback Strategy Chain', () => {
    it('should try locators in priority order', () => {
      /**
       * Priority order:
       * 1. data-testid
       * 2. data-cy
       * 3. id
       * 4. aria-label
       * 5. name
       * 6. placeholder
       * 7. role
       * 8. text content
       * 9. class
       * 10. contextual CSS
       */

      // Register element
      cy.registerForHealing('#username', 'priorityTest')

      // Try with completely wrong locator
      // Framework should find via data-testid > aria-label > name
      cy.heal('.non-existent-class', 'priorityTest')
        .should('have.attr', 'data-testid', 'username-input')
    })
  })

  describe('Edge Cases', () => {
    it('should handle elements with similar attributes', () => {
      // Both inputs are text fields, but one is for username, other for search
      cy.registerForHealing('#username', 'loginUsername')
      cy.registerForHealing('#search-input', 'searchField')

      // Should distinguish between them using fingerprint
      cy.heal('#wrong-username', 'loginUsername')
        .should('have.attr', 'placeholder', 'Enter username')

      cy.heal('#wrong-search', 'searchField')
        .should('have.attr', 'placeholder', 'Search for products...')
    })

    it('should handle elements inside containers', () => {
      cy.registerForHealing('#login-form #username', 'usernameInForm')

      cy.heal('#some-form #email', 'usernameInForm')
        .should('be.visible')
        .and('have.attr', 'name', 'username')
    })

    it('should work with dynamically added elements', () => {
      // First, trigger dynamic content
      cy.registerForHealing('#search-btn', 'searchButton')
      cy.heal('#search-btn', 'searchButton').click()

      // Wait for results to appear
      cy.get('[data-testid="search-result"]')
        .first()
        .should('be.visible')
    })
  })

  describe('Confidence Scores', () => {
    it('should prefer high-confidence matches', () => {
      // Element with unique data-testid should match with high confidence
      cy.registerForHealing('[data-testid="login-button"]', 'highConfMatch')

      cy.heal('#wrong-id', 'highConfMatch')
        .should('contain', 'Login')
    })

    it('should accumulate confidence from multiple matching attributes', () => {
      // Element with multiple identifiers should have higher combined confidence
      cy.registerForHealing(
        '[data-testid="username-input"][aria-label="Enter your username"][name="username"]',
        'multiAttrMatch'
      )

      cy.heal('.broken-selector', 'multiAttrMatch')
        .should('be.visible')
    })
  })
})

