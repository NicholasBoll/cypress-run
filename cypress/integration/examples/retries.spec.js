/// <reference types="cypress" />

describe('Retries', () => {
  it('should pass test on the third try', () => {
    expect(Cypress.env().numRuns).to.be.equal(3)
  })
})
