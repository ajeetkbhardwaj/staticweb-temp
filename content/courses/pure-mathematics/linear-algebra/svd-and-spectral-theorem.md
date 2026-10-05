+++
date = '2026-10-04'
title = 'The Spectral Theorem & Singular Value Decomposition'
difficulty = 'hard'
language = 'python'
topic_weight = 2
subtopic_weight = 2
weight = 2
description = 'Unitary diagonalization of Hermitian operators, Singular Value Decomposition, and Eckart–Young low-rank approximation.'
+++

## Problem Statement

For any real matrix $A \in \mathbb{R}^{m \times n}$, its **Singular Value Decomposition (SVD)** factors $A$ into orthogonal matrices $U \in \mathbb{R}^{m \times m}$ and $V \in \mathbb{R}^{n \times n}$ and a diagonal matrix $\Sigma$ of non-negative singular values $\sigma_1 \ge \sigma_2 \ge \dots \ge \sigma_r > 0$:

$$A = U \Sigma V^\top = \sum_{i=1}^{r} \sigma_i u_i v_i^\top$$

By the **Eckart–Young–Mirsky Theorem**, the best rank-$k$ approximation $A_k$ to $A$ in both the operator 2-norm and the Frobenius norm is obtained by truncating the sum at $k \le r$:

$$\min_{\operatorname{rank}(B) \le k} \|A - B\|_F = \|A - A_k\|_F = \sqrt{\sum_{i=k+1}^{r} \sigma_i^2}$$

```python
import numpy as np

def truncated_svd_approx(A: np.ndarray, k: int):
    U, s, Vt = np.linalg.svd(A, full_matrices=False)
    Ak = (U[:, :k] * s[:k]) @ Vt[:k, :]
    frobenius_err = np.sqrt(np.sum(s[k:] ** 2))
    return Ak, frobenius_err
```

===EXPLANATION===

## From the Spectral Theorem to SVD

Let $A \in \mathbb{R}^{m \times n}$. Even when $A$ is rectangular and non-symmetric, its Gram matrix $G = A^\top A \in \mathbb{R}^{n \times n}$ is symmetric and positive semidefinite:

$$\langle x, A^\top A x \rangle = \|Ax\|_2^2 \ge 0 \qquad \forall x \in \mathbb{R}^n$$

By the **Real Spectral Theorem**, there exists an orthonormal basis of eigenvectors $v_1, \dots, v_n \in \mathbb{R}^n$ of $A^\top A$ with real eigenvalues $\lambda_1 \ge \lambda_2 \ge \dots \ge \lambda_n \ge 0$. Defining $\sigma_i = \sqrt{\lambda_i}$ and setting

$$u_i = \frac{1}{\sigma_i} A v_i \qquad \text{for } \sigma_i > 0$$

yields an orthonormal set in $\mathbb{R}^m$ since:

$$\langle u_i, u_j \rangle = \frac{1}{\sigma_i \sigma_j} v_i^\top A^\top A v_j = \frac{\lambda_j}{\sigma_i \sigma_j} v_i^\top v_j = \delta_{ij}$$

===READING===

## Power Iteration with Orthogonal Deflation

To compute the dominant singular triple $(\sigma_1, u_1, v_1)$ of a large sparse matrix without forming $A^\top A$ explicitly, we apply alternating power iteration on $v_{k+1} = \frac{A^\top (A v_k)}{\|A^\top (A v_k)\|_2}$:

```python
import numpy as np

def dominant_singular_triple(A: np.ndarray, tol: float = 1e-10, max_iter: int = 500):
    m, n = A.shape
    v = np.ones(n, dtype=float)
    v /= np.linalg.norm(v)
    sigma = 0.0
    for _ in range(max_iter):
        av = A @ v
        sigma_new = np.linalg.norm(av)
        if sigma_new == 0:
            break
        u = av / sigma_new
        v_new = A.T @ u
        v_new /= np.linalg.norm(v_new)
        if abs(sigma_new - sigma) < tol:
            return sigma_new, u, v_new
        sigma, v = sigma_new, v_new
    return sigma, A @ v / max(sigma, 1e-15), v
```

===CODE===

```python
import numpy as np

def truncated_svd_approx(A: np.ndarray, k: int):
    U, s, Vt = np.linalg.svd(A, full_matrices=False)
    Ak = (U[:, :k] * s[:k]) @ Vt[:k, :]
    frobenius_err = np.sqrt(np.sum(s[k:] ** 2))
    return Ak, frobenius_err
```

===QUIZ===

## According to the Eckart–Young–Mirsky theorem, what is the spectral 2-norm error $\|A - A_k\|_2$ of the optimal rank-$k$ approximation $A_k$?
- [ ] $\sum_{i=k+1}^r \sigma_i$
- [x] $\sigma_{k+1}$
- [ ] $\sqrt{\sigma_{k+1}}$
- [ ] $\sigma_1 - \sigma_k$
Correct: B
Explanation: In the operator 2-norm, $\|A - A_k\|_2 = \|\sum_{i=k+1}^r \sigma_i u_i v_i^\top\|_2 = \sigma_{k+1}$, the largest omitted singular value.

## How are the non-zero singular values $\sigma_i(A)$ of a real matrix $A$ related to the eigenvalues of $A^\top A$?
- [ ] $\sigma_i(A) = \lambda_i(A^\top A)^2$
- [x] $\sigma_i(A) = \sqrt{\lambda_i(A^\top A)}$
- [ ] $\sigma_i(A) = \lambda_i(A + A^\top)$
- [ ] $\sigma_i(A) = |\det(A^\top A)|$
Correct: B
Explanation: Since $A^\top A = V \Sigma^\top \Sigma V^\top$, the eigenvalues of $A^\top A$ are $\sigma_i^2$, so $\sigma_i(A) = \sqrt{\lambda_i(A^\top A)}$.
