/**
 * DEMO: Self-Healing in Action
 * 
 * This test file demonstrates the self-healing mechanism
 * by intentionally using BROKEN locators after registering elements.
 * 
 * IMPORTANT: Register and heal must happen in the SAME test
 * because fingerprints are stored in browser memory.
 * 
 * Watch the Cypress log for "🔧 SELF-HEALED" messages!
 */

describe('🔧 Self-Healing Demo - See It In Action!', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('🔧 HEALING DEMO: Login with BROKEN locators', function() {
    cy.log('═══════════════════════════════════════════════════════════')
    cy.log('📝 STEP 1: Register elements with CORRECT locators')
    cy.log('═══════════════════════════════════════════════════════════')

    // Register with CORRECT locators to capture fingerprints
    cy.registerForHealing('#username', 'usernameInput')
    cy.registerForHealing('#password', 'passwordInput')
    cy.registerForHealing('#login-btn', 'loginButton')

    cy.log('✅ Elements registered! Fingerprints captured.')
    cy.log('')
    cy.log('═══════════════════════════════════════════════════════════')
    cy.log('🔴 STEP 2: Now using BROKEN locators - WATCH THE HEALING!')
    cy.log('═══════════════════════════════════════════════════════════')

    // NOW use BROKEN locators - self-healing will kick in!
    cy.log('🔴 Trying broken locator: #user-email-field (does not exist!)')
    cy.heal('#user-email-field', 'usernameInput')  // ❌ This locator doesn't exist!
      .should('be.visible')
      .type('admin')
      .should('have.value', 'admin')

    cy.log('🔴 Trying broken locator: #pass-input (does not exist!)')
    cy.heal('#pass-input', 'passwordInput')  // ❌ This locator doesn't exist!
      .should('be.visible')
      .type('password')

    cy.log('🔴 Trying broken locator: #submit-form-btn (does not exist!)')
    cy.heal('#submit-form-btn', 'loginButton')  // ❌ This locator doesn't exist!
      .should('be.visible')
      .click()

    // Verify login worked despite broken locators!
    cy.get('#login-message')
      .should('have.class', 'success')
      .and('contain', 'Login successful')

    cy.log('═══════════════════════════════════════════════════════════')
    cy.log('✅ SUCCESS! Login completed with ALL broken locators!')
    cy.log('═══════════════════════════════════════════════════════════')
  })

  it('🔧 HEALING DEMO: Search with BROKEN locators', function() {
    cy.log('📝 Registering search elements...')
    
    cy.registerForHealing('#search-input', 'searchInput')
    cy.registerForHealing('#search-btn', 'searchButton')

    cy.log('═══════════════════════════════════════════════════════════')
    cy.log('🔴 Using BROKEN locators for search...')
    cy.log('═══════════════════════════════════════════════════════════')

    cy.heal('#query-field-input', 'searchInput')  // ❌ Wrong!
      .type('electronics')

    cy.heal('#find-products-button', 'searchButton')  // ❌ Wrong!
      .click()

    cy.get('[data-testid="results-list"]')
      .find('li')
      .should('have.length.at.least', 1)

    cy.log('✅ Search worked with broken locators!')
  })

  it('🔧 HEALING DEMO: Todo list with BROKEN locators', function() {
    cy.log('📝 Registering todo elements...')
    
    cy.registerForHealing('#todo-input', 'todoInput')
    cy.registerForHealing('#add-todo-btn', 'addTodoButton')

    cy.log('═══════════════════════════════════════════════════════════')
    cy.log('🔴 Adding todos with BROKEN locators...')
    cy.log('═══════════════════════════════════════════════════════════')

    // First todo
    cy.heal('#new-task-field', 'todoInput')  // ❌ Wrong!
      .type('Task from self-healing')

    cy.heal('#create-task-button', 'addTodoButton')  // ❌ Wrong!
      .click()

    // Verify task was added
    cy.get('[data-testid="todo-list"]')
      .should('contain', 'Task from self-healing')

    cy.log('✅ Todo added with broken locators!')
  })

  it('🔧 EXTREME TEST: ALL locators are WRONG', function() {
    cy.log('═══════════════════════════════════════════════════════════')
    cy.log('🚨 EXTREME TEST: Every single locator will be WRONG!')
    cy.log('═══════════════════════════════════════════════════════════')

    // Register all elements first
    cy.registerForHealing('#username', 'user')
    cy.registerForHealing('#password', 'pass')
    cy.registerForHealing('#login-btn', 'btn')
    cy.registerForHealing('#search-input', 'search')
    cy.registerForHealing('#search-btn', 'go')

    cy.log('')
    cy.log('🔴 Starting operations with completely made-up locators...')
    cy.log('')

    // ALL of these locators are completely made up!
    cy.heal('#xyz123', 'user').type('admin')
    cy.heal('#abc456', 'pass').type('password')
    cy.heal('#qwerty', 'btn').click()

    cy.get('#login-message').should('contain', 'successful')

    cy.heal('#random-search', 'search').type('test')
    cy.heal('#go-button-xyz', 'go').click()

    cy.log('═══════════════════════════════════════════════════════════')
    cy.log('✅ ALL OPERATIONS COMPLETED WITH FAKE LOCATORS!')
    cy.log('   Check the Cypress log for "🔧 SELF-HEALED" entries!')
    cy.log('═══════════════════════════════════════════════════════════')
  })
})
