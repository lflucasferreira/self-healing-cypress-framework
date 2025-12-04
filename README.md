# 🔧 Self-Healing Cypress Framework

A self-healing E2E test framework built with Cypress and TypeScript that automatically recovers from broken locators using AI-inspired element matching strategies.

[![Cypress](https://img.shields.io/badge/Cypress-13.x-17202C?logo=cypress)](https://www.cypress.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📋 Description

This framework demonstrates advanced test automation concepts including:

- **Self-Healing Locators**: Automatically recovers from broken selectors using element fingerprinting
- **Multi-Strategy Element Finding**: Uses multiple locator strategies (data-testid, aria-label, text content, etc.)
- **AI-Inspired Matching**: Calculates similarity scores using Levenshtein distance and attribute matching
- **Comprehensive Reporting**: Generates detailed reports of all healing events

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Self-Healing Engine                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  Element    │  │  Element    │  │  Locator                │ │
│  │  Fingerprint│──│  Matcher    │──│  Store                  │ │
│  │  Generator  │  │  (AI-based) │  │  (Persistence Layer)    │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
│         │                │                      │               │
│         ▼                ▼                      ▼               │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Healing Reporter                            │   │
│  │  - Console output with healing details                   │   │
│  │  - JSON reports for CI/CD integration                    │   │
│  │  - Markdown reports for documentation                    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Folder Structure

```
self-healing-cypress-demo/
├── cypress/
│   ├── e2e/
│   │   ├── self-healing.cy.ts     # Main demo tests
│   │   └── broken-locators.cy.ts  # Broken locator recovery tests
│   ├── fixtures/
│   │   └── example.json           # Test data
│   ├── reports/                   # Generated healing reports
│   └── support/
│       ├── commands.ts            # Custom Cypress commands
│       ├── e2e.ts                 # Support file configuration
│       └── self-healing/
│           ├── index.ts           # Main engine export
│           ├── types.ts           # TypeScript interfaces
│           ├── element-fingerprint.ts  # Fingerprint capture
│           ├── element-matcher.ts      # AI-based element matching
│           ├── locator-store.ts        # Fingerprint storage
│           └── healing-reporter.ts     # Report generation
├── src/
│   └── demo-app/
│       └── index.html             # Demo application for testing
├── cypress.config.ts              # Cypress configuration
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 How to Run

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/LFLucasFerreira/self-healing-cypress-framework.git

# Navigate to project directory
cd self-healing-cypress-framework

# Install dependencies
npm install
```

### Running Tests

```bash
# Start the demo application
npm run demo:start

# In another terminal, open Cypress
npm run cy:open

# Or run tests in headless mode
npm run cy:run
```

## 🧪 How to Test

### Basic Usage

```typescript
// Register element for self-healing (captures fingerprint)
cy.registerForHealing('#username', 'usernameInput')

// Use self-healing to find element
cy.heal('#username', 'usernameInput')
  .type('admin')
```

### Testing Self-Healing Recovery

1. Run tests once to register element fingerprints
2. Change locators in the HTML (simulate developer changes)
3. Run tests again - framework will heal broken locators

### Demo App Locator Simulator

The demo application includes toggles to simulate locator breakage:
- Remove all IDs
- Remove data-testid attributes
- Randomize class names

## 🎯 Locator Priority

The framework tries locators in this order:

| Priority | Strategy | Confidence |
|----------|----------|------------|
| 1 | data-testid | 95% |
| 2 | data-cy | 95% |
| 3 | id | 90% |
| 4 | aria-label | 85% |
| 5 | name | 80% |
| 6 | placeholder | 75% |
| 7 | role | 70% |
| 8 | text content | 70% |
| 9 | class | 50% |
| 10 | contextual CSS | 60% |

## 📊 Healing Reports

Reports are automatically generated at the end of each test run:

```json
{
  "generatedAt": "2024-12-04T10:30:00.000Z",
  "totalHealingEvents": 5,
  "events": [
    {
      "elementName": "loginButton",
      "originalLocator": "#submit-btn",
      "healedLocator": "[data-testid=\"login-button\"]",
      "strategy": "data-testid",
      "confidence": 0.95
    }
  ],
  "summary": {
    "byStrategy": { "data-testid": 3, "aria-label": 2 },
    "averageConfidence": 0.88
  }
}
```

## 🛠️ Technologies Used

| Technology | Purpose |
|------------|---------|
| [Cypress](https://www.cypress.io/) | E2E testing framework |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Node.js](https://nodejs.org/) | Runtime environment |

### Key Concepts Implemented

- **Element Fingerprinting**: Captures multiple attributes for each element
- **Levenshtein Distance**: String similarity algorithm for text matching
- **Weighted Scoring**: Different attributes contribute different weights to confidence
- **Position Proximity**: Uses element position as a fallback matching strategy

## 🤝 Contribution Guidelines

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Standards

- Write tests for new features
- Maintain TypeScript strict mode compliance
- Follow existing code style and patterns
- Update documentation for significant changes

## 📈 Future Improvements

- [ ] Visual AI integration (Applitools Eyes)
- [ ] Machine learning model for element prediction
- [ ] Persistent fingerprint storage (JSON/Database)
- [ ] CI/CD pipeline integration examples
- [ ] Visual regression testing
- [ ] Shadow DOM support
- [ ] iFrame handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Lucas Ferreira**
- GitHub: [@LFLucasFerreira](https://github.com/LFLucasFerreira)
- LinkedIn: [lflucasferreira](https://www.linkedin.com/in/lflucasferreira/)

---

⭐ If you found this project useful, please consider giving it a star!

