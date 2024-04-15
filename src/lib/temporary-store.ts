type Value = string | number | boolean | Object;
type Store = { [key: string]: Value };
type CleanUpCallbackFn = (key: string, value: Value) => boolean;

export const initNewStore = (
  cleanUpInterval: number,
  cleanUpCallback: CleanUpCallbackFn,
) => {
  const store: { [key: string]: unknown } = {};
  let timerId: NodeJS.Timeout | undefined;

  const mapHandler: ProxyHandler<Store> = {
    set(target, property, value, receiver) {
      if (!timerId) {
        timerId = setTimeout(() => {
          clearStaleData(target, cleanUpCallback);
          if (Object.keys(target).length) {
            setTimeout(
              () => clearStaleData(target, cleanUpCallback),
              cleanUpInterval,
            );
          } else {
            clearTimeout(timerId);
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

  const clearStaleData = (store: Store, cleanUpCallback: CleanUpCallbackFn) => {
    // @ts-ignore
    for (const [key, value] of Object.entries(store)) {
      if (cleanUpCallback(key, value)) {
        delete store[key];
      }
    }
  };

  return new Proxy(store, mapHandler);
};
