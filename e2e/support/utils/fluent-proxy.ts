/**
 * Type helper that transforms all methods in a type to return the fluent proxy type for chaining
 */
type FluentProxy<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => any
        ? (...args: A) => FluentProxy<T> & { execute: () => Promise<T> }
        : T[K];
} & { execute: () => Promise<T> };

/**
 * Creates a fluent proxy for a page object that allows method chaining
 * with deferred execution. Methods are queued and executed when execute() is called.
 * 
 * With the fluent proxy, you can chain methods without await keywords until execute():
 * 
 * @param targetPage The page object instance to wrap
 * @returns A proxy that queues method calls and executes them when execute() is called
 * 
 * @example
 * ```typescript
 * const fluentPage = createFluentProxy(new MyRoutinesPage());
 * // No await needed for chaining - only await on execute()
 * await fluentPage
 *     .waitForScreen()      // No await needed
 *     .tapCreateRoutine()   // No await needed
 *     .verifyRoutineExists('My Routine')  // No await needed
 *     .execute();           // Only await here
 * ```
 */
export function createFluentProxy<T extends object>(targetPage: T): FluentProxy<T> {
    const queue: Array<(page: T) => Promise<T>> = [];
    let proxy: any;

    proxy = new Proxy(targetPage, {
        get(target, prop) {
            // Handle 'execute' method
            if (prop === 'execute') {
                return async () => {
                    let result: T = target;
                    for (const task of queue) {
                        result = await task(result);
                    }
                    queue.length = 0;
                    return result;
                };
            }

            // Intercept page methods
            if (typeof target[prop as keyof T] === 'function') {
                return (...args: any[]) => {
                    queue.push(async (currentPage: T) => {
                        const method = currentPage[prop as keyof T] as Function;
                        return await method.apply(currentPage, args);
                    });
                    return proxy; // Return proxy for chaining (synchronously, not a Promise)
                };
            }

            // Return non-function properties directly
            return target[prop as keyof T];
        }
    });

    return proxy as FluentProxy<T>;
}

