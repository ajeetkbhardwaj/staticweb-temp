+++
date = '2026-07-06T13:14:00+05:30'
draft = true
title = 'Conditional (Ternary) Operator'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 3
weight = 5
initial_code = '''#include <stdio.h>

int main(void) {
    int score = 75;
    const char *grade = (score >= 60) ? "Pass" : "Fail";

    // Print grade
    // Use nested ternary for A/B/C/F grades

    int a = 10, b = 20;
    int max = (a > b) ? a : b;

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Grade: Pass, Max: 20'
+++

## Problem Statement

Use the conditional operator (`?:`) to assign a value based on a condition. First determine pass/fail based on a score threshold. Then extend to multiple grades using nested ternary expressions (or combine with if-else for readability).

## Theory and Concepts

- `condition ? value_if_true : value_if_false` evaluates to one of two expressions.
- The conditional operator is the only ternary operator in C.
- Both `value_if_true` and `value_if_false` must have compatible types.
- Ternary expressions can be nested, but deep nesting harms readability.
- The conditional operator can be used in places where `if-else` cannot, such as inside `printf` arguments or `return` statements.

## Real World Application

The ternary operator is used for concise conditional assignments — clamping values to ranges, selecting between two configurations, handling null-pointer defaults, and inline condition checks in return statements.

===EXPLANATION===

The conditional operator `?:` is C's only ternary operator and has been part of the language since K&R C. It was inspired by the conditional expression in ALGOL 60 (`if ... then ... else ...`) and BCPL's `valof` construct, but C's version is distinct because it's an expression, not a statement — meaning it produces a value and can be used anywhere an expression is allowed [1]. This makes it more flexible than an `if-else` statement, which cannot appear inside a `printf` argument, a `return` statement, or an initializer.

The intuition: `condition ? true_value : false_value` reads as "is the condition true? if so, the whole expression equals the first value; otherwise, it equals the second value." Both branches must have compatible types because the entire expression evaluates to a single type. The type compatibility rules are subtle — if one branch is `int` and the other is `double`, the `int` is promoted to `double`. If one is `char *` and the other is `void *`, the result is `void *`. The key advantage over `if-else` is that `?:` can be nested inside expressions, but deep nesting quickly destroys readability.

Real code uses `?:` judiciously. The Linux kernel uses it for configuration selection: `#define readl(addr) (*(volatile u32 *)(addr))` with conditional expressions to support different architecture endianness [2]. The Redis source uses `?:` in return statements for concise configuration: `return server.maxmemory ? server.maxmemory / 10 : 0` [3]. The SQLite engine uses it for null-pointer defaults: `zDbName = zDbName ? zDbName : "main"` [4].

```c {title="src/db.c (Redis)", note="Redis uses ternary for default config values"}
size_t getMaxmemoryDefault(void) {
    return server.maxmemory ? server.maxmemory : SIZE_MAX;
}
```

Visualize `?:` as a fork in a road with a signpost. The condition is the signpost — if true, you take the left path (first expression); if false, you take the right path (second expression). The entire fork converges again, and the value you carry out is whichever value was on the path you took. Unlike `if-else` (a detour that must return to the main road via a statement), `?:` is the main road itself.

Key points:
1. `?:` is an expression, not a statement — it produces a value.
2. The two branches must have compatible types.
3. The ternary operator is right-associative: `a ? b : c ? d : e` parses as `a ? b : (c ? d : e)`.
4. For complex conditions or side effects, prefer `if-else` for readability.
5. `?:` cannot replace `if-else` when branches are statements (e.g., multiple lines or no return value).

References:
1. Kernighan, B. & Ritchie, D. *The C Programming Language*, 2nd ed., §2.11 — Conditional Expressions

2. Linux kernel `include/asm-generic/io.h` — conditional expression for endian-aware I/O accessors.
3. Redis source: `src/server.h` and `src/db.c` — default configuration via ternary.
4. ISO/IEC 9899:2011 (C11), §6.5.15 — Conditional operator.
