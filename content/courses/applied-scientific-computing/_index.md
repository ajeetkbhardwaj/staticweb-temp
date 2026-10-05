+++
title = 'Applied Mathematics & Scientific Computing'
description = 'Numerical analysis, convex optimization, Newton-Krylov solvers, and structure-preserving symplectic ODE integrators.'
domain = 'Applied Mathematics'
level = 'Advanced'
date = '2026-10-04'
topic_weight = 3
cover = '/images/course_applied_computing.jpg'
+++

## Course Overview

**Applied Mathematics & Scientific Computing** bridges continuous differential equations and variational principles with high-precision numerical algorithms in **Python**, **C**, and **C++**.

### Syllabus

1. **Nonlinear Equations & Convex Optimization**: Quadratic convergence of Newton–Raphson, Lipschitz gradient descent $L$-smoothness bounds, and conjugate gradients.
2. **Differential Equations & Geometric Integration**: Hamiltonian systems $\dot{q} = \nabla_p \mathcal{H}, \dot{p} = -\nabla_q \mathcal{H}$, Störmer–Verlet symplectic integration, and phase-space volume conservation.

===READING===

## Condition Number and Floating-Point Stability

For an invertible linear system $Ax = b$, the relative sensitivity of the solution $x$ to perturbations $\delta b$ is governed by the condition number $\kappa(A) = \|A\| \|A^{-1}\| = \frac{\sigma_{\max}(A)}{\sigma_{\min}(A)}$:

$$\frac{\|\delta x\|}{\|x\|} \le \kappa(A) \frac{\|\delta b\|}{\|b\|}$$
