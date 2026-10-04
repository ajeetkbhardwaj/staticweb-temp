+++
date = '2026-07-06T14:16:00+05:30'
draft = true
title = 'Separate Compilation and Header Files'
difficulty = 'hard'
language = 'c'
topic_weight = 0
subtopic_weight = 18
weight = 1
initial_code = '''// Simulated multi-file project in a single file
// In practice: math_utils.h, math_utils.c, main.c
#include <stdio.h>

// --- math_utils.h ---
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

int add(int a, int b);
int multiply(int a, int b);

#endif

// --- math_utils.c ---
int add(int a, int b) {
    return a + b;
}

int multiply(int a, int b) {
    return a * b;
}

// --- main.c ---
int main(void) {
    int sum = add(5, 3);
    int product = multiply(5, 3);

    printf("Sum: %d\n", sum);
    printf("Product: %d\n", product);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Sum: 8, Product: 15'
+++

## Problem Statement

Simulate a multi-file C project by placing header guard, declarations, and definitions in a single file. The header declares function prototypes, the implementation defines them, and `main` uses them. In a real project, these would be separate `.h` and `.c` files.

## Theory and Concepts

- **Separate compilation**: each `.c` file is compiled independently into an object file (`.o`).
- **Header files** (`.h`) contain declarations (function prototypes, type definitions, macros) shared across `.c` files.
- **Implementation files** (`.c`) contain definitions and are compiled separately.
- The **linker** combines object files into an executable.
- Include guards prevent the same header from being processed twice.
- Only declare what's necessary in headers; keep implementation details private with `static` functions.

## Real World Application

Every non-trivial C project uses multiple files organized by module — drivers, utilities, application logic. Header files form the API contract between modules. Understanding separate compilation is essential for build systems (Makefile, CMake) and large codebases.

===EXPLANATION===

Separate compilation is the foundation of modular C programming. Instead of writing a monolithic source file, you split your program into multiple `.c` files, each compiled independently into an object file (`.o`). A `.h` header file declares the functions and types that a `.c` file exposes to others. The linker then combines all object files into a single executable. This architecture, inherited from the earliest Unix systems (1970s), enables incremental builds — change one file, recompile only that file, and relink. Before separate compilation, every change required recompiling the entire program, which could take hours on PDP‑11 machines. The intuition is a library with reference cards. Each `.c` file is a book on the shelf, and each `.h` file is a reference card taped to the shelf — "See also: Chapter 7 on UART driver, Chapter 12 on CRC calculation." The reference card tells you what the book offers without you needing to read the whole book. The `#include` directive is like walking up to the shelf and reading the card — you learn what functions exist, their signatures, and their promises. The actual implementation remains in the book. Professionally, every significant C project follows this pattern. The Linux kernel has thousands of `.c`/`.h` file pairs organized by subsystem — `sched/` for scheduling, `mm/` for memory management, `net/` for networking. Each `.h` file defines the public API, and internal details stay in the `.c` file (often marked `static`). The build system (Makefile, CMake, Meson) compiles each `.c` to a `.o` and links them together. Libraries like libpng, libcurl, and SQLite all ship header files for public API and keep internal structures hidden. The process: (1) preprocessor processes each `.c` file, expanding `#include` directives to create a translation unit; (2) compiler compiles each translation unit to an object file (`.o`); (3) linker resolves cross‑file references (function calls, global variables) and produces the executable. Visually, imagine three factories on an assembly line. One factory produces wheels (`wheels.c` → `wheels.o`), one produces chassis (`chassis.c` → `chassis.o`), one assembles the car (`main.c` → `main.o`). Each factory has a catalog (`wheels.h`, `chassis.h`) saying what parts it can supply. The assembly factory reads the catalogs and places orders. The final assembly line (linker) bolts everything together.

Key points:

. header files should contain only declarations — function prototypes, type definitions, `extern` variables, macros, and `static inline` functions;
. definitions (function bodies, global variable definitions) go in exactly one `.c` file;
. include guards (`#ifndef`) prevent processing a header twice;
. changing a header that many files include forces recompilation of all those files — minimizing header dependencies improves build speed;
. use forward declarations (`struct foo;`) in headers when possible instead of full definitions to reduce coupling.

References:
1. "The Art of Unix Programming" by Eric S. Raymond.
2. "Large‑Scale C++ Software Design" by John Lakos (applies to C as well).
3. GNU Make documentation for build automation.

