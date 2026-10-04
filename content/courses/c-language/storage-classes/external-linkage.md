+++
date = '2026-07-06T13:34:00+05:30'
draft = true
title = 'External Variables and Linkage'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 7
weight = 2
initial_code = '''#include <stdio.h>

int shared_counter = 0;  // External linkage by default (global scope)

void increment(void) {
    shared_counter++;
}

int main(void) {
    increment();
    increment();
    increment();
    printf("Counter: %d\n", shared_counter);
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Counter: 3'
+++

## Problem Statement

Define a global variable with external linkage and a function that modifies it. Call the function multiple times and print the variable's value. This demonstrates how global state can be shared across functions (and files).

## Theory and Concepts

- Global variables declared outside any function have **external linkage** by default (accessible from other translation units via `extern`).
- `extern` keyword declares a variable defined in another source file without allocating storage.
- Global variables have **static storage duration** (they live for the entire program).
- Global variables are zero-initialized if no explicit initializer is given.
- Overuse of globals makes programs harder to reason about and test.

## Real World Application

Globals are used for system-wide configuration, hardware register mappings (memory-mapped I/O), singleton manager objects, and shared state in interrupt service routines. They should be used sparingly, typically with a naming convention to avoid collisions.

===EXPLANATION===

External linkage is the C language's answer to a deceptively simple question: when you write a variable in one file, how does another file know it exists? Before C had header files and the `extern` keyword, the earliest precursors of C (BCPL) simply assumed everything was global by default — every variable in every file was visible everywhere. This was convenient for small programs but disastrous for large ones. C introduced a more disciplined model: file-scope variables have external linkage by default, meaning they can be shared across translation units, but you must explicitly declare your intent with `extern` in the consuming file.

Imagine a company with multiple departments. External linkage is like a shared bulletin board in the lobby. Any department can post information on it (define a global), and any department can read it (declare `extern`). But there's a catch: if two departments post a notice with the same title, the linker (the company's mailroom) will complain about a conflict. The bulletin board is visible to everyone, which is useful for company-wide announcements (the system clock, the global configuration) but dangerous for department-internal notes that should stay private — hence the modern best practice: avoid globals unless there's a compelling reason.

In professional C programs, external linkage is everywhere. The standard library defines `errno` as a global with external linkage — every file that includes `<errno.h>` gets access to the same `errno` variable. Operating system kernels use external linkage for system-wide data structures: the process table, the list of open file descriptors, the interrupt descriptor table. In embedded systems, hardware register addresses are often defined as global variables with external linkage in a `registers.h` header. Game engines use it for the renderer state, the audio system handle, and the input manager — though many modern engines wrap these in singleton objects or dependency injection.

Visually, picture your program as a set of islands (translation units), each with its own source code. External linkage builds bridges between the islands. The linker is the engineer who connects these bridges at build time. When you declare `extern int shared_counter;`, you're saying "trust me, that bridge leads to an island where this variable is defined." The compiler takes your word for it; the linker verifies the connection exists. Without the `extern` declaration, each island lives in isolation — no bridges, no shared state.

Key points: File-scope variables without `static` have external linkage by default. To access a variable defined in another file, write `extern type name;` — this is a declaration, not a definition (it doesn't allocate storage). If you accidentally define the same variable in two files (without `extern`), the linker produces a duplicate symbol error. The `extern` keyword can also be used on function declarations, though functions already have external linkage by default. Static storage duration means the variable lives for the entire program; external linkage means it can be shared across files — these are orthogonal concepts.

For further reading: the C standard (ISO/IEC 9899:2011, §6.2.2), "Linkers and Loaders" by John R. Levine, and CERT C rule DCL30-C (avoid external linkage for objects with limited scope).
