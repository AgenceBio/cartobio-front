import {getAllProductions} from '@/api/productions.js'

describe('productions.js', () => {
  it('try to call api', () => {
    let promise = getAllProductions();
    expect.assertions(1);
    expect(Promise.resolve(promise)).toBe(promise);
  });
  it('is an async promise', async () => {
    // expect.assertions(1);
    await expect(getAllProductions()).rejects.toThrow("Network Error");
  })
})
