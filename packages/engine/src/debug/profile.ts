export const profile = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
        const start = performance.now();
        const result = originalMethod.apply(this, args);
        const end = performance.now();

        const ms = end - start;
        const s = ms / 1000;

        console.log(`${target.constructor.name}.${String(propertyKey)} took ${s}s`);

        return result;
    };

    return descriptor;
}

export const profileCallback = (methodName: string, callback: Function) => {
    const start = performance.now();
    const result = callback();
    const end = performance.now();

    console.log(`${methodName} took ${end - start}ms`);

    return result;
}