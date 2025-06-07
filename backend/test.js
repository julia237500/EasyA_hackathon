const { CreditProfileService } = require('./src/services/credit-profile-service.ts');

async function test() {
  const service = new CreditProfileService(
    process.env.XRPL_SEED,
    process.env.EVM_RPC_URL,
    process.env.LOAN_REGISTRY_ADDRESS,
    require('./artifacts/contracts/LoanRegistry.sol/LoanRegistry.json').abi,
    './circuits/credit.wasm',
    './circuits/credit_0001.zkey',
    require('./circuits/verification_key.json')
  );

    await service.initialize();
  }
  
  test();