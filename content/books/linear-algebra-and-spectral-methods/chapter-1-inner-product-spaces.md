+++
title = 'Chapter 1: Inner Product Spaces & Orthogonal Projections'
chapter = 1
weight = 1
date = '2026-10-04'
description = 'Cauchy-Schwarz inequality, Gram-Schmidt orthogonalization, Householder reflections, and QR factorization.'
+++

## 1.1 Inner Products and the Cauchy–Schwarz Inequality

Let $V$ be a vector space over $\mathbb{F} \in \{\mathbb{R}, \mathbb{C}\}$. An **inner product** $\langle \cdot, \cdot \rangle : V \times V \to \mathbb{F}$ induces the norm $\|v\| = \sqrt{\langle v, v \rangle}$ satisfying the **Cauchy–Schwarz inequality** for all $u, v \in V$:

$$|\langle u, v \rangle| \le \|u\|\,\|v\|$$

with equality if and only if $u$ and $v$ are linearly dependent.

## 1.2 Orthogonal Projectors and Householder Reflections

Given a non-zero vector $v \in \mathbb{R}^n$, the **Householder reflector** across the hyperplane $v^\perp = \{x \in \mathbb{R}^n : v^\top x = 0\}$ is the orthogonal, symmetric matrix:

$$H_v = I - 2 \frac{v v^\top}{v^\top v}, \qquad H_v^\top = H_v, \qquad H_v^2 = I$$

Householder reflections achieve backward-stable $A = QR$ factorization without suffering from the loss of orthogonality seen in classical Gram–Schmidt:

```python
import numpy as np

def householder_qr(A: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Compute thin QR factorization via Householder reflections."""
    m, n = A.shape
    Q = np.eye(m)
    R = A.astype(float).copy()
    for k in range(min(m - 1, n)):
        x = R[k:, k]
        e1 = np.zeros_like(x)
        e1[0] = 1.0
        sign = 1.0 if x[0] >= 0 else -1.0
        v = x + sign * np.linalg.norm(x) * e1
        v = v / np.linalg.norm(v)
        R[k:, k:] -= 2.0 * np.outer(v, v @ R[k:, k:])
        Q[:, k:] -= 2.0 * np.outer(Q[:, k:] @ v, v)
    return Q, R

A = np.array([[12.0, -51.0, 4.0], [6.0, 167.0, -68.0], [-4.0, 24.0, -41.0]])
Q, R = householder_qr(A)
print("Reconstruction error ||A - QR||_F:", f"{np.linalg.norm(A - Q @ R):.2e}")
print("Orthogonality error ||Q^T Q - I||_F:", f"{np.linalg.norm(Q.T @ Q - np.eye(3)):.2e}")
```
