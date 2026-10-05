+++
title = 'Pure Mathematics: Algebra, Analysis & Number Theory'
description = 'Rigorous foundations of number theory, group actions, real analysis, and spectral linear algebra paired with formal proofs and algorithms.'
domain = 'Pure Mathematics'
level = 'Intermediate'
date = '2026-10-04'
topic_weight = 2
+++

## Course Overview

**Pure Mathematics: Algebra, Analysis & Number Theory** explores the core structures of modern mathematics—rings, finite fields $\mathbb{F}_p$, metric spaces, and self-adjoint operators—while translating every constructive proof into verifiable Lean 4 and Python/C algorithms.

### Modules Covered

1. **Number Theory & Finite Fields**: Bézout's identity, the Extended Euclidean Algorithm, Euler's Totient Theorem $a^{\varphi(n)} \equiv 1 \pmod n$, and primality testing.
2. **Spectral Theory & Linear Algebra**: Inner product spaces, unitary diagonalization of Hermitian operators, and the Singular Value Decomposition $A = U \Sigma V^\top$.

===READING===

## Constructive Extended GCD in C and Lean 4

For any integers $a, b \in \mathbb{Z}$, Bézout's lemma states that there exist $x, y \in \mathbb{Z}$ such that:

$$a x + b y = \gcd(a, b)$$

```c
#include <stdint.h>

int64_t extended_gcd(int64_t a, int64_t b, int64_t *x, int64_t *y) {
    if (b == 0) {
        *x = 1;
        *y = 0;
        return a;
    }
    int64_t x1 = 0, y1 = 0;
    int64_t g = extended_gcd(b, a % b, &x1, &y1);
    *x = y1;
    *y = x1 - (a / b) * y1;
    return g;
}
```
