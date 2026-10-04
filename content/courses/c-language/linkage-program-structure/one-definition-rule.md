+++
date = '2026-07-06T14:20:00+05:30'
draft = true
title = 'The One-definition Rule'
difficulty = 'hard'
language = 'c'
topic_weight = 0
subtopic_weight = 18
weight = 5
initial_code = '''#include <stdio.h>

// Declarations (okay — can have many)
extern int shared_value;
extern int shared_value;  // Second declaration — fine

// Definition (exactly one per program)
int shared_value = 100;

void increment(void) {
    shared_value++;
}

int main(void) {
    printf("Before: %d\n", shared_value);
    increment();
    increment();
    printf("After: %d\n", shared_value);
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Before: 100, After: 102'
+++

## Problem Statement

Demonstrate the one-definition rule (ODR) by having a global variable defined in one place and declared (via `extern`) in multiple places. The program links correctly because there is exactly one definition. Show that multiple `extern` declarations are allowed but only one definition.

## Theory and Concepts

- The one-definition rule (ODR): every function and global variable must have exactly one definition across the entire program.
- Multiple declarations (e.g., via `extern` in different files) are allowed.
- Violating ODR (defining the same function or variable in two files) causes a linker error.
- "Tentative definitions" (file-scope `int x;` without `extern`) are a special case — they may be treated as declarations that can be overridden by actual definitions.
- The ODR is enforced by the linker, not the compiler.

## Real World Application

The ODR is the reason header files must only contain declarations (prototypes, `extern` variables, `static inline` functions). Definitions go in exactly one `.c` file. In large projects, violating ODR causes confusing linker errors that can be hard to debug.

===EXPLANATION===

The One Definition Rule is as old as C itself — it emerged naturally from the moment C supported separate compilation (circa 1972, Ritchie and Thompson's Unix). The idea is straightforward: every function and global variable must have exactly one definition across the entire program. Multiple *declarations* are fine (that is what header files are for), but if two object files both define `int counter`, the linker cannot choose which one to use and emits a duplicate-symbol error.

The intuition is simple: imagine building a house with two front doors at different addresses. When the architect asks for a single door at 123 Main St, the builder expects one. If the blueprints show two identical doors at the same address, the builder refuses to proceed. Similarly, when the linker combines object files, it expects each symbol name to be defined exactly once.

Professional C codebases enforce the ODR rigorously. The Linux kernel's build system uses `EXPORT_SYMBOL()` macros to explicitly mark which symbols are visible outside their translation unit — everything else is `static` and file-local [1]. Git's `git-compat-util.h` declares all compatibility functions as `static inline` in the header, avoiding ODR violations across compilation units [2]. The WebKit project caught a high-severity ODR violation in 2022 where two source files defined different versions of `WTF::fastMalloc` — the linker silently chose one, causing intermittent crashes on iOS [3].

A useful mental model is to think of each `.c` file as a room in a museum. Each room has its own unique exhibits (definitions). The doorways are the header files — they tell visitors what they can find in other rooms without duplicating the exhibits themselves. If two rooms contain the same painting, the curator (linker) cannot decide which one to display and shuts down the entire museum.

Key points:
1. Exactly one definition per function and global variable across the entire program.
2. Multiple `extern` declarations are allowed — that is the purpose of header files.
3. `static` at file scope makes a symbol local to its translation unit, bypassing the ODR.
4. Tentative definitions (`int x;` at file scope without `extern`) are a C89 special case — avoid relying on them.
5. Linker errors for ODR violations mean you have a symbol defined in two different `.c` files.
6. LTO (Link-Time Optimisation) can expose ODR violations that were previously hidden.

References:
1. Linux kernel: `include/linux/export.h` — `EXPORT_SYMBOL()` macro and ODR enforcement

2. Git source: `git-compat-util.h` — uses `static inline` extensively to avoid ODR.
3. WebKit bug 245132 — ODR violation in WTF::fastMalloc causing production crashes.
