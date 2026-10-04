+++
date = '2026-07-06T13:23:00+05:30'
draft = true
title = 'For Loop'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 5
weight = 3
initial_code = '''#include <stdio.h>

int main(void) {
    // Print numbers 1 to 10
    for (int i = 1; i <= 10; i++) {
        printf("%d ", i);
    }
    printf("\n");

    // Count down from 10 to 1
    for (int j = 10; j >= 1; j--) {
        printf("%d ", j);
    }
    printf("\n");

    return 0;
}
'''

[[test_cases]]
input = ''
expected = '1 2 3 4 5 6 7 8 9 10 \n 10 9 8 7 6 5 4 3 2 1'
+++

## Problem Statement

Write a program that uses a `for` loop to print numbers from 1 to 10, then another `for` loop to count down from 10 to 1. Understand the three parts of the `for` statement: initialization, condition, and update.

## Theory and Concepts

- `for (init; condition; update) { body }`:
  - `init` runs once before the loop starts (typically declares and initializes a counter).
  - `condition` is tested before each iteration; loop continues while true.
  - `update` runs after each iteration (typically increments/decrements the counter).
- Any of the three parts can be empty (`for (;;)` is an infinite loop).
- Variables declared in `init` (C99+) are scoped to the loop.

## Real World Application

For loops are used for iterating over arrays, processing buffers, generating sequences, implementing time delays (blinking LEDs at different rates), and any repetitive task with a known iteration count.

===EXPLANATION===

The `for` loop in C traces its lineage to ALGOL 60's `for` statement, but the C version — with its three-part header — was a radical simplification by Dennis Ritchie. Rather than inventing complex loop syntax, C gave programmers initialization, condition, and update as three arbitrary expressions. This design makes the `for` loop both simple and infinitely flexible, capable of expressing everything from simple counting to complex pointer traversal.

The intuition is mechanical: the `init` clause runs once before the loop starts, typically to set up a counter or iterator. The `condition` is checked before each iteration — if it is true (non-zero), the body executes. After the body, the `update` clause runs, then the condition is re-evaluated. The loop ends when the condition becomes false. Any of the three parts can be empty: `for (;;)` is an infinite loop; `for (; i < n; )` shifts the update into the body, effectively a `while` loop.

A professional example: in an audio processing pipeline, a `for` loop iterates over a sample buffer: `for (int i = 0; i < num_samples; i++) { output[i] = input[i] * gain; }`. The loop variable `i` is declared in the init (C99+), scoped to the loop. This prevents `i` from leaking after the loop and tells the optimizer that `i` is a local induction variable — the compiler can often vectorize the body automatically. In embedded firmware, a `for` loop with a volatile counter creates precise timing delays: `for (volatile int i = 0; i < 10000; i++);`.

Visualize a `for` loop as a carousel: the init step places you at the starting position. Each revolution (iteration), you check whether you have completed enough cycles (condition). If not, you ride once more (body), then advance one position (update). The ride stops when the counter reaches its limit. The three-part header is like a control panel with a start button, a go/no-go light, and a nudge lever.

Key points:
1. Variables declared in the init clause (C99+) are scoped to the loop — use `-std=c99` or later.
2. The loop body may modify the loop variable — be careful not to skip the update.
3. `continue` jumps to the update step, not the body start.
4. Off-by-one errors (using `<` vs `<=`) are the most common `for` loop bugs.
5. Loop-invariant code should be hoisted out of the body for performance.


Kernighan & Ritchie §3.5 covers the `for` loop. For optimization techniques, "Computer Systems: A Programmer's Perspective" by Bryant & O'Hallaron explains loop optimization and vectorization. CERT rule MSC21-C warns about using signed loop counters with unsigned comparisons.
