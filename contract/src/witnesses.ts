/**
 * Private witness definitions for Anonymous Event Check-in (Midnight Network)
 * Level 3 Production Smart Contract
 */

export interface CheckInPrivateState {
  readonly localAttendeeSecret?: string;
  readonly lastProofTimestamp?: number;
}

export const createCheckInPrivateState = (secret?: string): CheckInPrivateState => ({
  localAttendeeSecret: secret,
  lastProofTimestamp: Date.now(),
});

export const witnesses = {};
