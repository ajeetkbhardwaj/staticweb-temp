+++
date = '2026-10-04'
title = 'Modular Arithmetic & Euler Totient Theorem'
difficulty = 'medium'
language = 'python'
topic_weight = 2
subtopic_weight = 1
weight = 1
description = 'Bézout identity, the Extended Euclidean Algorithm, binary modular exponentiation, and Euler–Fermat theorems.'
+++

## Problem Statement

Let $n \ge 2$ be a positive integer and let $(\mathbb{Z}/n\mathbb{Z})^\times$ denote the multiplicative group of units modulo $n$:

$$(\mathbb{Z}/n\mathbb{Z})^\times = \{ \bar{a} \in \mathbb{Z}/n\mathbb{Z} \mid \gcd(a, n) = 1 \}$$

Its cardinality is Euler's totient function $\varphi(n) = |(\mathbb{Z}/n\mathbb{Z})^\times|$. Implement a function `mod_inverse(a, p)` using Fermat's Little Theorem $a^{p-2} \equiv a^{-1} \pmod p$ for prime $p$, and compute $\varphi(n)$ from the prime factorization $n = \prod_{i=1}^k p_i^{e_i}$:

$$\varphi(n) = n \prod_{p \mid n} \left(1 - \frac{1}{p}\right)$$

```python
def euler_totient(n: int) -> int:
    result = n
    p = 2
    temp = n
    while p * p <= temp:
        if temp % p == 0:
            while temp % p == 0:
                temp //= p
            result -= result // p
        p += 1
    if temp > 1:
        result -= result // temp
    return result

def mod_inverse_prime(a: int, p: int) -> int:
    return pow(a, p - 2, p)
```

===EXPLANATION===

## Lagrange's Theorem and Euler's Totient Theorem

Because $(\mathbb{Z}/n\mathbb{Z})^\times$ is a finite abelian group of order $G = \varphi(n)$ under multiplication modulo $n$, **Lagrange's Theorem** implies that the order of every element $a \in (\mathbb{Z}/n\mathbb{Z})^\times$ divides $|G| = \varphi(n)$. Consequently:

$$a^{\varphi(n)} \equiv 1 \pmod n \qquad \text{whenever } \gcd(a, n) = 1$$

When $n = p$ is prime, every nonzero residue $1, 2, \dots, p-1$ is coprime to $p$, so $\varphi(p) = p - 1$, recovering **Fermat's Little Theorem**:

$$a^{p-1} \equiv 1 \pmod p \implies a \cdot a^{p-2} \equiv 1 \pmod p$$

### Multiplicativity via the Chinese Remainder Theorem

For coprime integers $\gcd(m, n) = 1$, the ring isomorphism

$$\mathbb{Z}/(mn)\mathbb{Z} \cong (\mathbb{Z}/m\mathbb{Z}) \times (\mathbb{Z}/n\mathbb{Z})$$

restricts to a group isomorphism on the unit groups, proving $\varphi(mn) = \varphi(m)\varphi(n)$.

===READING===

## Formalizing Modular Congruences in Lean 4

In Lean 4, modular equivalence $a \equiv b \pmod n$ is represented by `Nat.ModEq n a b`:

```lean
-- Reflexivity, symmetry, and compatibility of modular congruence
def ModEq (n a b : Nat) : Prop := a % n = b % n

theorem modeq_refl (n a : Nat) : ModEq n a a := rfl

theorem modeq_symm {n a b : Nat} (h : ModEq n a b) : ModEq n b a :=
  h.symm

theorem modeq_trans {n a b c : Nat} (h1 : ModEq n a b) (h2 : ModEq n b c) :
    ModEq n a c :=
  Eq.trans h1 h2
```

===CODE===

```python
def euler_totient(n: int) -> int:
    result = n
    p = 2
    temp = n
    while p * p <= temp:
        if temp % p == 0:
            while temp % p == 0:
                temp //= p
            result -= result // p
        p += 1
    if temp > 1:
        result -= result // temp
    return result
```

===QUIZ===

## What is the value of Euler's totient function $\varphi(p^k)$ for a prime $p$ and integer $k \ge 1$?
- [ ] $p^k - 1$
- [x] $p^k - p^{k-1} = p^{k-1}(p - 1)$
- [ ] $(p - 1)^k$
- [ ] $p^{k-1}$
Correct: B
Explanation: Among the $p^k$ residues modulo $p^k$, an integer is not coprime to $p^k$ if and only if it is a multiple of $p$. There are exactly $p^k / p = p^{k-1}$ such multiples, leaving $p^k - p^{k-1}$ units.

## If $p = 17$ is prime and $a = 3$, which expression gives the multiplicative inverse $3^{-1} \pmod{17}$ by Fermat's Little Theorem?
- [ ] $3^{16} \bmod 17$
- [x] $3^{15} \bmod 17$
- [ ] $3^{17} \bmod 17$
- [ ] $17^2 \bmod 3$
Correct: B
Explanation: Since $a^{p-1} \equiv 1 \pmod p$, we have $a \cdot a^{p-2} \equiv 1 \pmod p$. For $p=17$, $p-2 = 15$, so $3^{15} \equiv 6 \pmod{17}$ (indeed $3 \times 6 = 18 \equiv 1 \pmod{17}$).
