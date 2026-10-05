+++
date = '2026-10-04'
title = 'Newton–Raphson Convergence & Convex Optimization'
difficulty = 'medium'
language = 'c'
topic_weight = 3
subtopic_weight = 1
weight = 1
description = 'Quadratic convergence of Newton–Raphson, Armijo backtracking line search, and L-smooth convex optimization.'
+++

## Problem Statement

Given a twice continuously differentiable function $f : \mathbb{R}^n \to \mathbb{R}$ that is $\mu$-strongly convex and $L$-smooth ($\mu I \preceq \nabla^2 f(x) \preceq L I$), **Newton's method** updates iterates via:

$$x_{k+1} = x_k - [\nabla^2 f(x_k)]^{-1} \nabla f(x_k)$$

Near the unique minimizer $x^\star$, Newton's method achieves **quadratic convergence**:

$$\|x_{k+1} - x^\star\|_2 \le C \|x_k - x^\star\|_2^2$$

```c
#include <math.h>
#include <stdio.h>

double newton_sqrt(double S, double tol) {
    double x = (S > 1.0) ? S * 0.5 : 1.0;
    for (int iter = 0; iter < 50; ++iter) {
        double fx = x * x - S;
        if (fabs(fx) < tol) break;
        x = 0.5 * (x + S / x);
    }
    return x;
}
```

===EXPLANATION===

## Kantorovich & Local Quadratic Error Analysis

Let $g(x) = \nabla f(x)$ so that $g(x^\star) = 0$. Expanding $g(x^\star)$ around $x_k$ via Taylor's theorem with integral remainder gives:

$$0 = g(x^\star) = g(x_k) + Dg(x_k)(x^\star - x_k) + \int_0^1 (1 - t)\, D^2 g\big(x_k + t(x^\star - x_k)\big)[x^\star - x_k, x^\star - x_k]\,dt$$

Multiplying by $[Dg(x_k)]^{-1}$ and substituting $x_{k+1} - x_k = -[Dg(x_k)]^{-1} g(x_k)$ yields:

$$\|x_{k+1} - x^\star\| \le \frac{M}{2\mu} \|x_k - x^\star\|^2$$

where $M$ is the Lipschitz constant of the Hessian $\nabla^2 f$. Thus, once $\|x_k - x^\star\| < \frac{\mu}{M}$, the number of accurate significant digits **doubles** at every iteration.

===READING===

## Damped Newton Method with Backtracking Line Search in Python

To guarantee global convergence from arbitrary starting points, we combine the Newton direction $d_k = -[\nabla^2 f(x_k)]^{-1}\nabla f(x_k)$ with an Armijo backtracking line search:

```python
import numpy as np

def damped_newton(grad_fn, hess_fn, f_fn, x0: np.ndarray,
                  alpha: float = 0.25, beta: float = 0.5, tol: float = 1e-10):
    x = x0.astype(float).copy()
    history = [x.copy()]
    for _ in range(100):
        g = grad_fn(x)
        H = hess_fn(x)
        d = -np.linalg.solve(H, g)
        decrement_sq = float(-g @ d)
        if 0.5 * decrement_sq <= tol:
            break
        t = 1.0
        fx = f_fn(x)
        while f_fn(x + t * d) > fx - alpha * t * decrement_sq:
            t *= beta
        x = x + t * d
        history.append(x.copy())
    return x, history
```

===CODE===

```c
#include <math.h>
#include <stdio.h>

double newton_sqrt(double S, double tol) {
    double x = (S > 1.0) ? S * 0.5 : 1.0;
    for (int iter = 0; iter < 50; ++iter) {
        double fx = x * x - S;
        if (fabs(fx) < tol) break;
        x = 0.5 * (x + S / x);
    }
    return x;
}
```

===QUIZ===

## If an iterative solver exhibits local quadratic convergence with $\|e_{k+1}\| \approx \|e_k\|^2$ and the current error is $\|e_k\| = 10^{-3}$, approximately what is the error after 2 additional iterations?
- [ ] $10^{-6}$
- [ ] $10^{-9}$
- [x] $10^{-12}$
- [ ] $10^{-5}$
Correct: C
Explanation: Under quadratic convergence, one step squares $10^{-3}$ to $10^{-6}$, and the second step squares $10^{-6}$ to $(10^{-6})^2 = 10^{-12}$.

## For a $\mu$-strongly convex and $L$-smooth objective $f$, what quantity determines the linear convergence rate of standard gradient descent?
- [ ] The determinant $\det(\nabla^2 f)$
- [x] The condition number $\kappa = L / \mu$
- [ ] The trace $\operatorname{Tr}(\nabla^2 f)$
- [ ] The dimension $n$ of the ambient space $\mathbb{R}^n$
Correct: B
Explanation: Gradient descent contracts the optimality gap by a factor of $\left(\frac{\kappa - 1}{\kappa + 1}\right)^2$ per step, which depends strictly on the condition number $\kappa = L/\mu$.
