describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('shows the author names', () => {
    cy.contains('Collin Shane Theodore Brett Brandon').should('be.visible');
  });
});
