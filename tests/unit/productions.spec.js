import {authenticateWithCredentials} from '@/api/user.js'
import {getAllProductions, getGroupsProduction, getProductionsFromGroup, getProductionFromId} from '@/api/productions.js'

describe('productions.js', () => {
  
  it('should reject unauthorized call', async () => {
    await expect(getAllProductions()).rejects.toThrow("Request failed with status code 500");
  });

  let token = "";

  it('should provide a token', async () => {
    let requestToken = await authenticateWithCredentials({login: process.env.TEST_LOGIN, password: process.env.TEST_PASSWORD});
    expect(requestToken).toBeDefined();
    token = requestToken.token;
  });


  let testProduction = {};

  it('should retrieve all productions', async () => {
    let productions = await getAllProductions(token);
    expect(productions.length).toBeDefined();
    expect(productions.length).toBeGreaterThan(10);
    
    
    // store a production that isn't a group (typeProductionId = 1) or a subgroup (typeProductionId = 2)
    testProduction = productions.find((production) => {
      return production.typeProductionId !== 1 && production.typeProductionId !== 2 && production.activiteId === 1;
    });
  });

  
  let testGroup = {};

  it('should retrieve all groups of productions', async () => {
    let groups = await getGroupsProduction(token);
    expect(groups).toBeDefined();
    expect(groups.length).toBe(44);
    expect(groups[0].activiteId).toBe(1);

    // store a production (activiteId = 1) group
    testGroup = groups.find((group) => {
      return group.activiteId === 1;
    });
    

  });

  
  it('should retrieve all productions from a group', async () => {
    let productions = await getProductionsFromGroup(testGroup.id, token);
    expect(productions).toBeDefined();
    expect(productions.length).toBe(43);

  });
  
  it('should retrieve a productions from its id', async () => {
    let production = await getProductionFromId(testProduction.id, token);

    // for some reason we have a typeProduction: null property when getting productions from other API calls but not this one.
    delete testProduction.typeProduction;
    expect(production).toBeDefined();
    expect(production).toEqual(testProduction);
  });
})