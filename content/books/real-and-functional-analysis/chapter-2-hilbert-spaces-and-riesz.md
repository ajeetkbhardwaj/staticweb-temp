+++
title = 'Chapter 2: Hilbert Spaces, Riesz Representation & Lax-Milgram'
chapter = 2
weight = 2
date = '2026-10-04'
description = 'Orthogonal decomposition in infinite dimensions, the Riesz Representation Theorem, and Galerkin finite element projections.'
+++

## 2.1 The Riesz Representation Theorem

Let $\mathcal{H}$ be a real Hilbert space with inner product $\langle \cdot, \cdot \rangle_{\mathcal{H}}$ and induced norm $\|u\|_{\mathcal{H}} = \sqrt{\langle u, u \rangle_{\mathcal{H}}}$. For every bounded linear functional $\ell \in \mathcal{H}^*$ (where $\|\ell\|_{\mathcal{H}^*} = \sup_{\|v\|_{\mathcal{H}}=1} |\ell(v)| < \infty$), there exists a unique $u_\ell \in \mathcal{H}$ such that:

$$\ell(v) = \langle u_\ell, v \rangle_{\mathcal{H}} \quad \forall v \in \mathcal{H}, \qquad \|u_\ell\|_{\mathcal{H}} = \|\ell\|_{\mathcal{H}^*}$$

## 2.2 Céa's Lemma and Galerkin Orthogonality

Given a coercive, continuous bilinear form $a : \mathcal{H} \times \mathcal{H} \to \mathbb{R}$ satisfying:

$$\alpha \|v\|_{\mathcal{H}}^2 \le a(v, v), \qquad |a(u, v)| \le M \|u\|_{\mathcal{H}} \|v\|_{\mathcal{H}}$$

and a finite-dimensional subspace $V_h \subset \mathcal{H}$, the Galerkin approximation $u_h \in V_h$ solving $a(u_h, v_h) = \ell(v_h)$ for all $v_h \in V_h$ obeys **Galerkin orthogonality** $a(u - u_h, v_h) = 0$ and **Céa's quasi-optimality bound**:

$$\|u - u_h\|_{\mathcal{H}} \le \frac{M}{\alpha} \inf_{v_h \in V_h} \|u - v_h\|_{\mathcal{H}}$$

```python
import numpy as np

# 1D Finite Element Galerkin projection for -u''(x) = pi^2 sin(pi x) on (0, 1)
N = 32
h = 1.0 / (N + 1)
x = np.linspace(h, 1.0 - h, N)

# Stiffness matrix A_ij = \int_0^1 phi_i'(x) phi_j'(x) dx
A = (2.0 / h) * np.eye(N) - (1.0 / h) * np.eye(N, k=1) - (1.0 / h) * np.eye(N, k=-1)
rhs = h * (np.pi ** 2) * np.sin(np.pi * x)
u_h = np.linalg.solve(A, rhs)
u_exact = np.sin(np.pi * x)
print(f"Galerkin L_inf nodal error (N={N}): {np.max(np.abs(u_h - u_exact)):.3e}")
```
