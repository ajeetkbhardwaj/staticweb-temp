+++
date = '2026-07-06T13:01:00+05:30'
draft = true
title = 'Floating-point Types in C'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 1
weight = 2
initial_code = '''#include <stdio.h>

int main(void) {
    float f = 3.14f;
    double d = 3.141592653589793;
    long double ld = 3.141592653589793238L;

    // Print each with sufficient precision

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Precision differences demonstrated'
+++

## Problem Statement

Declare variables of type `float`, `double`, and `long double`. Assign the same mathematical constant (like π) to each and print them with enough decimal places to see the precision differences.

## Theory and Concepts

- `float` is typically 32-bit (≈7 decimal digits of precision).
- `double` is typically 64-bit (≈15 decimal digits).
- `long double` is platform-dependent (80-bit on x86, 128-bit on some).
- Use `%f`, `%lf`, and `%Lf` format specifiers respectively.
- Floating-point arithmetic is approximate — never compare floats with `==` directly.

## Real World Application

Choosing the right floating-point type matters in scientific computing, graphics (GPUs use float), financial calculations (use double), and simulation. Using `float` when you need `double` precision leads to accumulating rounding errors.

===EXPLANATION===

The story of floating-point in C begins with William Kahan, who led the IEEE 754 standardization effort in the late 1970s and 80s. Before IEEE 754, every hardware vendor used a different floating-point representation — IBM had hex floats, DEC had its own format, and Cray used a completely different approach. This made portable numerical computing nearly impossible. The IEEE 754 standard (1985) unified floating-point arithmetic across platforms, and C adopted it. Today, every major CPU implements IEEE 754 in hardware, with `float` (binary32) and `double` (binary64) as the standard types. The `long double` type is a C extension, typically 80-bit extended precision on x86 (the original 8087 FPU format).

The key intuition: floating-point numbers store a fixed number of significant digits (the mantissa) and an exponent, like scientific notation in base 2. A `float` has 23 mantissa bits (~7 decimal digits), a `double` has 52 bits (~15 decimal digits). This means you can represent very large or very small numbers, but with limited precision. The spacing between consecutive representable floats grows as the numbers get larger — at 1.0, the gap between two successive `float` values is about 1.2e-7; at 1e10, the gap is about 1024. This is why financial calculations using `float` silently lose pennies on large transactions.

Professionals must be vigilant. The CPython source uses `double` for all internal numeric operations — even simple functions like `math.sqrt()` operate in double precision to minimize rounding accumulation [1]. The SQLite database engine stores floating-point values as 64-bit IEEE 754 doubles, and its query planner explicitly handles NaN comparisons, since NaN is defined as not equal to itself [2]. In the Linux kernel, floating-point is avoided entirely in kernel space (no FPU state save/restore), but userspace drivers use `double` for sensor fusion calculations [3].

```c {title="Objects/floatobject.c (CPython)", note="CPython uses double for all float objects"}
typedef struct {
    PyObject_HEAD
    double ob_fval;
} PyFloatObject;
```

A useful mental model: imagine a number line with a fixed set of tick marks. Between 1.0 and 2.0, there are about 8.4 million ticks for `float` and 2^52 ticks for `double`. As you move right, the ticks spread farther apart. The tick marks are not uniform — they're densest near zero. This is why subtracting two nearly-equal large numbers loses all precision (catastrophic cancellation).

Key points:
1. Never compare floats with `==` — use an epsilon tolerance like `fabs(a - b) < 1e-9`.
2. `float` gives ~7 digits, `double` gives ~15 digits, `long double` gives ~18+ digits.
3. Mathematical operations are not associative in floating-point — `(a+b)+c ≠ a+(b+c)`.
4. Print enough digits: use `%.15g` for `double` to see the true value.
5. Enable `-Wfloat-equal` to catch equality comparisons at compile time.

References:
1. Goldberg, D. "What Every Computer Scientist Should Know About Floating-Point Arithmetic." *ACM Computing Surveys*, 1991

2. IEEE 754-2019 — Standard for Floating-Point Arithmetic.
3. Kahan, W. "Lecture Notes on the Status of IEEE 754." UC Berkeley, 1997.
4. CPython source: `Objects/floatobject.c` and `Include/floatobject.h`.
