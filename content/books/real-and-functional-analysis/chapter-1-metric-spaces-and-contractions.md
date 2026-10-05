+++
title = 'Chapter 1: Complete Metric Spaces & Contraction Mappings'
chapter = 1
weight = 1
date = '2026-10-04'
description = 'Cauchy sequences, completeness, the Banach Fixed-Point Theorem, and Picard-Lindelof ODE existence.'
+++

## 1.1 Metric Spaces and Cauchy Completeness

A **metric space** $(X, d)$ is called **complete** if every Cauchy sequence $(x_n)_{n=1}^\infty$—satisfying $\forall \varepsilon > 0,\, \exists N \in \mathbb{N}$ such that $m, n \ge N \implies d(x_m, x_n) < \varepsilon$—converges to a limit $x^* \in X$.

## 1.2 The Banach Fixed-Point Theorem

**Theorem (Banach, 1922).** Let $(X, d)$ be a non-empty complete metric space and let $T : X \to X$ be a **contraction mapping** with Lipschitz constant $q \in [0, 1)$:

$$d(T(x), T(y)) \le q \, d(x, y) \qquad \forall x, y \in X$$

Then $T$ admits a unique fixed point $x^* \in X$ ($T(x^*) = x^*$), and for any initial guess $x_0 \in X$, the Picard iteration $x_{n+1} = T(x_n)$ satisfies the *a priori* error bound:

$$d(x_n, x^*) \le \frac{q^n}{1 - q} d(x_1, x_0)$$

```lean
-- Formal statement of Lipschitz contraction on a metric space in Lean 4
structure ContractionOn (X : Type) (d : X → X → Float) where
  T : X → X
  q : Float
  hq_nonneg : 0.0 ≤ q
  hq_lt_one : q < 1.0
```

```python
import numpy as np

def picard_banach_fixed_point(T, x0: float, q: float, tol: float = 1e-12):
    """Iterate x_{n+1} = T(x_n) and track the Banach a-priori bound."""
    x1 = T(x0)
    d10 = abs(x1 - x0)
    x = x1
    n = 1
    while True:
        apriori_bound = (q ** n / (1.0 - q)) * d10
        if apriori_bound < tol:
            break
        x = T(x)
        n += 1
    return x, n

# Solve cos(x) / 2 = x on R (contraction with q = 0.5)
star, iters = picard_banach_fixed_point(lambda x: 0.5 * np.cos(x), 0.0, q=0.5)
print(f"Fixed point x* = {star:.12f} reached in {iters} iterations")
```
