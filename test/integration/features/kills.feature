Feature: Kill claims
    Tests for the kills endpoint

    Scenario: Unconfirmed kill claim
        Given I am a killer
        When I send a kill claim
        Then I should have 0 kills

    Scenario: Successful kill claim
        Given I am a killer
        When I send a kill claim
        And the victim confirms the kill claim
        Then I should have 1 kill

    Scenario: Invalid kill claim
        Given I am a killer
        When I send an invalid kill claim
        Then it should have failed as invalid

    Scenario: Unauthorized kill claim
        When I send an unauthorized kill claim
        Then it should have failed as unauthorized
