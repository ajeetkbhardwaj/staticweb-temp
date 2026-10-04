+++
date = '2026-07-06T14:08:00+05:30'
draft = true
title = 'Enum with Custom Values'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 15
weight = 2
initial_code = '''#include <stdio.h>

enum error_code {
    SUCCESS      = 0,
    ERR_TIMEOUT  = -1,
    ERR_BUSY     = -2,
    ERR_INVALID  = -3,
    ERR_UNKNOWN  = 99
};

int main(void) {
    enum error_code ec = ERR_TIMEOUT;

    printf("Error code: %d\n", ec);

    // Enums can have negative values too
    printf("All codes: %d, %d, %d, %d, %d\n",
           SUCCESS, ERR_TIMEOUT, ERR_BUSY, ERR_INVALID, ERR_UNKNOWN);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'All error codes printed'
+++

## Problem Statement

Define an enumeration for error codes with explicitly assigned values, including negative values and non-sequential values. Print each enumerator's value. Explain that enum values are just integers and can be any integer constant expression.

## Theory and Concepts

- Enumerators can be assigned explicit integer values: `ERR_TIMEOUT = -1`.
- Multiple enumerators can share the same value (e.g., `FAIL = -1, ERROR = -1`).
- Uninitialized enumerators continue from the previous value (increment by 1).
- The values must be integer constant expressions.
- Enum values can be negative, zero, or positive — any value within the range of `int`.

## Real World Application

Custom enum values are used for error codes where 0 means success and negative means failure, bit flags where each constant is a power of 2, status codes that must match specific hardware or protocol values, and state values that begin at a specific number.

===EXPLANATION===

While default enum values (0, 1, 2, ...) cover many use cases, real‑world code frequently needs explicit values — sometimes deliberate, sometimes for compatibility, sometimes for bit‑level manipulation. The default behaviour is simple: the first enumerator gets 0, and each subsequent one increments by 1. But you can override any enumerator with any integer constant expression: `enum error_code { SUCCESS = 0, ERR_TIMEOUT = -1, ERR_BUSY = -2 }`. Subsequent uninitialized enumerators then continue incrementing from the last explicit value. Historically, custom enum values were essential for maintaining backward compatibility with existing `#define` constants (which had specific numeric values wired into binary protocols or file formats). The intuition is a custom‑numbered parking lot: instead of spaces numbered 1, 2, 3, you assign space A‑001 for the CEO, A‑250 for visitors, B‑100 for contractors — each space gets a meaningful number that fits an existing system. Professionally, custom enum values serve several patterns. Error codes use `0` for success and negative values for errors — this allows simple `if (result)` checks. The SQLite database library defines `typedef enum { SQLITE_OK = 0, SQLITE_ERROR = 1, SQLITE_BUSY = 5, ... }` — each code is a specific integer that must never change. The HTTP status code constants could be `enum http_status { HTTP_OK = 200, HTTP_NOT_FOUND = 404, HTTP_ERROR = 500 }`. Bit‑flag enums assign powers of two: `enum permissions { READ = 1, WRITE = 2, EXECUTE = 4 }` — these are custom values that enable bitwise composition. The TCP header flags in many embedded stacks are `enum tcp_flags { FIN = 0x01, SYN = 0x02, RST = 0x04, PSH = 0x08, ACK = 0x10 }` — each bit position has a specific protocol‑defined value. Visually, think of custom enum values as labelling each rung of a ladder with a specific number. The first rung might be 100, the second 200, the third 400 — the ladder still works, but the numbers have meaning beyond mere position.

Key points:

. the values must be integer constant expressions — function calls and runtime values are not allowed;
. multiple enumerators can share the same value (aliases for the same constant);
. the underlying type must be able to represent the defined values — C guarantees enums fit in an `int` but implementations may use a wider type;
. when explicit values are large, subsequent implicit values might overflow — this is implementation‑defined;
. custom values can be negative, zero, or positive in any order.

References:
1. ISO C11 §6.7.2.2.
2. "The C Standard Library" by P. J. Plauger for enum usage in standard headers.
3. "C: A Reference Manual" by Harbison & Steele.

