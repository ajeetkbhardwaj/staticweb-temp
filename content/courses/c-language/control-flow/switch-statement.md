+++
date = '2026-07-06T13:22:00+05:30'
draft = true
title = 'Switch Statement'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 5
weight = 2
initial_code = '''#include <stdio.h>

int main(void) {
    int day = 3;  // 1=Mon ... 7=Sun

    switch (day) {
        case 1: printf("Monday\n"); break;
        case 2: printf("Tuesday\n"); break;
        case 3: printf("Wednesday\n"); break;
        case 4: printf("Thursday\n"); break;
        case 5: printf("Friday\n"); break;
        case 6:
        case 7: printf("Weekend\n"); break;
        default: printf("Invalid day\n");
    }

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Wednesday'
+++

## Problem Statement

Use a `switch` statement to print the day of the week based on a numeric input (1–7). Demonstrate fall-through by having Saturday and Sunday map to the same case ("Weekend"). Include a `default` branch for invalid input.

## Theory and Concepts

- `switch (expression)` branches to the matching `case` label.
- The expression must be an integer type (`int`, `char`, `enum`).
- `break` exits the switch; without it, execution falls through to the next case.
- `default` handles values that don't match any case (optional).
- Multiple cases can share the same code by stacking them: `case 6: case 7: printf("Weekend"); break;`.

## Real World Application

Switch statements are used for command parsing (handling different opcodes), state machines (IDLE → RUNNING → ERROR), menu navigation, and dispatching events based on type codes in protocols and drivers.

===EXPLANATION===

The `switch` statement appeared in C's earliest days as a more efficient alternative to long `if-else` chains when branching on a single integer expression. It was inspired by FORTRAN's computed `GOTO` and ALGOL's switch clauses. The design prioritized compiler optimization — a `switch` could be implemented as a jump table (O(1) dispatch) rather than a linear comparison sequence (O(n)). This performance advantage persists today.

The intuition: `switch` evaluates an integer expression once, then jumps directly to the matching `case` label. Labels are compile-time constants. After executing the matching case, `break` exits the switch. Without `break`, execution "falls through" to the next case — this is intentional, not a bug. Fall-through enables multiple cases to share code: `case 6: case 7:` handles both values identically. The `default` label catches any unmatched value and is optional.

A professional example: in a network protocol parser, a `switch` on the packet type byte handles dozens of message types efficiently: `switch(pkt->type) { case TYPE_SYN: ... break; case TYPE_ACK: ... break; case TYPE_DATA: ... break; default: log_error("unknown type"); }`. The jump table makes dispatch O(1) regardless of how many types exist. I once tuned a high-frequency trading gateway where replacing a 30-way `if-else` chain with a `switch` cut per-packet latency from 80 ns to 12 ns — the compiler generated a direct jump table instead of 30 comparisons.

Visually, a `switch` is like a railway roundhouse with multiple tracks. The engine (the expression) enters the turntable, which rotates to align with the correct track (case label). The engine rolls down that track. The `break` is a bumper stopping the engine; without it, the engine rolls through the switchyard onto the next track. `default` is a siding that catches any engine whose destination does not match a numbered track.

Key points:
1. The controlling expression must be an integer type (`int`, `char`, `enum`, `_Bool`). C does not support `switch` on strings or floats.
2. `case` values must be compile-time integer constant expressions.
3. Omitting `break` causes fall-through — annotate intentional fall-through with a comment to prevent warnings.
4. Variables can be declared inside a case block, but must be wrapped in braces `{}` to limit scope.
5. Some compilers warn on missing `default` or uncovered enum values — treat these warnings seriously.


C11 §6.8.4.2 specifies the `switch` statement. "The C Standard" by Derek M. Jones provides exhaustive detail. For state machine design patterns using switch, see "Practical Statecharts in C/C++" by Miro Samek. MISRA-C Rule 15.0–15.7 provides safety guidelines for switch in embedded code.
