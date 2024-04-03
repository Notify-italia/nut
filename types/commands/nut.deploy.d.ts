export declare const deployApps: (production?: boolean) => Promise<void>;
/**
 * a for loop that waits for the callback to finish before moving on to the next iteration.
 * @param {any[]} array - the array you want to loop through
 * @param callback - The function to execute on each element in the array.
 */
export declare const asyncForEach: <T>(array: T[], callback: (curr: T, index: number, array: unknown[]) => unknown) => Promise<void>;
