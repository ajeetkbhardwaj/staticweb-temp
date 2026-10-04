+++
date = '2026-07-06T13:05:00+05:30'
draft = true
title = 'Integer and Floating Constants'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 2
weight = 1
initial_code = '''#include <stdio.h>

int main(void) {
    int decimal = 42;
    int octal = 052;
    int hex = 0x2A;
    float f = 3.14f;
    double d = 2.71828;
    double sci = 1.5e-4;

    // Print all constants with their types

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Various constant formats printed'
+++

## Problem Statement

Write a program that declares and prints integer constants in decimal, octal, and hexadecimal, and floating-point constants in decimal and scientific notation. Print their values and observe the output format differences.

## Theory and Concepts

- Integer constants: decimal (`42`), octal (`052` — leading zero), hexadecimal (`0x2A`).
- A `U` or `L` suffix changes the type (e.g., `42U`, `100000L`, `123ULL`).
- Floating constants: `3.14` (double), `3.14f` (float), `3.14L` (long double).
- Scientific notation: `1.5e-4` means 1.5 × 10⁻⁴ = 0.00015.
- `%d` for decimal, `%o` for octal, `%x` for hex, `%f` for float, `%e` for scientific.

## Real World Application

Understanding constant syntax is needed when reading/writing hardware registers (hex addresses), setting configuration values with specific types (suffixes prevent compiler warnings), and working with scientific constants (Avogadro's number, Planck constant).

===EXPLANATION===

C's constant syntax is one of the oldest parts of the language, inherited directly from K&R C (1978). The octal prefix `0` comes from early Unix assemblers used on the PDP-7 and PDP-11, where octal was natural because each octal digit represents exactly three bits [1]. The hexadecimal prefix `0x` was introduced by Ritchie himself, borrowing the `0x` convention from the BCPL language. The suffixes `U` (unsigned), `L` (long), `LL` (long long), `F` (float), and `L` (long double for floating) give the programmer explicit control over the constant's type — critical when the default type might cause overflow or precision loss.

The intuition: a constant like `42` has both a value and a type. `42` is an `int`. `42U` is `unsigned int`. `42L` is `long`. `42ULL` is `unsigned long long`. For floating-point, `3.14` is `double`, `3.14f` is `float`, `3.14L` is `long double`. The C standard defines a hierarchy of types that the compiler tries when selecting a constant's type, preferring the smallest type that can represent the value. A leading `0` makes it octal (`052` = 42 decimal), and `0x` or `0X` makes it hexadecimal (`0x2A` = 42 decimal). Since C99, binary constants like `0b1010` are supported — though this was a late addition, already present in GCC since the early 2000s and standardized in C23.

Real code relies on getting constant types right. The Linux kernel uses `UL` suffixes for hardware register masks to ensure 64-bit width on all architectures — a missing suffix can cause sign-extension bugs when shifting [2]. The SQLite engine uses `L` suffixes for large magic numbers in its B-tree implementation [3]. The WebKit JavaScript engine uses `U` suffixes for bitfield constants to avoid signed integer overflow, which is undefined behavior [4].

```c {title="include/linux/bitops.h (Linux kernel)", note="UL suffix ensures correct width on 32-bit and 64-bit"}
#define BIT(nr)         (1UL << (nr))
#define BIT_ULL(nr)     (1ULL << (nr))
```

A mental model: think of the constant's literal form as a label on a box. The digits tell you what's inside the box, the prefix tells you how to read the label (decimal, octal, hex), and the suffix tells you the box's size and whether it can hold signed values. The compiler uses the label and box to pack the value correctly, and if the box is too small, it prints a warning.

Key points:
1. Octal `052` = decimal 42; hex `0x2A` = decimal 42 — choose the notation that matches the context.
2. Default types: integer constants are `int`; floating constants are `double`.
3. Use suffixes explicitly when the type matters (hardware registers, large values, arithmetic with mixed types).
4. `1 << 31` overflows a 32-bit `int` — use `1U << 31` or `1UL << 31`.
5. C23 officially supports `0b` binary literals; GCC/Clang have supported them for decades.

References:
1. Ritchie, D. "The Development of the C Language." *HOPL II*, 1993 — describes the origin of `0x` and `0` prefixes

2. Linux kernel `include/linux/bitops.h` — bit manipulation macros with explicit type suffixes.
3. ISO/IEC 9899:2024 (C23), §6.4.4.1 — Integer constants and binary literals.
4. Kernighan, B. & Ritchie, D. *The C Programming Language*, 2nd ed., §2.3 — Constants.
