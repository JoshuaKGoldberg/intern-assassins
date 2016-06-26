Feature: Claims
    Tests for the claims endpoint

    Scenario: Unconfirmed killer claim
        Given I am a killer
        When I send a kill claim
        Then I should have 0 kills

    Scenario: Confirmed killer claim
        Given I am a killer
        When I send a kill claim
        And the victim confirms the kill claim
        Then I should have 1 kill

    Scenario: Self-reported victim claim
        Given I am a victim
        When I self-report a kill claim
        Then I should be dead
        And my killer should have 1 kill

    Scenario: Invalid kill claim
        Given I am a killer
        When I send an invalid kill claim
        Then it should have failed as invalid

    Scenario: Unauthorized kill claim
        When I send an unauthorized kill claim
        Then it should have failed as unauthorized
