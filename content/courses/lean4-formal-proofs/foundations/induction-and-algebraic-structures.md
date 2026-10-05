+++
date = '2026-10-04'
title = 'Structural Induction & Algebraic Monoids'
difficulty = 'medium'
language = 'lean'
topic_weight = 1
subtopic_weight = 1
weight = 2
description = 'Structural induction over inductive types, equational reasoning, and monoid typeclass hierarchies in Lean 4.'
+++

## Problem Statement

A **Monoid** $(M, \cdot, e)$ is a set equipped with an associative binary operation and a two-sided identity element $e$:

$$\forall a, b, c \in M,\quad (a \cdot b) \cdot c = a \cdot (b \cdot c), \qquad e \cdot a = a = a \cdot e$$

Prove in Lean 4 that the identity element of any monoid is **unique**: if $e_1, e_2 \in M$ both satisfy the left and right identity laws, then $e_1 = e_2$.

```lean
class MyMonoid (M : Type) where
  mul : M → M → M
  one : M
  mul_assoc : ∀ a b c : M, mul (mul a b) c = mul a (mul b c)
  one_mul : ∀ a : M, mul one a = a
  mul_one : ∀ a : M, mul a one = a

theorem unique_identity {M : Type} [inst : MyMonoid M] (e₂ : M)
    (h_left : ∀ a : M, inst.mul e₂ a = a) : e₂ = inst.one := by
  have h1 : inst.mul e₂ inst.one = inst.one := h_left inst.one
  have h2 : inst.mul e₂ inst.one = e₂ := inst.mul_one e₂
  rw [← h2, h1]
```

===EXPLANATION===

## Equational Reasoning and Structural Induction

Consider the classic two-line proof of identity uniqueness in abstract algebra. Suppose $e_1$ is a right identity ($x \cdot e_1 = x$ for all $x$) and $e_2$ is a left identity ($e_2 \cdot y = y$ for all $y$). Evaluating the product $e_2 \cdot e_1$ in two ways gives:

$$e_2 = e_2 \cdot e_1 = e_1$$

In Lean 4, we express chained equalities using the `calc` block or `rw` (rewrite) tactic.

### Iterated Exponentiation in a Monoid

For any element $a \in M$ and natural number $n \in \mathbb{N}$, we define $a^n$ inductively by:

$$a^0 = e, \qquad a^{n+1} = a^n \cdot a$$

By structural induction on $n$, we can prove the exponent addition law:

$$a^{m + n} = a^m \cdot a^n$$

===READING===

## Fast Binary Exponentiation in Lean 4 and C++

While $a^{n+1} = a^n \cdot a$ requires $\mathcal{O}(n)$ multiplications, **binary exponentiation** (exponentiation by squaring) computes $a^n$ in $\mathcal{O}(\log n)$ monoid operations using the recurrence:

$$a^n = \begin{cases} e & \text{if } n = 0 \\ (a^2)^{n/2} & \text{if } n \text{ is even} \\ a \cdot (a^2)^{(n-1)/2} & \text{if } n \text{ is odd} \end{cases}$$

```cpp
#include <cstdint>
#include <iostream>

// Generic monoid binary exponentiation for 2x2 matrices (Fibonacci in O(log n))
struct Mat2x2 {
    uint64_t a00, a01, a10, a11;
    static Mat2x2 identity() { return {1, 0, 0, 1}; }
    Mat2x2 operator*(const Mat2x2& o) const {
        return {
            a00 * o.a00 + a01 * o.a10, a00 * o.a01 + a01 * o.a11,
            a10 * o.a00 + a11 * o.a10, a10 * o.a01 + a11 * o.a11
        };
    }
};

Mat2x2 monoid_pow(Mat2x2 base, uint64_t exp) {
    Mat2x2 result = Mat2x2::identity();
    while (exp > 0) {
        if (exp & 1) result = result * base;
        base = base * base;
        exp >>= 1;
    }
    return result;
}
```

===CODE===

```lean
theorem pow_add_nat (a m n : Nat) : a ^ (m + n) = a ^ m * a ^ n := by
  induction n with
  | zero => simp [Nat.pow_zero]
  | succ k ih =>
    rw [Nat.add_succ, Nat.pow_succ, ih, Nat.pow_succ, Nat.mul_assoc]
```

===QUIZ===

## Which algebraic property allows binary exponentiation to compute $a^n$ in $\mathcal{O}(\log n)$ multiplications instead of $\mathcal{O}(n)$?
- [ ] Commutativity ($a \cdot b = b \cdot a$)
- [x] Associativity ($(a \cdot b) \cdot c = a \cdot (b \cdot c)$)
- [ ] Existence of multiplicative inverses ($a \cdot a^{-1} = e$)
- [ ] Distributivity over addition
Correct: B
Explanation: Associativity guarantees that regrouping products into squares like $(a \cdot a) \cdot (a \cdot a)$ preserves the value of $a^n$, so binary exponentiation works in any associative monoid (including non-commutative matrix rings).

## In Lean 4, what does the tactic `rw [← h]` perform on the current goal?
- [ ] Rewrites occurrences of the left-hand side of `h : a = b` into `b`
- [x] Rewrites occurrences of the right-hand side `b` of `h : a = b` into `a`
- [ ] Applies structural induction using hypothesis `h`
- [ ] Unfolds the definition of `h` in all hypotheses
Correct: B
Explanation: The left arrow `←` reverses the direction of an equality `h : a = b`, replacing `b` with `a` in the goal.
