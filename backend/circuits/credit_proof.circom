pragma circom 2.0.0;

template CreditProof(n) {
    signal input payment_flags[n];   // private: 1 if on-time, 0 if late
    signal output passed;

    signal sum = 0;

    for (var i = 0; i < n; i++) {
        sum += payment_flags[i];
    }

    // Pass only if all payments were on time
    passed <== sum === n;
}

component main = CreditProof(6);
