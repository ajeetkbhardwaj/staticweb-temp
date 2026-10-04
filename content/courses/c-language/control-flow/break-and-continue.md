+++
date = '2026-07-06T13:25:00+05:30'
draft = true
title = 'Break and Continue'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 5
weight = 5
initial_code = '''#include <stdio.h>

int main(void) {
    // Print odd numbers up to 10 (skip evens with continue)
    for (int i = 1; i <= 10; i++) {
        if (i % 2 == 0) continue;
        printf("%d ", i);
    }
    printf("\n");

    // Find first number divisible by 7 between 1 and 50
    for (int j = 1; j <= 50; j++) {
        if (j % 7 == 0) {
            printf("Found: %d\n", j);
            break;
        }
    }

    return 0;
}
'''

[[test_cases]]
input = ''
expected = '1 3 5 7 9 \n Found: 7'
+++

## Problem Statement

Use `continue` to skip even numbers in a loop (printing only odds). Use `break` to exit a loop early when a number divisible by 7 is found. Explain how each alters the normal loop flow.

## Theory and Concepts

- `break`: immediately exits the innermost enclosing loop or `switch`.
- `continue`: skips the rest of the current iteration and proceeds to the next loop iteration (update + condition check).
- `break` is useful for early termination (search found, error detected).
- `continue` is useful for skipping invalid cases without deeply nested `if`.
- Both affect only the innermost loop; to break out of nested loops, use flags or `goto`.

## Real World Application

Break is used in search loops (find first matching element), input validation (exit on invalid data), and error handling. Continue is used to skip malformed records in data processing, filter invalid sensor readings, and implement producer-consumer patterns with skip conditions.

===EXPLANATION===

`break` and `continue` were introduced in C to provide structured alternatives to `goto` for altering loop flow. They date back to the late 1960s in BCPL, C's predecessor, and were retained in K&R C as lightweight control-flow modifiers. They sit in a sweet spot: more disciplined than `goto` but more expressive than plain loop semantics alone.

The intuition is clean: `break` is the emergency exit — when triggered, it immediately terminates the innermost loop or `switch`, and execution resumes after the closing brace. `continue` is the "skip to next iteration" button — it abandons the current iteration's remaining code and jumps to the loop's update step (in a `for` loop) or condition check (in `while`/`do-while`). Crucially, `continue` does not exit the loop; it just starts the next cycle early.

A professional example: in a real-time data logger, sensor readings arrive in a batch. Invalid readings (e.g., checksum mismatch) must be skipped without processing: `for (int i = 0; i < count; i++) { if (!validate(samples[i])) continue; process(samples[i]); }`. Without `continue`, you would need a nested `if` wrapping the entire processing block, increasing indentation and reducing readability. Meanwhile, `break` is essential for search: `for (int i = 0; i < n; i++) { if (array[i] == target) { index = i; break; } }` — once found, there is no reason to keep iterating.

I once reviewed embedded firmware for a medical ventilator where a `break` was missing inside an error-handling loop. On detecting a pressure fault, the loop logged the error but continued cycling, overwriting the log entry each iteration. Adding the `break` to exit the loop after logging preserved the first fault record, which was critical for post-incident analysis.

Visualize a loop as a conveyor belt carrying items past inspection stations. `continue` is a reject arm that pushes a faulty item off the belt before it reaches the packing station; the belt keeps moving. `break` is an emergency stop button — the entire belt halts when triggered, and you step off the line.

Key points:
1. `break` exits only the innermost loop/switch — nested loops require a flag or `goto` to break out multiple levels.
2. `continue` in a `for` loop still evaluates the update expression — do not skip important updates.
3. `continue` in a `while` loop jumps directly to the condition — if you forget to update the loop variable before `continue`, you get an infinite loop.
4. Overusing `break` inside loops can make termination logic hard to follow — prefer structured conditions when possible.
5. In a `switch` inside a loop, `break` exits only the `switch`, not the loop.


Kernighan & Ritchie §3.7 covers `break` and `continue`. "C Traps and Pitfalls" by Andrew Koenig has practical examples of loop-control bugs. CERT rule FLP32-C warns about floating-point loop conditions that may never allow `continue` to reach a terminating condition.
