+++
date = '2026-07-06T13:21:00+05:30'
draft = true
title = 'if-else Decision Making'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 5
weight = 1
initial_code = '''#include <stdio.h>

int main(void) {
    int temperature = 75;

    if (temperature > 85) {
        printf("Hot\n");
    } else if (temperature > 60) {
        printf("Warm\n");
    } else {
        printf("Cool\n");
    }

    // Modify values and observe

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Warm'
+++

## Problem Statement

Write a program using `if-else if-else` to classify a temperature reading into categories (Hot, Warm, Cool, Cold). Change the threshold values and the input to see different branches execute.

## Theory and Concepts

- `if (condition) { ... }` executes a block if the condition is true (non-zero).
- `else if (condition) { ... }` checks an alternative condition.
- `else { ... }` executes if no prior condition matched.
- Conditions are evaluated in order; the first true branch is executed and the rest are skipped.
- Braces are optional for single statements, but always using them prevents dangling-else ambiguity.

## Real World Application

If-else chains are used for menu selection, sensor threshold detection (alarm levels), input validation, and state-dependent behavior in embedded systems and applications.

===EXPLANATION===

The `if-else` statement is the oldest and most universal control structure in programming, dating back to the conditional jump instructions in 1950s assembly languages and formalized in ALGOL 58. C inherited it directly, and it remains the primary way to express binary decisions in code. Despite its simplicity, mastering `if-else` means understanding how C evaluates truth, how the dangling-else ambiguity is resolved, and how to structure decision chains for clarity.

The intuition is straightforward: `if (condition)` checks whether the expression is non-zero. In C, zero is false, everything else is true — including negative numbers. This is a critical distinction from languages with a dedicated boolean type. The condition can be any scalar expression: `if (x)`, `if (ptr)`, `if (a > b && c)`. Each `else if` adds another branch, and the final `else` catches everything that fell through. Execution is strictly sequential — the first matching branch runs, and the rest are skipped.

A professional example: in a medical infusion pump, the control loop might look like: `if (pressure > CRITICAL) { alarm(); shutdown(); } else if (pressure > WARNING) { reduce_flow(); alert(); } else if (pressure > NORMAL) { log("high"); } else { maintain(); }`. Each `else if` prevents a cascade of nested `if` blocks. A junior engineer once wrote this as separate `if` statements without `else`, causing the pump to both reduce flow and maintain simultaneously — a race condition that triggered a recall.

Visualize an `if-else` chain as a sorting machine with a series of funnels. An item enters the first funnel — if it fits (condition true), it drops into that bin and never reaches the next funnel. If it does not fit, it slides to the next funnel. The final `else` is the catch-all tray at the bottom. Without `else`, the item would fall through every funnel simultaneously — impossible physically, but exactly what happens in code without proper branching.

Key points:
1. C has no boolean type (until C23 `_Bool`/`bool`); conditions use zero/non-zero logic.
2. Always use braces `{}` even for single statements — this prevents the dangling-else problem where an `else` binds to the nearest unmatched `if`.
3. `else if` is not a keyword; it is an `else` followed by another `if` statement.
4. Deeply nested `if-else` (beyond 3–4 levels) should be replaced with a `switch`, a lookup table, or polymorphism.
5. The ternary operator `? :` is a compact `if-else` for expressions.


Kernighan & Ritchie's "The C Programming Language" §3.1–3.2 covers control flow. The CERT rule MSC01-C recommends using `else` for mutually exclusive conditions. For a deeper look at decision logic, "Code Complete" by Steve McConnell dedicates a chapter to controlling condition complexity.
