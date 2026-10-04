+++
date = '2026-07-06T13:49:00+05:30'
draft = true
title = 'NULL Pointer Safety'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 10
weight = 5
initial_code = '''#include <stdio.h>

int safe_dereference(int *p) {
    if (p == NULL) {
        return -1;  // Error indicator
    }
    return *p;
}

int main(void) {
    int x = 42;
    int *valid = &x;
    int *invalid = NULL;

    printf("Valid: %d\n", safe_dereference(valid));
    printf("Invalid: %d\n", safe_dereference(invalid));

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Valid: 42\nInvalid: -1'
+++

## Problem Statement

Write a function that safely dereferences a pointer by first checking for `NULL`. Return a sentinel value (like -1) if the pointer is null. Call it with both a valid pointer and `NULL` to demonstrate safe handling.

## Theory and Concepts

- A `NULL` pointer points to nothing (address 0, which is never valid for user data).
- Dereferencing a `NULL` pointer causes undefined behavior (typically a crash / segmentation fault).
- Always check pointers for `NULL` before dereferencing them, especially when the pointer comes from `malloc`, function arguments, or external sources.
- `NULL` is defined in `<stddef.h>`, `<stdio.h>`, `<stdlib.h>`, and others.
- `if (!p)` is equivalent to `if (p == NULL)`.

## Real World Application

NULL pointer checks are critical in production code — any pointer from `malloc`, fopen, or function parameters that can be null must be validated. NULL safety is a common theme in code reviews and security audits.

===EXPLANATION===

A NULL pointer is guaranteed to compare unequal to any valid pointer. The C standard defines `NULL` as `((void *)0)` or simply `0` — it never points to an object or function. Dereferencing NULL is undefined behavior; on most systems it causes a segmentation fault because address 0 is unmapped by the operating system's MMU. The zero page is deliberately left unmapped to catch null pointer dereferences. In embedded systems without an MMU, a null pointer dereference can silently corrupt memory, making NULL checks even more critical.

The intuition: a `NULL` pointer is like a torn business card — it does not lead anywhere useful. The check `if (p == NULL)` asks "is this a live lead?" before following it. In boolean context, `if (!p)` is equivalent — NULL is zero, and zero is false. Every pointer that could possibly be null must be checked before dereference, especially pointers from `malloc`, `fopen`, or function parameters.

A professional example: in 2009, a null pointer dereference in the Linux kernel's `tcp_collapse()` function allowed a remote denial of service — a specially crafted TCP packet could trigger the null dereference and crash the system. The Azure cloud platform suffered a null pointer-related DNS outage in 2018. The CERT C coding standard rule EXP34-C requires validating pointers returned from allocation functions: `int *p = malloc(n * sizeof(int)); if (!p) return ERROR;`. The Linux kernel's `checkpatch.pl` script actively warns against dereferencing pointers without prior NULL checks.

Visualize NULL as a locked door with a sign that says "NO ADDRESS HERE." Trying to walk through it (dereferencing) slams you into the door. The check `if (p)` is checking whether the door is open before trying to pass. A non-NULL pointer is not guaranteed valid — it might point to freed memory (dangling pointer) — but NULL is guaranteed invalid.

Key points:
1. `free(NULL)` is safe and does nothing.
2. `malloc.
3. ` may return NULL or a unique non-NULL pointer (implementation-defined).
4. Static and global pointers are initialized to NULL automatically; automatic (local) pointers are not.
5. After `free(p)`, set `p = NULL` to prevent double-free and use-after-free.
6. `if (!p)` is equivalent to `if (p == NULL)`.


Kernighan & Ritchie §5.2 discusses null pointers. The C11 standard §6.3.2.3 covers null pointer conversion. CERT rules EXP34-C and MEM30-C provide guidelines for null-safe allocation. "The Development of the C Language" (Ritchie, 1993) describes how NULL was introduced.
