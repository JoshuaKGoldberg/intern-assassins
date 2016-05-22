/**
 * A player claiming to have killed or been killed.
 */
export interface IKillClaim {
    /**
     * Which player became a murderer.
     */
    killer: string;

    /**
     * Rest in potatoes.
     */
    victim: string;
}
