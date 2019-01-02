/// <reference types="Cypress" />

describe('Retries', () => {
  it('should retry test on the third try', () => {

    const num = Math.round(Math.random() * 10)
    expect(Cypress.env().numRuns).to.be.equal(3)
  })
})
