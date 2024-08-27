type Value = string | number | boolean | Object;
type Store = { [key: string]: Value };
type CleanUpCallbackFn = (key: string, value: Value) => boolean;

const clearStaleData = (store: Store, cleanUpCallback: CleanUpCallbackFn) => {
  for (const [key, value] of Object.entries(store)) {
    if (cleanUpCallback(key, value)) {
      delete store[key];
    }
  }
};

// Creates "key-value" store in memory with calling passed callback in set interval
// In case callback returns truthy value, key to be removed from the store
export const initNewStore = (
  cleanUpInterval: number,
  cleanUpCallback: CleanUpCallbackFn,
) => {
  const store: { [key: string]: unknown } = {};
  let timerId: NodeJS.Timeout | undefined;

  const mapHandler: ProxyHandler<Store> = {
    set(target, property, value, receiver) {
      if (!timerId) {
        timerId = setTimeout(function callback() {
          clearStaleData(target, cleanUpCallback);
          if (Object.keys(store).length) {
            timerId = setTimeout(callback, cleanUpInterval);
          } else {
            timerId = undefined;
          }
        }, cleanUpInterval);
      }

      return Reflect.set(target, property, value, receiver);
    },
    deleteProperty(target, property): boolean {
      if (timerId && Object.keys(target).length === 1 && property in target) {
        clearTimeout(timerId);
        timerId = undefined;
      }
      return Reflect.deleteProperty(target, property);
    },
  };

  return new Proxy(store, mapHandler);
};
