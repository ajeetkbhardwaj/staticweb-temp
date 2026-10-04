+++
date = '2026-07-06T13:31:00+05:30'
draft = true
title = 'Variable-length Argument Lists'
difficulty = 'hard'
language = 'c'
topic_weight = 0
subtopic_weight = 6
weight = 5
initial_code = '''#include <stdio.h>
#include <stdarg.h>

double average(int count, ...) {
    va_list args;
    va_start(args, count);

    double sum = 0;
    for (int i = 0; i < count; i++) {
        sum += va_arg(args, double);
    }

    va_end(args);
    return sum / count;
}

int main(void) {
    double avg = average(4, 10.0, 20.0, 30.0, 40.0);
    printf("Average: %.1f\n", avg);
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Average: 25.0'
+++

## Problem Statement

Implement a variadic function `average` that takes a count followed by that many `double` arguments and returns their average. Use `<stdarg.h>` macros (`va_list`, `va_start`, `va_arg`, `va_end`). Call it with different argument counts and values.

## Theory and Concepts

- Variadic functions accept a variable number of arguments using `...` in the parameter list.
- At least one named parameter must precede `...` (the named parameter provides context, typically a count or format string).
- `va_list` is a type for iterating over arguments.
- `va_start(ap, last_named)` initializes the iterator.
- `va_arg(ap, type)` retrieves the next argument as the given type.
- `va_end(ap)` cleans up.
- There is no type safety — the caller must provide correct types, or undefined behavior occurs.

## Real World Application

Variadic functions are used in `printf` and its family (format strings), error logging functions, sum/average utilities, and generic initialization functions. The pattern is also used in callback-based APIs for passing extra context.

===EXPLANATION===

Variadic functions — functions that accept a variable number of arguments — were a pragmatic addition to C, primarily to support `printf`. When the ANSI C committee standardized the language in the 1980s, `stdarg.h` replaced the older `varargs.h` with a cleaner, portable interface. The design is minimal by necessity: C is statically typed and compiled to efficient machine code, so the variadic mechanism relies on macros that manipulate the stack directly.

The intuition: a variadic function has at least one named parameter, followed by `...` (ellipsis). The named parameter provides a starting point — typically a count of variadic arguments (like `average(4, ...)`) or a format string (like `printf`). Inside the function, you declare a `va_list` variable, initialize it with `va_start`, retrieve each argument with `va_arg`, and clean up with `va_end`. The `va_arg` macro advances through the stack, but the programmer must know the type of each argument — there is no runtime type information.

A professional example: a logging library might expose `void log_error(const char *format, ...)`. The implementation calls `vprintf` internally: `va_start(args, format); vfprintf(stderr, format, args); va_end(args);`. This lets callers write `log_error("File %s: line %d: %s", filename, line, message)` without pre-formatting strings. I built a telemetry logging system for a satellite ground station where variadic log functions wrote time-stamped messages to a ring buffer — the variable argument list allowed any structured data (angles, temperatures, status codes) to be logged uniformly.

The critical danger: type safety does not exist for variadic arguments. If you write `average(3, 1, 2, 3)` but the function expects `double` arguments (as in the example), the integer literals are not converted — `va_arg(args, double)` reads raw bytes from the stack, interpreting the bit pattern of an `int` as a `double`. The result is garbage. This is why `printf("%f", 3)` prints 0.000000 instead of 3.0 — the integer 3's bit pattern is not a valid float.

Visualize variadic arguments as a bucket of mixed LEGO bricks dumped onto a table. The named parameter tells you how many bricks are in the bucket. `va_start` opens the bucket. Each `va_arg` reaches in and pulls out one brick, but *you must say what shape you expect* — if you say "2×4 brick" but the brick is actually a wheel, you pull out a wheel that you forcefully interpret as a 2×4, and it does not fit where you try to place it.

Key points:
1. At least one named parameter must precede `...` — it provides the anchor for `va_start`.
2. There is no implicit conversion: integer arguments are *not* promoted to `double` — you must pass the exact expected type.
3. Default argument promotions apply: `float` is promoted to `double`, and integer types smaller than `int` are promoted to `int`.
4. Calling `va_arg` with the wrong type is undefined behavior — no error, no warning.
5. `va_copy` (C99) allows saving a snapshot of the argument list for re-scanning.


C11 §7.16 defines `<stdarg.h>`. Kernighan & Ritchie §7.3 covers variadic functions. For a deep dive into implementation, "The C Standard" by Derek M. Jones §7.16 details the macro expansions and platform-specific ABI considerations.
