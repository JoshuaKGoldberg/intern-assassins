import { Delay } from "./delays";

/**
 * Summary of a scheduled task.
 */
export interface IScheduled {
    /**
     * The task to be run.
     */
    task: Function;

    /**
     * Rounded time when the task will be run.
     */
    time: number;
}

/**
 * A chain of async methods, keyed by timestamp, that return whether
 * to cancel the chain (by default, false).
 */
export interface IScheduleChain {
    [i: number]: () => Promise<boolean>;
}

/**
 * Arrays of scheduled tasks to be run, keyed by timestamp.
 */
interface ISchedules {
    [i: number]: Function[];
}

/**
 * Schedules tasks to be run on approximate delays.
 */
export class Scheduler {
    /**
     * Arrays of scheduled tasks to be run, keyed by timestamp.
     */
    private schedules: ISchedules = {};

    /**
     * Delays a task to be run at an approximate delay.
     * 
     * @returns The scheduled time the task will take place.
     */
    public delay(delay: Delay, task: Function): IScheduled {
        const time: number = Date.now() + delay;

        if (!this.schedules[time]) {
            this.schedules[time] = [task];
        } else {
            this.schedules[time].push(task);
        }

        return { task, time };
    }

    /**
     * Delays a chain of async methods, keyed by timestamp.
     * 
     * @param A chain of async methods, keyed by timestamp.
     * @returns The scheduled tasks in the chain.
     */
    public delayChain(chain: IScheduleChain): IScheduled[] {
        const scheduledTasks: IScheduled[] = Object
            .keys(chain)
            .map((time: string): IScheduled => {
                return this.delay(
                    parseInt(time),
                    async (): Promise<void> => {
                        if (!(await chain[time]())) {
                            return;
                        }

                        for (const scheduled of scheduledTasks) {
                            this.cancel(scheduled);
                        }
                    });
            });

        return scheduledTasks;
    }

    /**
     * Runs all pending tasks that have reached their scheduled time.
     * 
     * @param now   The current time (by default, Date.now()).
     */
    public runTasks(now: number = Date.now()): void {
        const pastTimes: number[] = Object.keys(this.schedules)
            .map((key: string): number => parseInt(key))
            .filter((time: number): boolean => time <= now);

        for (const time of pastTimes) {
            for (const callback of this.schedules[time]) {
                callback();
            }

            delete this.schedules[time];
        }
    }

    /**
     * Cancels a scheduled task if it's still queued to run.
     * 
     * @param scheduledTasks   Summaries of scheduled tasks to cancel.
     */
    public cancel(...scheduledTasks: IScheduled[]): void {
        for (const scheduled of scheduledTasks) {
            const tasks: Function[] = this.schedules[scheduled.time];
            if (!tasks) {
                return;
            }

            const taskIndex = tasks.indexOf(scheduled.task);
            if (taskIndex !== -1) {
                tasks.splice(taskIndex, 1);
            }
        }
    }
}
