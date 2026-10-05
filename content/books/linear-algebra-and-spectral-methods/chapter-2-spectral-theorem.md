+++
title = 'Chapter 2: The Spectral Theorem & Rayleigh Quotients'
chapter = 2
weight = 2
date = '2026-10-04'
description = 'Self-adjoint operators, Courant-Fischer minimax variational principle, and Rayleigh quotient iteration.'
+++

## 2.1 The Spectral Theorem for Hermitian Matrices

Every Hermitian matrix $A \in \mathbb{C}^{n \times n}$ ($A^* = A$) admits a unitary diagonalization with real eigenvalues $\lambda_1 \ge \lambda_2 \ge \cdots \ge \lambda_n$:

$$A = Q \Lambda Q^* = \sum_{i=1}^n \lambda_i q_i q_i^*, \qquad Q^* Q = I_n$$

## 2.2 Courant–Fischer Variational Principle

The **Rayleigh quotient** $R_A(x) = \frac{x^* A x}{x^* x}$ characterizes eigenvalues via the **Courant–Fischer minimax theorem**:

$$\lambda_k = \max_{\substack{U \subseteq \mathbb{C}^n \\ \dim(U) = k}} \;\min_{\substack{x \in U \\ x \ne 0}} \frac{x^* A x}{x^* x} = \min_{\substack{W \subseteq \mathbb{C}^n \\ \dim(W) = n-k+1}} \;\max_{\substack{x \in W \\ x \ne 0}} \frac{x^* A x}{x^* x}$$

Because $\nabla R_A(q_i) = 0$ at every eigenvector $q_i$, **Rayleigh Quotient Iteration (RQI)** achieves **cubic** convergence $\|x^{(k+1)} - q_i\| = \mathcal{O}(\|x^{(k)} - q_i\|^3)$ near any simple eigenvalue:

```python
import numpy as np

def rayleigh_quotient_iteration(A: np.ndarray, x0: np.ndarray, steps: int = 6):
    x = x0 / np.linalg.norm(x0)
    n = A.shape[0]
    for k in range(steps):
        mu = float(x.T @ A @ x)
        residual = np.linalg.norm(A @ x - mu * x)
        print(f"Step {k}: mu = {mu:.12f}, ||Ax - mu x||_2 = {residual:.2e}")
        if residual < 1e-14:
            break
        y = np.linalg.solve(A - mu * np.eye(n), x)
        x = y / np.linalg.norm(y)
    return float(x.T @ A @ x), x

A = np.array([[4.0, 1.0, 0.5], [1.0, 3.0, 0.2], [0.5, 0.2, 2.0]])
rayleigh_quotient_iteration(A, np.array([1.0, 0.8, 0.4]))
```
