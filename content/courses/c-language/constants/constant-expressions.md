+++
date = '2026-07-06T13:09:00+05:30'
draft = true
title = 'Constant Expressions'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 2
weight = 5
initial_code = '''#include <stdio.h>

#define HOURS_PER_DAY 24
#define MINUTES_PER_HOUR 60

int main(void) {
    int minutes_per_day = HOURS_PER_DAY * MINUTES_PER_HOUR;
    int seconds_per_day = minutes_per_day * 60;

    // Print computed constants
    // Try a constant expression in a case label

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Minutes per day: 1440, Seconds per day: 86400'
+++

## Problem Statement

Create constant expressions using `#define` and compile-time evaluable arithmetic. Compute minutes per day and seconds per day from basic constants. Show that constant expressions can be used in contexts like array sizes and `case` labels.

## Theory and Concepts

- A constant expression is evaluated at compile time.
- Integer constant expressions can involve literals, `enum` constants, and `sizeof`.
- Constant expressions are required for array sizes (in C89), `case` labels, and bit-field widths.
- `#define` values can be combined arithmetically in constant expressions.

## Real World Application

Constant expressions are used for compile-time configuration (computing timer reload values, baud rate divisors, CRC polynomials), array dimensions, and lookup tables that are computed at compile time rather than runtime.

===EXPLANATION===

The concept of a "constant expression" — an expression whose value is known at compile time — has been part of C since K&R. The C standard defines constant expressions precisely: they must contain only literals, enum constants, `sizeof` results, and `_Alignof` results, combined with arithmetic, logical, or relational operators [1]. This guarantees the compiler can evaluate them without runtime overhead. The C99 standard broadened constant expressions to include `static const` integers in some contexts, but the core concept remains the same: the value must be determinable at compilation time.

The intuition: when you write `#define SECONDS_PER_DAY (24 * 60 * 60)`, the compiler computes `86400` at compile time — there is no runtime multiplication. This works because all operands are integer literals. You can use such expressions for array sizes (`int buffer[SECONDS_PER_DAY]`), `case` labels in switch statements, bit-field widths, and initializers for static/global variables. The key requirement is that every subexpression must also be a constant expression — function calls, variable accesses, and pointer dereferences are not allowed.

Real code relies on this for performance. The SQLite engine uses constant expressions to precompute hash table sizes and sort-merge thresholds — `#define SORTMERGE_MIN (SORTMERGE_MAINSZ / SORTMERGE_LOCAL_SZ)` [2]. The Linux kernel uses constant expressions for compile-time array sizing and static assertions: `BUILD_BUG_ON_ZERO` evaluates to 0 when the condition is false and causes a compile error when true [3]. The OpenSSL library computes CRC32 lookup tables at compile time using constant expressions.

```c {title="include/linux/build_bug.h (Linux kernel)", note="BUILD_BUG_ON_ZERO evaluates at compile time"}
#define BUILD_BUG_ON_ZERO(e) ((int)(sizeof(struct { int:(-!!(e)); })))
```

A visualization: think of constant expressions as arithmetic you do on paper before starting to build. When the C standard says a constant expression is evaluated at compile time, it means the compiler does the math in its head (during compilation) and hardcodes the result into the binary. No ALU cycles, no registers needed at runtime — the answer is literally etched into the machine code as an immediate operand.

Key points:
1. Constant expressions contain only literals, enum constants, sizeof, and operators.
2. They are required for array sizes (in C89/C99), `case` labels, and bit-field widths.
3. `#define` macros composed of literals yield constant expressions; function call results do not.
4. C99's `static const int` is not a constant expression in pre-C99 contexts (like array sizes in C89 mode).
5. Use `enum` to create named constant expressions that are type-safe and debugger-friendly.

References:
1. ISO/IEC 9899:2011 (C11), §6.6 — Constant Expressions

2. SQLite source: `src/sort.c` — sort-merge threshold computation via constant expressions.
3. Linux kernel `include/linux/build_bug.h` — compile-time assertion macros.
4. Kernighan, B. & Ritchie, D. *The C Programming Language*, 2nd ed., §2.3 — Constants.
