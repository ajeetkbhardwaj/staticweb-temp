+++
date = '2026-07-06T14:31:00+05:30'
draft = true
title = 'typedef for Function Signatures'
difficulty = 'hard'
language = 'c'
topic_weight = 0
subtopic_weight = 14
weight = 5
initial_code = '''#include <stdio.h>

// Typedef for a comparison function
typedef int (*comparator)(const void *, const void *);

int compare_ints(const void *a, const void *b) {
    int ia = *(const int *)a;
    int ib = *(const int *)b;
    return (ia > ib) - (ia < ib);
}

void sort_ints(int *arr, int n, comparator cmp) {
    // Simple bubble sort using comparator
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (cmp(&arr[j], &arr[j + 1]) > 0) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}

int main(void) {
    int data[] = {5, 2, 8, 1, 9};
    int n = sizeof(data) / sizeof(data[0]);

    sort_ints(data, n, compare_ints);

    for (int i = 0; i < n; i++) {
        printf("%d ", data[i]);
    }
    printf("\n");

    return 0;
}
'''

[[test_cases]]
input = ''
expected = '1 2 5 8 9'
+++

## Problem Statement

Use `typedef` to define a function pointer type for a comparator function. Implement a sorting function that accepts this comparator type and uses it to order elements. This mirrors how `qsort` works in the standard library.

## Theory and Concepts

- `typedef int (*comparator)(const void *, const void *)` creates an alias for the comparator function pointer type.
- This makes function parameters that accept callbacks much more readable.
- The comparator pattern is used by `qsort` and `bsearch` in the C standard library.
- The `const void *` parameters allow the comparator to work with any data type.
- The function returns negative, zero, or positive for less-than, equal, or greater-than.

## Real World Application

This pattern is used throughout C libraries for generic algorithms — sorting, searching, and filtering. Creating typedefs for callback signatures makes APIs self-documenting and improves code readability in event-driven systems.

===EXPLANATION===

Callback functions are C's primary mechanism for generic algorithms — you write the algorithm once, and the caller provides the comparison or action function. The `qsort` standard library function is the canonical example: it sorts any array type because it delegates element comparison to a caller‑supplied function pointer. But the raw function pointer syntax in `qsort`'s signature — `void qsort(void *base, size_t nmemb, size_t size, int (*compar)(const void *, const void *))` — is overwhelming. A typedef transforms it: `typedef int (*comparator)(const void *, const void *); void qsort(void *base, ..., comparator compar);`. The intuition is a recipe that says "season to taste" — the recipe author (library writer) leaves a step open for your judgment (the callback). The typedef defines what "to taste" means: it must accept two ingredients and return a verdict. Professionally, callback typedefs structure every callback‑heavy C API. The GLib library defines `typedef gboolean (*GSourceFunc)(gpointer data);` for its event loop. The `bsearch` function uses `typedef int (*Compar)(const void *, const void *)`. Embedded RTOSes use `typedef void (*TaskFunction)(void *params);` for thread entry points. Signal handlers use `typedef void (*sighandler_t)(int);`. In GTK, `typedef void (*GCallback)(void);` is the base for all event callbacks. Visually, think of a callback typedef as a standardized socket. The library publishes socket specifications (the typedef). Your code builds a plug (a function matching the signature) and inserts it into the socket. The library calls back through that socket when it needs your custom logic.

Key points:

. callback typedefs make function signatures shorter and clearer — compare `typedef int (*Comparator)(const void *, const void *);` to the raw `int (*)(const void *, const void *)` in parameter lists;
. the `const void *` pattern allows type‑generic callbacks — the callback casts the pointer to the actual type;
. callback typedefs support arrays of callbacks for dispatch tables and plugin systems;
. combining a `void *context` parameter with a callback lets you pass arbitrary user data into the callback (closure pattern);
. callback typedefs are the foundation of the Strategy design pattern in C.

References:
1. ISO C11 §7.22.5 (qsort, bsearch).
2. "Patterns in C" by Adam Tornhill covers callbacks and the Strategy pattern.
3. "C Interfaces and Implementations" by David R. Hanson.

