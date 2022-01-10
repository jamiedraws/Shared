export const isFunction = <T>(type: T): boolean => {
    return typeof type === "function";
};

export const isString = <T>(type: T): boolean => {
    return typeof type === "string";
};

export const isNumber = <T>(type: T): boolean => {
    return typeof type === "number";
};

export const isArray = <T>(type: T): boolean => {
    return Array.isArray(type);
};

export const isObject = <T>(type: T): boolean => {
    return type === Object(type) && !isArray<T>(type);
};

export const isNullOrUndefined = <T>(type: T): boolean => {
    return type !== null && typeof type !== "undefined";
};
