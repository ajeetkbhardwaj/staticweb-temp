+++
date = '2026-07-06T13:11:00+05:30'
draft = true
title = 'Relational and Logical Operators'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 3
weight = 2
initial_code = '''#include <stdio.h>
#include <stdbool.h>

int main(void) {
    int a = 5, b = 10, c = 5;

    // Relational: == != < > <= >=
    // Logical: && || !
    bool result1 = (a == c) && (b > a);
    bool result2 = (a > b) || (b > c);
    bool result3 = !(a == b);

    // Print each result

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Relational and logical operator results demonstrated'
+++

## Problem Statement

Use relational operators (`==`, `!=`, `<`, `>`, `<=`, `>=`) to compare integers. Combine them with logical operators (`&&`, `||`, `!`) to form compound conditions. Print the boolean results (0 or 1) and verify short-circuit evaluation.

## Theory and Concepts

- Relational operators return 1 (true) or 0 (false).
- `&&` (logical AND) — returns true if both operands are true. Short-circuits: if left is false, right is not evaluated.
- `||` (logical OR) — returns true if either operand is true. Short-circuits: if left is true, right is not evaluated.
- `!` (logical NOT) — inverts the truth value.
- In C, any non-zero value is considered true; zero is false.

## Real World Application

Relational and logical operators are used in every conditional statement — checking sensor thresholds, validating user input, implementing state machines, and controlling program flow based on multiple conditions.

===EXPLANATION===

Relational and logical operators in C behave like their mathematical counterparts but with a distinctive C twist: they produce `int` values (1 for true, 0 for false), not a boolean type. This design reflects C's origins in systems programming, where comparing values was just another integer operation. The operators `==`, `!=`, `<`, `>`, `<=`, `>=` have been in C since the beginning (1972). The logical operators `&&`, `||`, `!` were also present from the start, with short-circuit evaluation — a feature that allows efficient and safe condition checking by evaluating the right operand only when necessary [1].

The intuition: `&&` and `||` are like gates. For `&&`, both conditions must be true for the whole to be true — if the first condition is false, the result is already known (false), so the second is never evaluated. For `||`, if the first condition is true, the result is already known (true), so the second is skipped. This short-circuit behavior is not just an optimization — it's a semantic guarantee used in idiomatic C patterns like `ptr && ptr->value`, where the pointer check protects the dereference. The `!` operator simply flips the truth value: `!0` is 1, `!nonzero` is 0.

Professional C code uses short-circuit evaluation for safety and brevity. The SQLite parser uses `p && p->zToken` to safely traverse token lists [2]. The Redis source uses `!server.sentinel_mode || ...` to short-circuit expensive checks in command dispatch [3]. The Linux kernel uses `if (ptr && ptr->ops && ptr->ops->read)` for hierarchical function dispatch in device drivers [4].

```c {title="src/tokenize.c (SQLite)", note="Short-circuit evaluation protects null pointer dereference"}
while( p && p->zToken && p->zToken[0] ){
    /* process token */
    p = p->next;
}
```

Visualize `&&` as a series of circuit-breaker switches wired in series: all must be closed for current to flow. `||` is a parallel circuit: if any switch is closed, current flows. `!` is a NOT gate that inverts the signal. When you write `if (a > 0 && b / a > 2)`, the division by `a` is safe because the first condition guarantees `a > 0` before the second condition is evaluated.

Key points:
1. Relational operators return `int` (1 or 0), not `bool` (until C23, where `bool` becomes a built-in type).
2. `&&` and `||` short-circuit — the right operand is evaluated only if needed.
3. In C, any non-zero value is true; zero is false.
4. `==` vs `=` is the most common C bug — enable `-Wparentheses` to catch it.
5. Comparison chaining like `a < b < c` does NOT work as in math — `a < b` evaluates to 0 or 1, then `(0 or 1) < c` is compared. Use `a < b && b < c` instead.

References:
1. ISO/IEC 9899:2011 (C11), §6.5.13 — Logical AND operator.
2. §6.5.14 — Logical OR operator.

2. SQLite source: `src/tokenize.c` — short-circuit in token list traversal.
3. Redis source: `src/server.c` — `processCommand` uses short-circuit for sentinel mode checks.
4. Linux kernel `include/linux/device.h` — device driver ops with null-check chaining.
