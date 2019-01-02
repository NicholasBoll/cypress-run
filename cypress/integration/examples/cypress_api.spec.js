/// <reference types="Cypress" />

context('Cypress.Commands', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/cypress-api')
  })

  // https://on.cypress.io/custom-commands

  it('.add() - create a custom command', () => {
    Cypress.Commands.add('console', {
      prevSubject: true,
    }, (subject, method) => {
      // the previous subject is automatically received
      // and the commands arguments are shifted

      // allow us to change the console method used
      method = method || 'log'

      // log the subject to the console
      // @ts-ignore TS7017
      console[method]('The subject is', subject)

      // whatever we return becomes the new subject
      // we don't want to change the subject so
      // we return whatever was passed in
      return subject
    })

    // @ts-ignore TS2339
    cy.get('button').console('info').then(($button) => {
      // subject is still $button
    })
  })
})


context('Cypress.Cookies', () => {
  beforeEach(() => {
    cy.visit('https://example.cypress.io/cypress-api')
  })

  // https://on.cypress.io/cookies
  it('.debug() - enable or disable debugging', () => {
    Cypress.Cookies.debug(true)

    // Cypress will now log in the console when
    // cookies are set or cleared
    cy.setCookie('fakeCookie', '123ABC')
    cy.clearCookie('fakeCookie')
    cy.setCookie('fakeCookie', '123ABC')
    cy.clearCookie('fakeCookie')
    cy.setCookie('fakeCookie', '123ABC')
  })
})
