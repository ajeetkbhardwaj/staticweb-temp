+++
title = 'Forward-Mode Automatic Differentiation via the Algebra of Dual Numbers'
date = '2026-10-01'
domain = 'Algorithms & Code'
author = 'Math Code Center Research'
description = 'Deriving exact machine-precision derivatives without finite-difference truncation error using the commutative ring of dual numbers.'
cover = '/images/article_symplectic_geometry.jpg'
+++

Numerical finite differences approximate $f'(x) \approx \frac{f(x+h)-f(x)}{h}$, suffering from subtractive cancellation as $h \to 0$. **Forward-mode automatic differentiation** eliminates truncation error altogether by lifting real arithmetic into the commutative ring of **dual numbers**:

$$\mathbb{D} = \mathbb{R}[\varepsilon] / (\varepsilon^2) = \{ a + b\varepsilon \mid a, b \in \mathbb{R},\; \varepsilon^2 = 0 \}$$

## Taylor Expansion in $\mathbb{R}[\varepsilon]/(\varepsilon^2)$

For any smooth analytic function $f : \mathbb{R} \to \mathbb{R}$, evaluating $f$ at the dual number $x + 1\cdot\varepsilon$ via its Taylor series yields:

$$f(x + \varepsilon) = f(x) + f'(x)\varepsilon + \frac{f''(x)}{2!}\varepsilon^2 + \cdots = f(x) + f'(x)\varepsilon$$

since $\varepsilon^k = 0$ for all $k \ge 2$. Arithmetic rules follow immediately from $\varepsilon^2 = 0$:

$$\begin{aligned}
(u + u'\varepsilon) + (v + v'\varepsilon) &= (u + v) + (u' + v')\varepsilon \\
(u + u'\varepsilon)(v + v'\varepsilon) &= uv + (u'v + uv')\varepsilon \\
\sin(u + u'\varepsilon) &= \sin(u) + u'\cos(u)\varepsilon
\end{aligned}$$

## Zero-Cost Dual Number Implementation in C++

Using operator overloading in C++20, any generic mathematical template function automatically computes both primal values and exact derivatives simultaneously:

```cpp
#include <cmath>
#include <iostream>

struct Dual {
    double val;
    double der;

    constexpr Dual(double v = 0.0, double d = 0.0) : val(v), der(d) {}

    friend constexpr Dual operator+(Dual a, Dual b) {
        return {a.val + b.val, a.der + b.der};
    }
    friend constexpr Dual operator*(Dual a, Dual b) {
        return {a.val * b.val, a.der * b.val + a.val * b.der};
    }
    friend Dual sin(Dual a) {
        return {std::sin(a.val), a.der * std::cos(a.val)};
    }
    friend Dual exp(Dual a) {
        double e = std::exp(a.val);
        return {e, a.der * e};
    }
};

template <typename T>
T wave_packet(T x) {
    return exp(T(-0.5) * x * x) * sin(T(3.0) * x);
}

int main() {
    Dual x(1.0, 1.0); // Seed dx/dx = 1
    Dual y = wave_packet(x);
    std::cout << "f(1.0)  = " << y.val << "\n";
    std::cout << "f'(1.0) = " << y.der << "\n";
    return 0;
}
```

This algebraic perspective generalizes directly to higher-order **jets** $\mathbb{R}[\varepsilon]/(\varepsilon^{k+1})$ and tangent bundles on differentiable manifolds.
