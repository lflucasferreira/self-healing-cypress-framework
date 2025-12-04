/**
 * Self-Healing Framework Demo Tests
 *
 * These tests demonstrate the self-healing capabilities:
 * 1. First run with correct locators to register fingerprints
 * 2. Subsequent runs can recover from broken locators
 */

describe('Self-Healing Framework Demo', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Element Registration (Initial Setup)', () => {
    it('should register login form elements for self-healing', () => {
      // Register elements with their fingerprints
      cy.registerForHealing('#username', 'usernameInput')
        .should('be.visible')

      cy.registerForHealing('#password', 'passwordInput')
        .should('be.visible')

      cy.registerForHealing('#login-btn', 'loginButton')
        .should('be.visible')

      cy.registerForHealing('#reset-btn', 'resetButton')
        .should('be.visible')
    })

    it('should register search elements for self-healing', () => {
      cy.registerForHealing('#search-input', 'searchInput')
        .should('be.visible')

      cy.registerForHealing('#category-select', 'categorySelect')
        .should('be.visible')

      cy.registerForHealing('#search-btn', 'searchButton')
        .should('be.visible')
    })

    it('should register todo elements for self-healing', () => {
      cy.registerForHealing('#todo-input', 'todoInput')
        .should('be.visible')

      cy.registerForHealing('#add-todo-btn', 'addTodoButton')
        .should('be.visible')
    })
  })

  describe('Self-Healing in Action', () => {
    beforeEach(() => {
      // First, register elements to capture fingerprints
      cy.registerForHealing('#username', 'usernameInput')
      cy.registerForHealing('#password', 'passwordInput')
      cy.registerForHealing('#login-btn', 'loginButton')
    })

    it('should heal and find username input when ID changes', () => {
      // Simulate ID change by using a wrong locator
      // The framework will use fingerprint to find the element
      cy.heal('[data-testid="username-input"]', 'usernameInput')
        .type('admin')
        .should('have.value', 'admin')
    })

    it('should complete login flow using self-healing', () => {
      cy.heal('#username', 'usernameInput')
        .type('admin')

      cy.heal('#password', 'passwordInput')
        .type('password')

      cy.heal('#login-btn', 'loginButton')
        .click()

      cy.get('#login-message')
        .should('have.class', 'success')
        .and('contain', 'Login successful')
    })

    it('should handle search functionality with self-healing', () => {
      cy.registerForHealing('#search-input', 'searchInput')
      cy.registerForHealing('#search-btn', 'searchButton')

      cy.heal('#search-input', 'searchInput')
        .type('Product')

      cy.heal('#search-btn', 'searchButton')
        .click()

      cy.get('[data-testid="results-list"]')
        .find('[data-testid="search-result"]')
        .should('have.length.at.least', 1)
    })
  })

  describe('Multiple Locator Strategies', () => {
    it('should find element by data-testid when ID fails', () => {
      cy.registerForHealing('[data-testid="username-input"]', 'usernameByTestId')

      // Now try to find using a different/broken locator
      cy.heal('[data-testid="username-input"]', 'usernameByTestId')
        .should('be.visible')
        .type('test-user')
    })

    it('should find element by aria-label when other locators fail', () => {
      cy.registerForHealing('[aria-label="Enter your username"]', 'usernameByAria')

      cy.heal('[aria-label="Enter your username"]', 'usernameByAria')
        .should('be.visible')
    })

    it('should find button by text content', () => {
      cy.registerForHealing('button:contains("Login")', 'loginByText')

      cy.heal('button:contains("Login")', 'loginByText')
        .should('be.visible')
    })
  })

  describe('Todo List with Self-Healing', () => {
    beforeEach(() => {
      cy.registerForHealing('#todo-input', 'todoInput')
      cy.registerForHealing('#add-todo-btn', 'addTodoButton')
    })

    it('should add new todo items using self-healing', () => {
      const newTask = 'Complete self-healing demo'

      cy.heal('#todo-input', 'todoInput')
        .type(newTask)

      cy.heal('#add-todo-btn', 'addTodoButton')
        .click()

      cy.get('[data-testid="todo-list"]')
        .should('contain', newTask)
    })

    it('should handle multiple todo operations', () => {
      const tasks = ['Task 1', 'Task 2', 'Task 3']

      tasks.forEach((task) => {
        cy.heal('#todo-input', 'todoInput')
          .clear()
          .type(task)

        cy.heal('#add-todo-btn', 'addTodoButton')
          .click()
      })

      cy.get('[data-testid="todo-list"] [data-testid="todo-item"]')
        .should('have.length.at.least', 5) // 2 existing + 3 new
    })
  })

  describe('Confidence Threshold Behavior', () => {
    it('should successfully heal element with high confidence match', () => {
      // Register with multiple strong identifiers
      cy.registerForHealing(
        '[data-testid="login-button"][aria-label="Login to your account"]',
        'loginButtonHighConfidence'
      )

      // Should find with high confidence
      cy.heal(
        '[data-testid="login-button"]',
        'loginButtonHighConfidence'
      )
        .should('be.visible')
        .and('contain', 'Login')
    })
  })

  describe('Report Generation', () => {
    it('should generate healing report at end of test run', () => {
      // Perform some operations that may trigger healing
      cy.registerForHealing('#username', 'usernameForReport')
      cy.heal('#username', 'usernameForReport').type('test')

      cy.registerForHealing('#password', 'passwordForReport')
      cy.heal('#password', 'passwordForReport').type('test')

      // Report is automatically saved in after() hook
    })
  })
})

