const snarkjs = require("snarkjs");
const fs = require("fs");

async function main() {
    const input = {
        payment_flags: [1, 1, 1, 1, 1, 1] // all on time
    };

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        input,
        "credit_proof_js/credit_proof.wasm",
        "credit_proof_final.zkey"
    );

    console.log("Proof: ", JSON.stringify(proof, null, 2));
    console.log("Public signals: ", publicSignals);

    const vKey = JSON.parse(fs.readFileSync("verification_key.json"));
    const res = await snarkjs.groth16.verify(vKey, publicSignals, proof);
    console.log("Verification: ", res ? "Valid" : "Invalid");
}

main();
