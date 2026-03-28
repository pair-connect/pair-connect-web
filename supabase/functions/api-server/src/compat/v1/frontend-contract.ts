// Temporary compatibility layer for current frontend contract.
// Keep payload shapes stable while refactoring internals by blocks.

export const asFrontendContract = <T>(payload: T): T => payload;
