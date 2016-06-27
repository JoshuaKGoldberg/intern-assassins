"use strict";

const expect = require("chai").expect;
const sinon = require("sinon");
const Scheduler = require("../..//src/server/cron/scheduler").Scheduler;

describe("Scheduler", () => {
    describe("delay", () => {
        it("schedules the function for after the delay", () => {
            // Arrange
            const scheduler = new Scheduler();
            const delay = 1000;

            // Act
            const now = Date.now();
            const scheduled = scheduler.delay(1000, () => {});

            // Assert
            expect(scheduled.time).to.be.closeTo(now + delay, 10);
        });

        it("doesn't run the function until after the delay", () => {
            // Arrange
            const scheduler = new Scheduler();
            const spy = sinon.spy();

            // Act
            scheduler.delay(1000, spy);
            scheduler.runTasks(Date.now());

            // Assert
            expect(spy.called).to.be.false;
        });

        it("runs the function after the delay", () => {
            // Arrange
            const scheduler = new Scheduler();
            const delay = 1000;
            const spy = sinon.spy();

            // Act
            scheduler.delay(delay, spy);
            scheduler.runTasks(Date.now() + delay + 10); // 10 seconds added for clock skew

            // Assert
            expect(spy.calledOnce).to.be.true;
        });
    });

    describe("runTasks", () => {
        it("runs tasks in the chain", () => {
            // Arrange
            const scheduler = new Scheduler();
            const delay = 1000;
            const spies = [sinon.spy(), sinon.spy()];

            // Act
            scheduler.delayChain({
                [delay / 2]: spies[0],
                [delay]: spies[1]
            });
            scheduler.runTasks(Date.now() + delay + 10); // 10 seconds added for clock skew

            // Assert
            expect(spies[0].calledOnce).to.be.true;
            expect(spies[1].calledOnce).to.be.true;
        });
    });

    describe("cancel", () => {
        it("cancels a task when requested", () => {
            // Arrange
            const scheduler = new Scheduler();
            const delay = 1000;
            const spy = sinon.spy();
            const scheduled = scheduler.delay(delay, spy);

            // Act
            scheduler.cancel(scheduled);

            // Asset
            expect(spy.called).to.be.false;
        });
    });
});
