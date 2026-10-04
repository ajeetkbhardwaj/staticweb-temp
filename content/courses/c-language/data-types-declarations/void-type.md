+++
date = '2026-07-06T13:04:00+05:30'
draft = true
title = 'The Void Type'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 1
weight = 5
initial_code = '''#include <stdio.h>

void say_hello(void) {
    printf("Hello, world!\n");
}

int main(void) {
    say_hello();
    // Void pointer example
    int x = 42;
    void *ptr = &x;
    int *ip = (int *)ptr;
    printf("Value via void pointer: %d\n", *ip);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Function called and void pointer used'
+++

## Problem Statement

Demonstrate two uses of `void`: a function that takes no arguments and returns nothing, and a `void *` pointer that stores the address of an `int` variable, which is then cast back to `int *` and dereferenced.

## Theory and Concepts

- `void` as return type means the function returns nothing.
- `void` in parameter list means the function takes no arguments (in C, `f()` vs `f(void)` differ — the former allows unspecified parameters).
- `void *` is a generic pointer that can point to any data type. It must be cast to a specific type before dereferencing.
- Pointer arithmetic is not allowed on `void *` (the size is unknown).

## Real World Application

`void *` is used in generic data structures (qsort, malloc, memcpy), callback mechanisms, and polymorphic APIs. Understanding it is essential for working with C standard library functions and writing type-agnostic code.

===EXPLANATION===

The `void` type was introduced in the C89/ANSI C standard (1989) to formalize two concepts that earlier K&R C handled informally: functions that return nothing, and generic pointers. Before ANSI C, a function with no return value was declared `foo()` and its return type defaulted to `int`. The `void` keyword made the intent explicit and allowed compilers to catch missing `return` statements. The `void *` pointer was a revolutionary addition — it created a type-agnostic pointer that could hold any address without casting, enabling the generic programming patterns that the C standard library depends on [1].

The intuition: `void` means "nothing" in two different contexts. As a return type, `void` says "this function doesn't produce a value." As a parameter list, `void` says "this function takes no arguments" (in C, an empty parameter list `f()` means "unspecified parameters" — a dangerous legacy from K&R that survives for backward compatibility). For pointers, `void *` is a "pointer to something unknown" — it can store any address, but you must cast it to a concrete type before dereferencing or doing pointer arithmetic. The compiler knows the size of `int *` (4 or 8 bytes for the pointer itself), but `void *` has no associated object size, so arithmetic on it is not allowed.

The C standard library would be impossible without `void *`. The `qsort` function sorts arrays of any type by accepting a `void *` base pointer and a function pointer comparator [2]. The `malloc` function returns `void *` because it allocates memory for any type. The `memcpy` and `memset` functions use `void *` to operate on raw memory regardless of type. This pattern appears throughout professional code: the Linux kernel's linked list macros use `void *` for generic list nodes [3]. SQLite's `sqlite3_exec` callback receives data as `void *` [4].

```c {title="stdlib/qsort.c (CPython)", note="qsort uses void * for generic array sorting"}
void qsort(void *base, size_t nmemb, size_t size,
           int (*compar)(const void *, const void *));
```

Visualize `void *` as a plain envelope with no label. It can contain a letter (an `int`), a photograph (a `struct`), or a contract (a `long double`). To read the contents, you must write the type on the envelope — that's the cast. The envelope itself has a fixed size (the pointer width), but the content it points to is known only through the cast.

Key points:
1. `void` as return type = no return value; `void` in parameters = no arguments.
2. `void *` can be assigned to any pointer type and vice versa without explicit cast in C (but not in C++).
3. You cannot dereference a `void *` — you must cast it to a complete type first.
4. Pointer arithmetic on `void *` is not allowed in standard C (GCC allows it as an extension, treating it as `char *`).
5. `void (*fp)(void)` is a function pointer to a function taking no arguments and returning nothing.

References:
1. ISO/IEC 9899:1990 (C89/C90), §3.1.2.5 — The void type

2. Kernighan, B. & Ritchie, D. *The C Programming Language*, 2nd ed., §5.11 — Pointers to Functions.
3. Linux kernel `include/linux/list.h` — generic doubly-linked list implementation.
4. SQLite source: `sqlite3.h` — `sqlite3_exec` callback signature.
