Feature: Users
    Tests for the users endpoint

    Scenario: Successful users GET
        Given I am an admin
        And the server has a few users
        When I send a GET request to api/users
        Then I should receive a 200 response with all users

    Scenario: Unauthorized users GET
        Given I am a user
        When I send a GET request to api/users
        Then I should receive a 401 response

    Scenario: Successful users PUT
        Given I am an admin
        When I send a PUT request to api/users with sample user data
        Then I should receive a 200 response
        And a sample user should have been created

    Scenario: Invalid users PUT 
        Given I am an admin
        When I send a PUT request to api/users with invalid user data
        Then I should receive a 500 response

    Scenario: Unauthorized users PUT
        When I send a PUT request to api/users with sample user data
        Then I should receive a 401 response
