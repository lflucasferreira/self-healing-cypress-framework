import { ElementFingerprint, HealingEvent } from './types'

/**
 * In-memory store for element fingerprints and healing events
 * In production, this could be persisted to a JSON file or database
 */
class LocatorStore {
  private fingerprints: Map<string, ElementFingerprint> = new Map()
  private healingEvents: HealingEvent[] = []

  /**
   * Stores or updates an element fingerprint
   */
  saveFingerprint(fingerprint: ElementFingerprint): void {
    this.fingerprints.set(fingerprint.name, fingerprint)
  }

  /**
   * Retrieves a stored fingerprint by name
   */
  getFingerprint(name: string): ElementFingerprint | undefined {
    return this.fingerprints.get(name)
  }

  /**
   * Checks if a fingerprint exists
   */
  hasFingerprint(name: string): boolean {
    return this.fingerprints.has(name)
  }

  /**
   * Records a healing event
   */
  recordHealingEvent(event: HealingEvent): void {
    this.healingEvents.push(event)

    // Update heal count on fingerprint
    const fingerprint = this.fingerprints.get(event.elementName)
    if (fingerprint) {
      fingerprint.healCount++
      this.fingerprints.set(event.elementName, fingerprint)
    }
  }

  /**
   * Gets all healing events
   */
  getHealingEvents(): HealingEvent[] {
    return [...this.healingEvents]
  }

  /**
   * Gets all stored fingerprints
   */
  getAllFingerprints(): ElementFingerprint[] {
    return Array.from(this.fingerprints.values())
  }

  /**
   * Clears all healing events (useful between test runs)
   */
  clearHealingEvents(): void {
    this.healingEvents = []
  }

  /**
   * Exports the store data for persistence
   */
  export(): { fingerprints: ElementFingerprint[]; healingEvents: HealingEvent[] } {
    return {
      fingerprints: this.getAllFingerprints(),
      healingEvents: this.getHealingEvents(),
    }
  }

  /**
   * Imports store data from a previous session
   */
  import(data: { fingerprints: ElementFingerprint[]; healingEvents: HealingEvent[] }): void {
    data.fingerprints.forEach((fp) => this.fingerprints.set(fp.name, fp))
    this.healingEvents = data.healingEvents
  }
}

// Singleton instance
export const locatorStore = new LocatorStore()

