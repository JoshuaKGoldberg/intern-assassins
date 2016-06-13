Feature: Login
    Tests for the login endpoint

    Scenario: Successful user login
        Given I am a user
        When I send a login request with my credentials
        Then I should receive a 200 response

    Scenario: Successful admin login
        Given I am an admin
        When I send a login request with my credentials
        Then I should receive a 200 response

    Scenario: Missing credentials
        When I send a login request with missing credentials
        Then I should receive a 401 response

    Scenario: Incorrect login credentials
        When I send a login request with incorrect credentials
        Then I should receive a 401 response
