+++
date = '2026-07-06T13:26:00+05:30'
draft = true
title = 'Goto Statement'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 5
weight = 6
initial_code = '''#include <stdio.h>

int main(void) {
    // Cleanup pattern with goto
    int error = 0;

    if (/* some condition */) {
        error = 1;
        goto cleanup;
    }

    // ... more code ...

cleanup:
    // Cleanup code runs whether or not goto was taken
    printf("Cleanup executed\n");

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Error handling with goto demonstrated'
+++

## Problem Statement

Write a program that simulates error handling using `goto` for a cleanup pattern. Allocate multiple resources (simulated by printing messages) and use `goto` to jump to cleanup code if any allocation fails. Show how `goto` can be used to avoid deeply nested error-handling `if` statements.

## Theory and Concepts

- `goto label;` transfers control unconditionally to the specified label.
- Labels are identifiers followed by a colon and can appear before any statement.
- `goto` is restricted: cannot jump into a variable-length array scope or into a different function.
- Common valid uses: breaking out of nested loops, unified cleanup in error paths.
- Overuse of `goto` leads to spaghetti code; use structured control flow when possible.

## Real World Application

`goto` is used in the Linux kernel for cleanup paths (goto out, goto err), in parser generators, and in code that needs to unwind multiple levels of resource acquisition. The single-exit-point pattern (`goto cleanup`) is widely accepted in systems programming.

===EXPLANATION===

No statement in C is as controversial as `goto`. Edsger Dijkstra's 1968 letter "Go To Statement Considered Harmful" launched a decades-long war. Yet `goto` remains in C and is used daily by the most respected C programmers in the world — the Linux kernel alone contains over 100,000 `goto` statements. The key is understanding *when* `goto` is the right tool and *when* it leads to spaghetti code.

The intuition is simple: `goto label;` transfers control unconditionally to a labeled statement in the same function. That is it. No condition, no return, no scoping magic. Labels are identifiers followed by a colon: `cleanup:`. The `goto` can jump forward or backward, but it cannot jump into a variable-length array's scope or into another function. The power comes from the ability to escape deeply nested structures in one step — something `break` cannot do (it only exits one level).

A professional example: the single-point-of-exit cleanup pattern is ubiquitous in systems programming. Consider a function that opens a file, allocates memory, and acquires a lock: `if (fopen(...) == NULL) goto out; if ((buf = malloc(...)) == NULL) goto close_file; if (pthread_mutex_lock(...)) goto free_buf; // ... use resources ... pthread_mutex_unlock(...); free_buf: free(buf); close_file: fclose(file); out: return;`. The `goto` labels create a unwind ladder — each error jumps to the appropriate level of cleanup, avoiding deeply nested `if`-error handling. This pattern appears in the Linux kernel's `goto out`, `goto err`, `goto err_free` chains.

I once maintained a database engine where a transaction commit function had seven resources to acquire and release. Without `goto`, the code used six levels of nested `if` with duplicated cleanup logic in every branch — a nightmare to modify. Converting to the `goto cleanup` pattern reduced the function from 200 lines of tangled branches to 80 clean lines with one copy of each cleanup step.

Visualize a high-rise building with a `goto` as an elevator that goes directly from any floor to the ground floor (or to any other floor). Structured control flow is the staircase — you can only go one floor at a time. `break` is a fire escape that skips one floor at most. For a 10-floor exit, `goto` is the elevator; for a 1-floor exit, the stairs are fine.

Key points:
1. `goto` cannot jump across function boundaries or into the scope of a VLA.
2. Only use `goto` for forward jumps to a common exit/cleanup point — backward jumps create loops better written with `while`/`for`.
3. The Linux kernel coding style endorses `goto` for cleanup (see kernel.org/doc/Documentation/process/coding-style.rst).
4. Avoid `goto` in application-level business logic — structured control is clearer.
5. Always keep the label and the `goto` within the same or adjacent visual block; long-distance `goto`s harm readability.


Dijkstra's original letter is worth reading (Communications of the ACM, March 1968). The Linux kernel coding style guide explicitly covers `goto`. "C Programming: A Modern Approach" by K.N. King has a balanced discussion. For the opposite perspective, Frank Rubin's "GOTO Considered Harmful" Considered Harmful (CACM, 1987) provides the counter-argument.
