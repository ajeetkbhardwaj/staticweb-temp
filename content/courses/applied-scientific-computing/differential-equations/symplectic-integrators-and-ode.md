+++
date = '2026-10-04'
title = 'Symplectic Integrators & Hamiltonian Mechanics'
difficulty = 'hard'
language = 'python'
topic_weight = 3
subtopic_weight = 2
weight = 2
description = 'Hamiltonian phase-space conservation, Störmer–Verlet symplectic integration, and long-term energy stability.'
+++

## Problem Statement

Consider a separable Hamiltonian dynamical system with total energy $\mathcal{H}(q, p) = T(p) + V(q) = \frac{1}{2m}\|p\|^2 + V(q)$ and Hamilton's equations:

$$\frac{dq}{dt} = \frac{\partial \mathcal{H}}{\partial p} = \frac{p}{m}, \qquad \frac{dp}{dt} = -\frac{\partial \mathcal{H}}{\partial q} = -\nabla V(q)$$

While explicit Euler integration systematically adds artificial energy and spirals outward in phase space, the second-order **Störmer–Verlet (velocity Verlet)** integrator is **symplectic**—preserving the canonical 2-form $dq \wedge dp$ exactly and keeping energy error bounded over exponentially long time horizons:

$$\begin{aligned}
p_{n + 1/2} &= p_n - \frac{\Delta t}{2} \nabla V(q_n) \\
q_{n + 1} &= q_n + \frac{\Delta t}{m} p_{n + 1/2} \\
p_{n + 1} &= p_{n + 1/2} - \frac{\Delta t}{2} \nabla V(q_{n + 1})
\end{aligned}$$

```python
import numpy as np

def velocity_verlet_step(q: np.ndarray, p: np.ndarray, grad_V, dt: float, m: float = 1.0):
    p_half = p - 0.5 * dt * grad_V(q)
    q_next = q + (dt / m) * p_half
    p_next = p_half - 0.5 * dt * grad_V(q_next)
    return q_next, p_next
```

===EXPLANATION===

## Liouville's Theorem and Symplectic Maps

A differentiable map $\Phi_{\Delta t} : (q_n, p_n) \mapsto (q_{n+1}, p_{n+1})$ on $\mathbb{R}^{2d}$ is **symplectic** if its Jacobian matrix $J = D\Phi_{\Delta t}$ satisfies:

$$J^\top \Omega J = \Omega, \qquad \text{where } \Omega = \begin{pmatrix} 0 & I_d \\ -I_d & 0 \end{pmatrix}$$

Taking determinants gives $(\det J)^2 = 1$, so $\det J = 1$: every symplectic integrator preserves phase-space volume exactly (discrete **Liouville's Theorem**).

Furthermore, by **Backward Error Analysis (Benettin–Giorgilli theorem)**, a symplectic integrator of order $r$ exactly follows the flow of a modified shadow Hamiltonian:

$$\tilde{\mathcal{H}}(q, p) = \mathcal{H}(q, p) + \mathcal{O}(\Delta t^r)$$

preventing secular energy drift over $t \sim \mathcal{O}(e^{c/\Delta t})$.

===READING===

## Comparing Explicit Euler vs. Störmer–Verlet on the Kepler Problem

For planetary motion in a gravitational potential $V(q) = -\frac{\mu}{\|q\|_2}$ with $\nabla V(q) = \frac{\mu q}{\|q\|_2^3}$:

```cpp
#include <array>
#include <cmath>

struct State2D {
    double qx, qy, px, py;
};

State2D kepler_verlet_step(State2D s, double dt, double mu = 1.0) {
    auto accel = [mu](double x, double y) -> std::array<double, 2> {
        double r3 = std::pow(x * x + y * y, 1.5);
        return {-mu * x / r3, -mu * y / r3};
    };
    auto [ax0, ay0] = accel(s.qx, s.qy);
    double px_half = s.px + 0.5 * dt * ax0;
    double py_half = s.py + 0.5 * dt * ay0;

    double qx_next = s.qx + dt * px_half;
    double qy_next = s.qy + dt * py_half;

    auto [ax1, ay1] = accel(qx_next, qy_next);
    double px_next = px_half + 0.5 * dt * ax1;
    double py_next = py_half + 0.5 * dt * ay1;

    return {qx_next, qy_next, px_next, py_next};
}
```

===CODE===

```python
import numpy as np

def velocity_verlet_step(q: np.ndarray, p: np.ndarray, grad_V, dt: float, m: float = 1.0):
    p_half = p - 0.5 * dt * grad_V(q)
    q_next = q + (dt / m) * p_half
    p_next = p_half - 0.5 * dt * grad_V(q_next)
    return q_next, p_next
```

===QUIZ===

## What is the determinant $\det(D\Phi_{\Delta t})$ of the Jacobian matrix of any symplectic numerical integrator $\Phi_{\Delta t}$?
- [ ] $0$
- [x] $1$
- [ ] $1 + \Delta t^2$
- [ ] $e^{-\Delta t}$
Correct: B
Explanation: Every symplectic map preserves the canonical 2-form $\Omega$ ($J^\top \Omega J = \Omega$) and induces $\det(J) = 1$, preserving phase-space volume exactly.

## Why does the Störmer–Verlet integrator avoid secular drift in total energy $\mathcal{H}(q_n, p_n)$ over long simulations?
- [ ] It uses implicit Newton iterations at every sub-step
- [x] It exactly conserves a nearby shadow Hamiltonian $\tilde{\mathcal{H}} = \mathcal{H} + \mathcal{O}(\Delta t^2)$
- [ ] It projects the state onto the constant-energy manifold via Lagrange multipliers
- [ ] It dampens high-frequency oscillations to zero
Correct: B
Explanation: By backward error analysis, symplectic integrators follow the exact flow of a perturbed shadow Hamiltonian $\tilde{\mathcal{H}} = \mathcal{H} + \mathcal{O}(\Delta t^2)$, bounding energy oscillations to $\mathcal{O}(\Delta t^2)$.
