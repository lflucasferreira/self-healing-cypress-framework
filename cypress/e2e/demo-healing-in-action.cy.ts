/**
 * DEMO: Self-Healing in Action
 * 
 * This test file demonstrates the self-healing mechanism
 * by intentionally using BROKEN locators after registering elements.
 * 
 * Watch the console for "🔧 SELF-HEALING ACTIVATED" messages!
 */

describe('🔧 Self-Healing Demo - See It In Action!', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('Step 1: Register elements with CORRECT locators', () => {
    cy.log('📝 Registering elements to capture fingerprints...')
    
    // Register all elements with their CORRECT locators
    cy.registerForHealing('#username', 'usernameInput')
      .should('be.visible')
    
    cy.registerForHealing('#password', 'passwordInput')
      .should('be.visible')
    
    cy.registerForHealing('#login-btn', 'loginButton')
      .should('be.visible')
    
    cy.registerForHealing('#search-input', 'searchInput')
      .should('be.visible')
    
    cy.registerForHealing('#search-btn', 'searchButton')
      .should('be.visible')
    
    cy.registerForHealing('#todo-input', 'todoInput')
      .should('be.visible')
    
    cy.registerForHealing('#add-todo-btn', 'addTodoButton')
      .should('be.visible')

    cy.log('✅ All elements registered! Fingerprints captured.')
  })

  it('Step 2: 🔧 HEALING IN ACTION - Login with BROKEN locators', () => {
    // First, we MUST register elements to have fingerprints
    cy.registerForHealing('#username', 'usernameInput')
    cy.registerForHealing('#password', 'passwordInput')
    cy.registerForHealing('#login-btn', 'loginButton')

    cy.log('🔴 Now using BROKEN locators - watch the healing happen!')

    // These locators are INTENTIONALLY WRONG!
    // The self-healing will find the elements using fingerprints

    cy.log('Trying to find username with broken locator: #user-email-field')
    cy.heal('#user-email-field', 'usernameInput')  // ❌ Wrong locator!
      .should('be.visible')
      .type('admin')
      .should('have.value', 'admin')

    cy.log('Trying to find password with broken locator: #pass-input')
    cy.heal('#pass-input', 'passwordInput')  // ❌ Wrong locator!
      .should('be.visible')
      .type('password')

    cy.log('Trying to find login button with broken locator: #submit-form-btn')
    cy.heal('#submit-form-btn', 'loginButton')  // ❌ Wrong locator!
      .should('be.visible')
      .click()

    // Verify login worked!
    cy.get('#login-message')
      .should('have.class', 'success')
      .and('contain', 'Login successful')

    cy.log('✅ Login successful despite ALL locators being wrong!')
  })

  it('Step 3: 🔧 HEALING IN ACTION - Search with BROKEN locators', () => {
    // Register first
    cy.registerForHealing('#search-input', 'searchInput')
    cy.registerForHealing('#search-btn', 'searchButton')

    cy.log('🔴 Using completely wrong locators for search...')

    // Wrong locators - healing will kick in
    cy.heal('#query-field', 'searchInput')  // ❌ Wrong!
      .type('electronics')

    cy.heal('#find-products-btn', 'searchButton')  // ❌ Wrong!
      .click()

    cy.get('[data-testid="results-list"]')
      .find('li')
      .should('have.length.at.least', 1)

    cy.log('✅ Search worked with broken locators!')
  })

  it('Step 4: 🔧 HEALING IN ACTION - Todo with BROKEN locators', () => {
    // Register first
    cy.registerForHealing('#todo-input', 'todoInput')
    cy.registerForHealing('#add-todo-btn', 'addTodoButton')

    cy.log('🔴 Adding todos with wrong locators...')

    const tasks = ['Task from healing 1', 'Task from healing 2']

    tasks.forEach((task, index) => {
      cy.heal('#new-task-input', 'todoInput')  // ❌ Wrong!
        .clear()
        .type(task)

      cy.heal('#create-task-btn', 'addTodoButton')  // ❌ Wrong!
        .click()

      cy.log(`✅ Task ${index + 1} added despite broken locator!`)
    })

    // Verify tasks were added
    cy.get('[data-testid="todo-list"]')
      .should('contain', 'Task from healing 1')
      .and('contain', 'Task from healing 2')
  })

  it('Step 5: 🔧 COMPLETE FLOW with ALL broken locators', () => {
    cy.log('📝 Registering all elements...')
    
    cy.registerForHealing('#username', 'usernameInput')
    cy.registerForHealing('#password', 'passwordInput')
    cy.registerForHealing('#login-btn', 'loginButton')
    cy.registerForHealing('#search-input', 'searchInput')
    cy.registerForHealing('#search-btn', 'searchButton')

    cy.log('═══════════════════════════════════════════')
    cy.log('🔴 STARTING COMPLETE FLOW WITH BROKEN LOCATORS')
    cy.log('═══════════════════════════════════════════')

    // Login with broken locators
    cy.heal('#email', 'usernameInput').type('admin')
    cy.heal('#pwd', 'passwordInput').type('password')
    cy.heal('#btn-login', 'loginButton').click()

    cy.get('#login-message').should('contain', 'successful')

    // Search with broken locators
    cy.heal('#q', 'searchInput').type('test')
    cy.heal('#go', 'searchButton').click()

    cy.log('═══════════════════════════════════════════')
    cy.log('✅ ALL OPERATIONS COMPLETED WITH BROKEN LOCATORS!')
    cy.log('═══════════════════════════════════════════')
  })
})

