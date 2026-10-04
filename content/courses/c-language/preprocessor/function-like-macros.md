+++
date = '2026-07-06T13:40:00+05:30'
draft = true
title = 'Function-like Macros'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 9
weight = 2
initial_code = '''#include <stdio.h>

#define SQUARE(x) ((x) * (x))
#define MAX(a, b) ((a) > (b) ? (a) : (b))
#define MIN(a, b) ((a) < (b) ? (a) : (b))

int main(void) {
    int a = 5, b = 8;

    printf("SQUARE(%d) = %d\n", a, SQUARE(a));
    printf("MAX(%d, %d) = %d\n", a, b, MAX(a, b));
    printf("MIN(%d, %d) = %d\n", a, b, MIN(a, b));

    // Demonstrate the risk: SQUARE(a + 1) without parentheses
    printf("SQUARE(%d + %d) = %d\n", a, 1, SQUARE(a + 1));

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'SQUARE(5) = 25, MAX(5, 8) = 8, SQUARE(5 + 1) = 36'
+++

## Problem Statement

Define function-like macros for `SQUARE`, `MAX`, and `MIN`. Use them with simple values and with expressions like `a + 1`. Explain why the extra parentheses around parameters and the entire body are necessary to avoid operator precedence bugs.

## Theory and Concepts

- Function-like macros take arguments: `#define NAME(params) replacement`.
- Each parameter is textually substituted — `SQUARE(a+1)` expands to `((a+1)*(a+1))`.
- Without parentheses, `SQUARE(a+1)` would expand to `(a+1*a+1)` = `a + a + 1`.
- Multiple evaluations: `MAX(x++, y++)` increments the winning argument twice.
- Unlike functions, macros don't have type checking and can cause side-effect issues.

## Real World Application

Function-like macros are used for performance-critical inline operations (avoiding function call overhead) and for generic-like patterns in C (e.g., type-generic max/min, container_of, offset_of). Modern C prefers inline functions for type safety.

===EXPLANATION===

Function-like macros were C's original answer to performance-critical code before inline functions existed. In the 1970s and 1980s, function call overhead was significant — pushing registers, setting up a stack frame, jumping, returning. For small, frequently used operations like max, min, or absolute value, the cost of the call could dwarf the actual computation. Programmers reached for macros: text substitution that happens before compilation, with zero runtime overhead. The cost, however, was measured in debugging time and subtle bugs. Every parenthesized parameter and every wrapped expression was a battle against operator precedence.

Think of a function-like macro as a rubber stamp. You hand the stamp some tokens (arguments), and it stamps a pre-written pattern into your source code, replacing the blanks with your tokens. The stamp is dumb — it doesn't evaluate or type-check; it just inserts text. When you write `MAX(a + b, c + d)`, the stamp produces `((a + b) > (c + d) ? (a + b) : (c + d))`. But if you wrote `MAX(a, b) + c` without outer parentheses, the stamp would produce `(a) > (b) ? (a) : (b) + c` — a completely different meaning due to `?:` operator precedence. This is why experienced C programmers wrap every macro parameter and the entire body in parentheses.

In professional C code, function-like macros walk a tightrope between power and danger. The Linux kernel uses them extensively: `#define min(x, y) ({...})` and the famous `container_of(ptr, type, member)` macro. The SQLite source uses macros for error checking: `#define rc (sqlite3_step(stmt))`. Embedded firmware uses them for register manipulation: `#define SET_BIT(reg, bit) ((reg) |= (1 << (bit)))`. However, the trend in modern C is to prefer `static inline` functions, which provide type safety, single evaluation of arguments, and debuggability — all with the same zero overhead. Compilers have evolved; the function call overhead that motivated macros in 1985 is negligible today.

Visually, imagine a printing press with dies. A function is a custom die — slow to set up (call overhead) but produces precise, type-checked output. A function-like macro is a stencil — instant to apply (no overhead) but crude: it can produce jagged edges (precedence bugs) or duplicate ink (multiple evaluation of arguments). `MAX(x++, y)` with a macro evaluates `x++` twice; with a function, it evaluates it once. The stencil doesn't know it's duplicating ink; the die follows a precise blueprint.

Key points: Function-like macros take arguments: `#define NAME(params) replacement`. Each parameter is textually substituted — not evaluated, not type-checked. Parenthesize every parameter (`(x)`) and the entire body (`((x)*(y))`) to avoid precedence bugs. Macros evaluate arguments multiple times — avoid side effects in macro arguments. Macros have no namespace — they can clash with other macros, functions, or keywords. For type-generic code in C11, use `_Generic` instead of macros. Prefer `static inline` functions for anything where type safety matters.

For further exploration: GCC CPP manual (section on macro pitfalls), "The C Puzzle Book" by Alan Feuer (macro bugs), and CERT C PRE00-C (prefer inline functions to function-like macros).
