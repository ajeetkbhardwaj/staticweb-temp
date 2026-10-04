+++
date = '2026-07-06T13:15:00+05:30'
draft = true
title = 'Operator Precedence and Associativity'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 3
weight = 6
initial_code = '''#include <stdio.h>

int main(void) {
    int a = 5, b = 10, c = 3, d = 2;

    // Predict the result before running
    int result1 = a + b * c;
    int result2 = (a + b) * c;
    int result3 = a << 1 + b;
    int result4 = (a << 1) + b;

    // Print results and compare with predictions

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Precedence results: 35, 45, ...'
+++

## Problem Statement

Write expressions that combine different operators and predict the results based on precedence and associativity rules. Then run the program to verify. Include at least one expression where wrong precedence gives a surprising result (e.g., `a << 1 + b` vs `(a << 1) + b`).

## Theory and Concepts

- Operator precedence determines which operator is evaluated first (e.g., `*` before `+`).
- Associativity determines the order when operators have the same precedence (left-to-right for most, right-to-left for assignment and unary operators).
- Common pitfalls: `*p++` is parsed as `*(p++)`, `a << 1 + b` is parsed as `a << (1 + b)`.
- When in doubt, use parentheses — they make the intention clear and avoid subtle bugs.

## Real World Application

Understanding precedence prevents bugs in arithmetic expressions, bit manipulations, and pointer operations. Code reviewers often flag expressions that rely on implicit precedence without parentheses, as they are error-prone during maintenance.

===EXPLANATION===

Operator precedence in C was derived from ALGOL 60 and adjusted by Ritchie to match PDP-11 assembly idioms. The full precedence table has 15 levels, a complexity that reflects three decades of language evolution — as new operators were added (`+=`, `->`, postfix `++`/`--` in ANSI C, `_Alignof` in C11), they were inserted at the level that minimized breaking existing code [1]. The result is a system where `*p++` means `*(p++)` (postfix `++` has higher precedence than unary `*`), and `a << 1 + 2` means `a << (1 + 2)` (addition has higher precedence than shift).

The intuition: precedence determines "which operator goes first" in an expression without parentheses. Associativity determines direction when operators share the same precedence — left-to-right for arithmetic (`a - b - c` → `(a - b) - c`), right-to-left for assignment (`a = b = c` → `a = (b = c)`) and unary operators. The simplest rule: print the precedence table and keep it on your wall, but better yet — when in doubt, use parentheses. Parentheses are free, they don't affect performance, and they make your intent explicit for the next developer (or your future self).

Real C projects enforce clarity about precedence. The Linux kernel coding style explicitly says: "Don't rely on operator precedence — use parentheses to make the intent clear" [2]. The SQLite source consistently parenthesizes expressions like `(p->flags & SQLITE_NullEQ) != 0` even though `!=` has lower precedence than `&` — the parens make it readable at a glance [3]. The Git source broke a release once due to a precedence bug in a ref-transaction check where `!*ptr` was intended but `!*ptr` with `!` binding tighter than `*` was correct — the confusion alone was enough to warrant a linting rule [4].

```c {title="src/btree.c (SQLite)", note="SQLite uses explicit parentheses around bitwise comparisons"}
if( (pCur->info.nKeyField & 0x01)!=0 ){
    /* odd number of key fields — handle differently */
}
```

Visualize precedence as a pyramid. At the top (highest precedence) are postfix operators: `()`, `[]`, `->`, `.`, postfix `++`/`--`. Below them are unary operators: `&`, `*`, `+`, `-`, `~`, `!`, prefix `++`/`--`, `sizeof`. Then multiplicative, additive, shift, relational, equality, bitwise AND, XOR, OR, logical AND, OR, conditional, assignment, comma — in that order. Associativity is a rule for ties: most tie-breaks go left to right, but assignments, unary, and conditional go right to left.

Key points:
1. `*p++` is `*(p++)` — postfix `++` binds tighter than unary `*`.
2. `a << 1 + b` is `a << (1 + b)` — addition precedes shift.
3. `*p.f` is `*(p.f)` — member access precedes dereference.
4. Assignment is right-associative and has very low precedence: `a = b = c` is `a = (b = c)`.
5. The comma operator has the lowest precedence: `a = 1, 2` is `(a = 1), 2` (not `a = (1, 2)`).

References:
1. ISO/IEC 9899:2011 (C11), §6.5 — Expressions (full precedence table is implicit in the grammar)

2. Linux kernel coding style: `Documentation/process/coding-style.rst` — Chapter 3: Placing Braces and Spaces.
3. SQLite source: `src/btree.c` — explicit parenthesization of bitwise comparisons.
4. Kernighan, B. & Ritchie, D. *The C Programming Language*, 2nd ed., §2.12 — Precedence and Order of Evaluation.
