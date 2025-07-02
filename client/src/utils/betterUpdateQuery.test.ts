import { betterUpdateQuery } from './betterUpdateQuery';

describe('betterUpdateQuery', () => {
  let mockCache: any;
  let updateQuerySpy: any;

  beforeEach(() => {
    updateQuerySpy = vi.fn();
    mockCache = {
      updateQuery: updateQuerySpy,
    };
  });

  it('calls updateQuery with correct arguments and updates data', () => {
    const qi = { query: 'TestQuery' };
    const result = { foo: 'bar' };
    const fn = (r: any, q: any) => ({ ...q, ...r });

    // Simulate updateQuery callback
    updateQuerySpy.mockImplementation((_qi: any, cb: any) => cb({ baz: 1 }));

    betterUpdateQuery(mockCache, qi, result, fn);

    expect(updateQuerySpy).toHaveBeenCalledWith(qi, expect.any(Function));
    // The callback should merge result and data
    const cb = updateQuerySpy.mock.calls[0][1];
    expect(cb({ baz: 1 })).toEqual({ baz: 1, foo: 'bar' });
  });

  it('does not call fn if data is null', () => {
    const qi = { query: 'TestQuery' };
    const result = { foo: 'bar' };
    const fn = vi.fn();

    updateQuerySpy.mockImplementation((_qi: any, cb: any) => cb(null));

    betterUpdateQuery(mockCache, qi, result, fn);

    expect(fn).not.toHaveBeenCalled();
  });

  it('does not call fn if data is undefined', () => {
    const qi = { query: 'TestQuery' };
    const result = { foo: 'bar' };
    const fn = vi.fn();

    updateQuerySpy.mockImplementation((_qi: any, cb: any) => cb(undefined));

    betterUpdateQuery(mockCache, qi, result, fn);

    expect(fn).not.toHaveBeenCalled();
  });
});
