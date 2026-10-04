+++
date = '2026-07-06T13:24:00+05:30'
draft = true
title = 'While and Do-While Loops'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 5
weight = 4
initial_code = '''#include <stdio.h>

int main(void) {
    // While loop: print 1 to 5
    int i = 1;
    while (i <= 5) {
        printf("%d ", i);
        i++;
    }
    printf("\n");

    // Do-while: runs at least once
    int j = 1;
    do {
        printf("%d ", j);
        j++;
    } while (j <= 5);
    printf("\n");

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Both loops produce 1 2 3 4 5'
+++

## Problem Statement

Implement the same counting logic (1 to 5) using a `while` loop and a `do-while` loop. Then show the difference by passing a value that makes the condition false initially — observe that `do-while` runs once while `while` runs zero times.

## Theory and Concepts

- `while (condition) { body }`: checks the condition before executing the body (may execute 0 times).
- `do { body } while (condition);`: executes the body once, then checks the condition (always executes at least once).
- Both require the condition to be eventually false to avoid infinite loops.
- Loop variables must be updated inside the body to progress toward termination.

## Real World Application

While loops are used when the number of iterations is unknown in advance — reading characters from a string until null, processing packets until the buffer is empty, polling a hardware flag until it clears. Do-while is useful for menu displays that must appear at least once.

===EXPLANATION===

The `while` loop is the simplest looping construct in C, inherited directly from the structured-programming revolution of the 1960s. Edsger Dijkstra's arguments against `goto` made `while` loops the cornerstone of readable iteration. The `do-while` variant, which guarantees at least one execution, has roots in FORTRAN's "DO UNTIL" and Pascal's `repeat-until`, but C inverted the condition to a "while" to maintain consistency.

The intuitive difference between `while` and `do-while` is the order of test-vs-execute. A `while` loop is a gatekeeper: it checks the condition first, and if it is false, the body never executes. A `do-while` loop is a bouncer who checks after entry: you get in once, and then the bouncer decides whether you stay for the next round. This distinction is crucial when the loop body must run at least once to set up state that the condition tests.

A professional example: in a serial protocol driver, reading a stream of bytes until a termination character: `while ((ch = getchar()) != EOF && ch != '\n') { buffer[i++] = ch; }`. The number of characters is unknown ahead of time. A `do-while` variant appears in device initialization: `do { status = poll_register(); } while (status & BUSY_BIT);` — you must read the register at least once to get the initial status before deciding whether the device is still busy. A colleague once chose `while` instead of `do-while` for a zero-latency FIFO drain, and the buffer-read function returned immediately without ever reading the FIFO on an already-empty device, leaving the system in an inconsistent state.

Visualize `while` as a turnstile that is locked until the condition (a green light) is true. If the light is red (condition false), nobody enters. `Do-while` is a revolving door: it admits one person unconditionally (the first rotation), then checks the light. If the light turns red after entry, no further entries happen, but the first person is already inside.

Key points:
1. `while (condition)` — body may execute zero times.
2. `do { body } while (condition);` — body always executes at least once. Note the required semicolon after `while(...)`.
3. Both rely on the condition eventually becoming false — infinite loops occur if the condition never changes.
4. The condition is evaluated on every iteration, so avoid expensive function calls in the condition.
5. `break` and `continue` work inside both loop types — `continue` in a `while` jumps to the condition check.


Kernighan & Ritchie §3.5 covers `while` and §3.6 covers `do-while`. For design patterns using these loops, "Programming Pearls" by Jon Bentley has excellent examples of input loops. CERT rule MSC21-C discusses loop termination guarantees in secure coding.
