+++
date = '2026-07-06T13:08:00+05:30'
draft = true
title = 'Symbolic Constants with #define'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 2
weight = 4
initial_code = '''#include <stdio.h>

#define PI 3.14159
#define MAX_BUFFER_SIZE 1024
#define GREETING "Welcome!"

int main(void) {
    // Use the defined constants
    double area = PI * 5 * 5;
    char buffer[MAX_BUFFER_SIZE];

    // Print values

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Area = 78.539750, Buffer size = 1024'
+++

## Problem Statement

Define symbolic constants using `#define` for a mathematical constant (PI), a buffer size, and a greeting string. Use these constants in calculations and print the results. Note that `#define` performs text substitution before compilation.

## Theory and Concepts

- `#define` is a preprocessor directive that replaces an identifier with a token sequence before compilation.
- Convention: use UPPER_CASE for macro names.
- No semicolon after `#define` — it is not a statement.
- `#define` does not create a variable; it is purely textual substitution.
- Using parentheses around macro bodies prevents operator precedence issues.

## Real World Application

`#define` is used for configuration constants (buffer sizes, timeouts, pin numbers), mathematical constants, and conditional compilation guards. It is widely used in embedded firmware for hardware-specific values (register addresses, clock speeds).

===EXPLANATION===

The `#define` preprocessor directive is one of the oldest features in C, inherited from the preprocessor written by Mike Lesk for early Unix (1973) and later refined by Ritchie. The C preprocessor (cpp) runs before the compiler proper, performing pure text substitution [1]. This is fundamentally different from `const`: `const int x = 5` creates a typed object that exists at runtime and can be inspected with a debugger; `#define X 5` replaces every occurrence of `X` with `5` before compilation begins — no variable, no address, no type checking in the traditional sense.

The intuition: when the compiler sees `PI` in `#define PI 3.14159`, it replaces it with `3.14159` everywhere in the source. This is purely mechanical — the preprocessor does not understand C syntax, types, or scope. This is why `#define MAX(a, b) ((a) > (b) ? (a) : (b))` needs extra parentheses: without them, `MAX(x & 1, y) + z` would expand incorrectly. The convention of UPPER_CASE names helps distinguish macros from ordinary variables at a glance. By convention, `#define` is used for constants that need to be compile-time evaluable (array sizes, bit-field widths, `case` labels).

Professional C projects use `#define` carefully but extensively. The Linux kernel defines hardware register offsets and bit masks as macros — `#define GPIO_BASE 0xFE200000` — because these must be compile-time constants for inline assembly [2]. The SQLite source uses `#define` for configuration limits like `SQLITE_MAX_PAGE_COUNT` and `SQLITE_MAX_SQL_LENGTH`, which can be overridden at compile time [3]. The Redis source defines protocol constants with `#define REDIS_REPLY_STRING '$'` because they must be character literals usable in `switch` statements [4].

```c {title="arch/arm/mach-bcm/board_bcm2835.c (Linux kernel)", note="Hardware register addresses as macros"}
#define BCM2835_GPIO_BASE       (BCM2835_PERI_BASE + 0x200000)
#define GPIO_FSEL0              (GPIO_BASE + 0x00)
#define GPIO_SET0               (GPIO_BASE + 0x1C)
```

Visualize `#define` as a search-and-replace step that runs before compilation. Every occurrence of the macro name is replaced with its definition verbatim. This is why `#define X = 5` (with an equals sign) would cause compilation errors — the preprocessor doesn't know that `=` is not part of the value.

Key points:
1. `#define` is text substitution, not a variable — no type, no address, no scope.
2. Always parenthesize macro bodies and each parameter: `#define SQUARE(x) ((x)*(x))`.
3. Never put a semicolon after `#define` — it becomes part of the substitution.
4. Use `const` or `enum` instead of `#define` when possible — they provide type checking and are debugger-friendly.
5. Undefine macros with `#undef NAME` when they're no longer needed to avoid name clashes.

References:
1. Ritchie, D. "The Development of the C Language." *HOPL II*, 1993 — describes the C preprocessor origins

2. Linux kernel, board-specific headers — `arch/arm/mach-bcm/include/mach/platform.h`.
3. SQLite source: `sqlite3.c` — compile-time limits as `#define` macros.
4. Redis source: `src/server.h` — protocol reply type macros.
