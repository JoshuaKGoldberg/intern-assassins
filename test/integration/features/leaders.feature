Feature: Leaders
    Tests for the leaderboard endpoint

    Scenario: Users without kill claims
        Given the server has users
        When I send a GET request to api/leaders
        Then I should receive the users with no kills

    Scenario: Users with an unconfirmed kill claim
        Given the server has users with an unconfirmed kill claim
        When I send a GET request to api/leaders
        Then I should receive the users with no kills

    Scenario: Users with a confirmed kill claims
        Given the server has users with a confirmed kill claim
        When I send a GET request to api/leaders
        Then I should receive the users with the confirmed kill
