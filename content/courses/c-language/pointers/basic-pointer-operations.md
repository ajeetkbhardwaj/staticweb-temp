+++
date = '2026-07-06T13:45:00+05:30'
draft = true
title = 'Basic Pointer Operations'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 10
weight = 1
initial_code = '''#include <stdio.h>

int main(void) {
    int x = 42;
    int *p = &x;

    printf("Value of x: %d\n", x);
    printf("Address of x: %p\n", (void *)&x);
    printf("Pointer p holds: %p\n", (void *)p);
    printf("Value via dereference: %d\n", *p);

    // Modify through pointer
    *p = 100;
    printf("After *p = 100, x = %d\n", x);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Basic pointer operations demonstrated'
+++

## Problem Statement

Declare an integer variable and a pointer to it. Print the variable's value, its address, the pointer's value (which is the address), and the value obtained by dereferencing the pointer. Then modify the variable through the pointer.

## Theory and Concepts

- A pointer stores the memory address of another variable.
- `&x` gives the address of variable `x`.
- `*p` dereferences pointer `p` to access the value at the address.
- Pointers must be initialized before use (either to a valid address or to `NULL`).
- The type of the pointer (`int *`) determines how many bytes are read/written on dereference.
- `%p` format specifier prints addresses; cast to `(void *)` for portability.

## Real World Application

Pointers are fundamental to C — they enable dynamic memory allocation, efficient array traversal, function parameter modification (pass by reference), data structures (linked lists, trees), and interfacing with hardware (memory-mapped registers).

===EXPLANATION===

Pointers give C programmers direct memory access, a feature inherited from the PDP-11 assembly lineage that Ken Thompson's B language first prototyped. Dennis Ritchie refined B's undifferentiated pointers into typed pointers in 1973, enabling the compiler to know exactly how many bytes to read or write on dereference. This typing distinguishes C pointers from assembly — it provides enough abstraction for type safety while preserving the full power of machine-level addressing. The design was so effective that virtually every systems language since (C++, Rust, Zig) has kept the same pointer model with varying safety guarantees.

The core idea: `&x` yields the memory address of `x`; `*p` retrieves the value at the address stored in `p`. The type annotation `int *` tells the compiler to interpret the bytes at that address as an `int`. Without this annotation, the compiler would not know whether to read 1, 2, 4, or 8 bytes. Pointer assignment is always just copying an address — cheap and fast. Dereference is the expensive part because it requires a memory access.

In production, every major C codebase depends on pointers. The Redis key-value store uses pointers for its `robj` (Redis object) structure — every `SET` and `GET` passes an `robj *` through the command dispatch table. When a string is appended, Redis may reallocate the underlying buffer and update the pointer, all transparent to the caller. The Nginx web server uses pointer-backed memory pools: instead of individual `malloc`/`free` calls for each request, it allocates a large pool and uses a pointer bump allocator — a single pointer tracks the next free byte, and entire pools are freed at once when the connection closes. This design eliminates fragmentation and improves throughput.

Visualize memory addresses like house numbers on a street. `int x = 42` is House #100 with a sign reading "42". `int *p = &x` is a notecard that says "Look at House #100." `*p` walks to House #100 and reads the sign. `*p = 100` walks to House #100 and replaces the sign with "100". The notecard is just a piece of paper (typically 8 bytes on a 64-bit system) — small and easy to pass around.

Key points:
1. A pointer is just an integer holding a memory address — `sizeof(p)` is 4 on 32-bit, 8 on 64-bit systems.
2. Dereferencing an uninitialized pointer is undefined behavior and a common source of segmentation faults.
3. `&` cannot take the address of a bit-field or a register variable.
4. `void *` can hold any address but requires a cast before dereference.
5. Pointer types must match the data they point to; casting `float *` to `int *` violates strict aliasing rules.


Kernighan & Ritchie §5.1–5.2 introduce pointers. "Expert C Programming: Deep C Secrets" (Linden, 1994) covers pointer pitfalls. Ritchie's HOPL paper describes the evolution from B to C pointers. The CERT standard rule EXP08-C addresses safe pointer use.

===CODE===

```c {title="main.c"}
#include <stdio.h>

int main(void) {
    int x = 42;
    int *p = &x;

    printf("Value of x: %d\n", x);
    printf("Address of x: %p\n", (void *)&x);
    printf("Pointer p holds: %p\n", (void *)p);
    printf("Value via dereference: %d\n", *p);

    // Modify through pointer
    *p = 100;
    printf("After *p = 100, x = %d\n", x);

    return 0;
}
```

```c {title="pointer_utils.h"}
#ifndef POINTER_UTILS_H
#define POINTER_UTILS_H

void print_ptr_info(const int *p);

#endif
```

```c {title="pointer_utils.c"}
#include <stdio.h>
#include "pointer_utils.h"

void print_ptr_info(const int *p) {
    printf("Address: %p, Value: %d\n", (void *)p, *p);
}
```
