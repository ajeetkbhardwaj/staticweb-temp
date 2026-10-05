+++
title = 'Spectral Graph Theory, Cheeger Inequality & Laplacian Eigenvalues'
date = '2026-10-02'
domain = 'Applied Mathematics'
author = 'Math Code Center Research'
description = 'Connecting the algebraic connectivity eigenvalue of the graph Laplacian to optimal network partitioning and spectral clustering.'
+++

Given an undirected weighted graph $G = (V, E, w)$ with $|V| = n$, its **combinatorial graph Laplacian** is the symmetric positive semidefinite matrix $L \in \mathbb{R}^{n \times n}$ defined by:

$$L = D - A, \qquad \text{where } D_{ii} = \sum_{j=1}^{n} A_{ij}$$

For any real vector $x \in \mathbb{R}^n$ assigned to the vertices of $G$, the quadratic form of $L$ measures the total squared variation across edges:

$$x^\top L x = \frac{1}{2} \sum_{i=1}^{n}\sum_{j=1}^{n} w_{ij}(x_i - x_j)^2 = \sum_{\{i,j\} \in E} w_{ij}(x_i - x_j)^2 \ge 0$$

## The Fiedler Value and Cheeger's Inequality

Ordering the eigenvalues of $L$ as $0 = \lambda_1 \le \lambda_2 \le \dots \le \lambda_n$, the second smallest eigenvalue $\lambda_2(L)$ is the **algebraic connectivity** (or Fiedler value) of $G$. By the Courant–Fischer min-max theorem:

$$\lambda_2(L) = \min_{\substack{x \neq 0 \\ \langle x, \mathbf{1} \rangle = 0}} \frac{x^\top L x}{x^\top x}$$

If $h(G)$ denotes the **Cheeger constant** (isoperimetric number) of a $d$-regular graph $G$, Cheeger's inequality bounds the combinatorial bottleneck using the spectral gap:

$$\frac{\lambda_2}{2} \le h(G) \le \sqrt{2 d \lambda_2}$$

## Computing the Fiedler Vector in Python

Below is a self-contained implementation computing the normalized Laplacian $L_{\text{sym}} = I - D^{-1/2} A D^{-1/2}$, its Fiedler eigenvalue $\lambda_2$, and the resulting spectral bisection:

```python
import numpy as np

def spectral_bisection(adjacency: np.ndarray):
    """Compute the Fiedler value and spectral partition of an undirected graph."""
    degrees = np.sum(adjacency, axis=1)
    laplacian = np.diag(degrees) - adjacency
    eigvals, eigvecs = np.linalg.eigh(laplacian)

    fiedler_val = eigvals[1]
    fiedler_vec = eigvecs[:, 1]
    partition_a = np.where(fiedler_vec >= 0.0)[0]
    partition_b = np.where(fiedler_vec < 0.0)[0]
    return fiedler_val, fiedler_vec, (partition_a, partition_b)

if __name__ == "__main__":
    # Barbell-like two-cluster graph on 6 vertices connected by a weak bridge
    A = np.array([
        [0, 1, 1, 0, 0, 0],
        [1, 0, 1, 0, 0, 0],
        [1, 1, 0, 0.2, 0, 0],
        [0, 0, 0.2, 0, 1, 1],
        [0, 0, 0, 1, 0, 1],
        [0, 0, 0, 1, 1, 0],
    ], dtype=float)
    lam2, v2, (S, Sc) = spectral_bisection(A)
    print(f"Fiedler eigenvalue lambda_2 = {lam2:.4f}")
    print(f"Cluster S = {S.tolist()}, Complement = {Sc.tolist()}")
```

Because $L$ is real symmetric, `np.linalg.eigh` uses tridiagonal reduction followed by the symmetric QR/divide-and-conquer algorithm, guaranteeing orthogonal eigenvectors and real eigenvalues to machine precision.
