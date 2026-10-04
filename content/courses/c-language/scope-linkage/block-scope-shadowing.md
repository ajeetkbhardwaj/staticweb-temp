+++
date = '2026-07-06T13:37:00+05:30'
draft = true
title = 'Block Scope and Shadowing'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 8
weight = 1
initial_code = '''#include <stdio.h>

int x = 100;  // File scope

int main(void) {
    int x = 10;  // Block scope, shadows global

    {
        int x = 20;  // Inner block scope, shadows outer
        printf("Inner block: %d\n", x);
    }

    printf("Outer block: %d\n", x);
    // Access the global x using extern (not possible inside function)
    // Here, the global x is shadowed

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Inner block: 20\nOuter block: 10'
+++

## Problem Statement

Declare a global variable `x`, then a local `x` in `main`, then another `x` inside a nested block. Print `x` in each scope to demonstrate shadowing. Explain how the compiler resolves which `x` is referenced.

## Theory and Concepts

- **Block scope**: variables declared inside a block `{ }` are visible only within that block.
- **File scope**: variables declared outside any function are visible from the point of declaration to the end of the file.
- Inner scopes can **shadow** outer scopes — the innermost declaration takes precedence.
- To access a shadowed global from inside a function, use `extern` (though the global must not be shadowed by a parameter or local with the same name).
- Best practice: avoid shadowing; it leads to confusion and bugs.

## Real World Application

Scope and shadowing are everyday concepts in C programming — understanding them prevents bugs like accidentally using a local variable when a global was intended. Many coding standards forbid variable shadowing in code reviews.

===EXPLANATION===

Variable shadowing is one of those C features that seems harmless in a textbook but causes real-world bugs that take hours to find. The concept predates C: ALGOL 60 was the first major language to formalize block structure and name scoping, introducing the idea that a name declared inside a block is distinct from the same name declared outside it. C inherited this model almost directly from ALGOL's successor, BCPL. The rationale was elegance — why prohibit reuse of a common name like `i` or `count` in inner blocks? But the same mechanism that enables reuse also enables accidents.

Think of shadowing like a set of nested rooms. You're standing in a living room (file scope) where a painting of a ship hangs on the wall (variable `x`). You walk into a bedroom (function scope) — there's a smaller painting of a ship too (local `x`). While you're in the bedroom, you can only see the bedroom's painting. The living room's painting still exists — it hasn't been removed — but the bedroom ceiling blocks your view. Walk into the closet (inner block), and yet another ship painting (innermost `x`) blocks your view of both previous ones. When you walk back out, the blocking disappears, and you see the bedroom's painting again. The key insight: shadowing doesn't destroy variables, it just hides them behind a closer declaration.

In professional code, shadowing is a common source of bugs. A classic scenario: a developer adds a parameter `int index` to a function that already has a global `int index`. Inside the function, every reference to `index` now uses the parameter, not the global. If the developer intended to modify the global — say, to reset a global counter — the code silently does nothing useful. Compiler warnings (`-Wshadow` in GCC and Clang) catch this, but many projects don't enable it. MISRA C, the safety-critical coding standard used in automotive and aerospace, explicitly forbids variable shadowing. The Linux kernel coding style advises against it. Google's C style guide for embedded code forbids it.

Visually, think of shadowing as layers of transparency sheets on an overhead projector. Each new block lays a new sheet on top. When you read a variable name, the compiler looks from the top sheet downward and uses the first match it finds. The sheets beneath are still there — they just can't be seen through the upper layers. When a block ends, its sheet is removed, revealing the ones below. This "top-down search" mental model maps directly to how the C standard describes name resolution: the compiler searches outward from the innermost enclosing scope.

Key points: An inner scope can shadow an outer scope's variable with the same name. The innermost declaration wins. Shadowing ends when the inner block exits — the outer variable becomes visible again. There is no standard C syntax to access a shadowed global from within a function (unlike C++'s `::` scope resolution or Java's `this`). To mitigate risk, enable `-Wshadow`, avoid reusing names, and follow a naming convention (e.g., `g_` prefix for globals). Function parameters can also shadow globals — this is especially dangerous.

For deeper study: the C standard §6.2.1 (scopes of identifiers), "Expert C Programming: Deep C Secrets" by Peter van der Linden (chapter on scope), and the MISRA C:2012 guideline 5.3 (no identifier shadowing).
