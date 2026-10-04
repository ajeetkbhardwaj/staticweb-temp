+++
date = '2026-07-06T13:10:00+05:30'
draft = true
title = 'Arithmetic Operators'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 3
weight = 1
initial_code = '''#include <stdio.h>

int main(void) {
    int a = 15, b = 4;
    int sum = a + b;
    int diff = a - b;
    int prod = a * b;
    int quot = a / b;
    int rem = a % b;

    // Print all results
    // Try with negative values too

    return 0;
}
'''

[[test_cases]]
input = ''
expected = '15 + 4 = 19, 15 - 4 = 11, 15 * 4 = 60, 15 / 4 = 3, 15 %% 4 = 3'
+++

## Problem Statement

Write a program that uses the five basic arithmetic operators (`+`, `-`, `*`, `/`, `%`) on integer operands. Print each result and observe how integer division truncates toward zero. Also test with negative operands to see the behavior of `%`.

## Theory and Concepts

- `+`, `-`, `*`, `/`, `%` are binary arithmetic operators.
- Integer division truncates toward zero (C99 and later).
- `%` (modulo) requires integer operands; the result has the sign of the dividend.
- Operator precedence: `*`, `/`, `%` bind tighter than `+`, `-`.
- `float` and `double` support `+`, `-`, `*`, `/` but not `%`.

## Real World Application

Arithmetic operators are fundamental to all computation — calculating distances, scaling sensor values, computing averages, implementing digital signal processing filters, and financial calculations. Understanding integer division and modulo is critical for correct rounding behavior.

===EXPLANATION===

Arithmetic operators in C trace their semantics directly to the PDP-11 machine instructions that Ritchie mapped onto the language in the early 1970s. The `+`, `-`, `*` operators were straightforward, but division and modulo have a nuanced history. Before C99, the behavior of integer division with negative operands was implementation-defined — some platforms truncated toward zero, others toward negative infinity (Fortran-style). C99 standardized truncation toward zero: `-15 / 4` is `-3`, not `-4` [1]. The modulo operator `%` follows the same rule: `a % b` has the sign of `a`, so `-15 % 4` = `-3` (because `-15 = (-3)*4 + (-3)`).

The intuition: integer division in C always produces an integer result, discarding the fractional part (truncation toward zero). This is different from real division: `15 / 4` is `3`, not `3.75`. When both operands are integers, C performs integer division. If either operand is floating-point, C performs floating-point division. The modulo operator `%` gives the remainder of integer division: `15 % 4 = 3` because `15 = 3*4 + 3`. For negative values, remember `(a/b)*b + a%b == a` always holds.

Real open-source code uses these operators constantly. The Linux kernel uses the modulo operator for hashing: `hash % table_size` distributes entries across buckets [2]. Git uses integer division for progress reporting and chunking: `(progress->total / 100)` to compute percentage points [3]. The CPython virtual machine uses `%` extensively in its bytecode interpreter to decode instruction operands: `oparg & 0xFF` for argument extraction.

```c {title="lib/progress.c (Git)", note="Git uses integer division for percentage computation"}
void display_progress(struct progress *progress, unsigned n)
{
    int percent = n * 100 / progress->total;
    /* ... */
}
```

A visualization: picture dividing 7 apples among 3 people. Integer division says each person gets 2 apples (the quotient), and there is 1 apple left over (the remainder). Now picture dividing -7 apples among 3 people: C says each person gets -2 apples (truncation toward zero), and there is -1 left over (the remainder has the sign of the dividend).

Key points:
1. Integer division truncates toward zero (C99 and later).
2. `%` requires integer operands; the result has the sign of the dividend.
3. Division by zero is undefined behavior — always check the divisor.
4. `(a/b)*b + a%b == a` is guaranteed for all `b != 0`.
5. Use `div()` and `ldiv()` from `<stdlib.h>` for getting quotient and remainder in one call.

References:
1. ISO/IEC 9899:1999 (C99), §6.5.5 — Multiplicative operators (truncation toward zero)

2. Linux kernel `include/linux/hash.h` — `hash_long` and `hash_ptr` use modulo.
3. Git source: `progress.c` — integer division for percentage.
4. Kernighan, B. & Ritchie, D. *The C Programming Language*, 2nd ed., §2.5 — Arithmetic Operators.
