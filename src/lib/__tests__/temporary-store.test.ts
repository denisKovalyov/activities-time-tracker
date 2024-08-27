import { describe, it, expect, vi } from 'vitest';
import { initNewStore } from '../temporary-store';

describe('temporary-store', () => {
  it('should add and retrieve a value from the store', () => {
    const store = initNewStore(5000, () => false);
    store['foo'] = 'bar';
    expect(store['foo']).toBe('bar');
  });

  it('should remove stale data after the cleanup interval', async () => {
    const cleanUpCallback = vi.fn((key, value) => key === 'foo');
    const store = initNewStore(100, cleanUpCallback);

    store['foo'] = 'bar';
    store['baz'] = 'qux';

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(cleanUpCallback).toHaveBeenCalledWith('foo', 'bar');
    expect(store['foo']).toBeUndefined();
    expect(store['baz']).toBe('qux');
  });

  it('should clear the timer when the last item is removed ', async () => {
    const cleanUpCallback = vi.fn((key, value) => key === 'foo' || key === 'baz');
    const store = initNewStore(100, cleanUpCallback);

    store['foo'] = 'bar';
    store['baz'] = 'qux';

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(store['foo']).toBeUndefined();
    expect(store['baz']).toBeUndefined();

    cleanUpCallback.mockReset();
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(cleanUpCallback).not.toHaveBeenCalled();
  });

  it('should set a new timer after all properties are removed and a new one is added', async () => {
    const cleanUpCallback = vi.fn((key, value) => key === 'foo' || key === 'baz');
    const store = initNewStore(100, cleanUpCallback);

    store['foo'] = 'bar';
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(store['foo']).toBeUndefined();
    expect(cleanUpCallback).toHaveBeenCalledWith('foo', 'bar');

    cleanUpCallback.mockClear();
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(cleanUpCallback).not.toHaveBeenCalled();

    store['baz'] = 'qux';
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(store['baz']).toBeUndefined();
    expect(cleanUpCallback).toHaveBeenCalledWith('baz', 'qux');
  });

  it('should clear the timer when the last property is deleted manually', async () => {
    const cleanUpCallback = vi.fn((key, value) => key === 'foo');
    const store = initNewStore(100, cleanUpCallback);

    store['foo'] = 'bar';
    delete store['foo'];

    await new Promise(resolve => setTimeout(resolve, 150));

    expect(cleanUpCallback).not.toHaveBeenCalled();
  });
});
