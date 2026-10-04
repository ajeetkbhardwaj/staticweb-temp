+++
date = '2026-07-06T13:13:00+05:30'
draft = true
title = 'Assignment and Increment/Decrement'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 3
weight = 4
initial_code = '''#include <stdio.h>

int main(void) {
    int x = 10;

    // Compound assignment
    x += 5;  // x = x + 5
    x -= 3;  // x = x - 3
    x *= 2;  // x = x * 2
    x /= 4;  // x = x / 4

    // Prefix vs postfix
    int a = 1, b = 1;
    int pre = ++a;    // a incremented first
    int post = b++;   // b incremented after

    // Print results

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Assignment and increment/decrement demonstrated'
+++

## Problem Statement

Demonstrate compound assignment operators (`+=`, `-=`, `*=`, `/=`, etc.) and the difference between prefix (`++x`) and postfix (`x++`) increment/decrement. Print the values before and after each operation to clearly show when the increment takes effect.

## Theory and Concepts

- `x += 5` is equivalent to `x = x + 5` but evaluates `x` only once.
- Compound operators exist for most binary operators: `+=`, `-=`, `*=`, `/=`, `%=`, `&=`, `|=`, `^=`, `<<=`, `>>=`.
- `++x` (prefix): increments x, then returns the new value.
- `x++` (postfix): returns the old value, then increments x.
- Using postfix in complex expressions can lead to undefined behavior if the same variable is modified and read without a sequence point.

## Real World Application

Increment and decrement are ubiquitous in loops, array traversal, and pointer advancement. Compound assignments make code shorter and often map directly to single machine instructions, improving efficiency in tight loops.

===EXPLANATION===

The increment `++` and decrement `--` operators are among C's most distinctive features, inherited directly from the PDP-11's auto-increment and auto-decrement addressing modes. Ken Thompson's B language (predecessor to C) had `++` and `--` to exploit the PDP-11's `mov (r0)+, r1` and `mov -(r0), r1` instructions [1]. Ritchie kept them in C because they expressed pointer advancement concisely — critical for string processing and array traversal. Compound assignment operators like `+=`, `-=` (and the full family: `*=`, `/=`, `%=`, `&=`, `|=`, `^=`, `<<=`, `>>=`) were added because they map to PDP-11 two-operand instructions like `add`, `sub`, `mul`, etc., reducing code size.

The intuition: `x++` says "use the current value of x, then increment it." `++x` says "increment x first, then use the new value." For simple standalone statements like `x++;`, the effect is identical — x increases by 1. But in expressions like `arr[i++] = val`, the postfix form uses `i` as the index before incrementing, which is the standard pattern for filling arrays. Compound assignments like `x += 5` are not just shorthand — they evaluate `x` only once, which matters when `x` is a complex expression like `*p++ += 5`.

Professional code relies on these operators for idiomatic clarity. The Redis source uses `*argv++` to consume command arguments while advancing the pointer [2]. The SQLite tokenizer uses `while( z[i++] )` for character-by-character scanning [3]. The Linux kernel uses `reg += step` (compound assignment) in register offset iteration [4]. Git's source uses `++i` in `for` loops as the idiomatic C pattern.

```c {title="src/server.c (Redis)", note="Redis uses postfix increment for argument traversal"}
while (argc-- > 0) {
    char *arg = *argv++;
    /* process argument */
}
```

Visualize `x++` and `++x` as two doors. `x++` takes the current value through the door first, then increments x behind you. `++x` increments x first, then takes the new value through the door. In an isolated room (a standalone statement), both doors lead to the same place — x is incremented by 1. But when the value is used as part of a larger expression, the timing matters.

Key points:
1. `++x` (prefix) returns the incremented value; `x++` (postfix) returns the original value.
2. Standalone `x++;` and `++x;` are identical in effect — use whichever is idiomatic for your codebase.
3. Using postfix increment twice on the same variable in one expression is undefined behavior: `i = i++` is illegal.
4. Compound assignments (`x += 5`) evaluate `x` once; `x = x + 5` evaluates `x` twice.
5. `*p++` reads the value at `p`, then advances `p` — the most common pointer traversal pattern in C.

References:
1. Ritchie, D. "The Development of the C Language." *HOPL II*, 1993 — describes the origin of `++` and `--` from B and PDP-11

2. Redis source: `src/server.c` — argument consumption with `*argv++`.
3. SQLite source: `src/tokenize.c` — character scanning with `z[i++]`.
4. Kernighan, B. & Ritchie, D. *The C Programming Language*, 2nd ed., §2.8 — Increment and Decrement Operators.
