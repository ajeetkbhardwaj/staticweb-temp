+++
date = '2026-07-06T14:15:00+05:30'
draft = true
title = 'const-correctness in Functions'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 17
weight = 4
initial_code = '''#include <stdio.h>

// Good: const tells caller the data won't be modified
void print_array(const int *arr, int len) {
    for (int i = 0; i < len; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
}

// Also modifies: no const
void scale_array(int *arr, int len, int factor) {
    for (int i = 0; i < len; i++) {
        arr[i] *= factor;
    }
}

int main(void) {
    int data[] = {1, 2, 3, 4, 5};
    int n = sizeof(data) / sizeof(data[0]);

    print_array(data, n);
    scale_array(data, n, 10);
    print_array(data, n);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = '1 2 3 4 5 \n 10 20 30 40 50'
+++

## Problem Statement

Write one function that takes a `const int *` parameter (read-only access) and another that takes a regular `int *` (modifiable). The first prints the array; the second scales it by a factor. Call both to demonstrate const-correctness.

## Theory and Concepts

- Const-correctness means using `const` for parameters that the function does not modify.
- Benefits: self-documenting code (readers know what will be modified), compiler catches unintended modifications, enables optimizations.
- If a function takes `const int *`, the caller knows their data won't be changed — even if they pass a non-const variable.
- If a function takes `int *`, the caller should assume the data may be modified.
- Passing a `const int *` to a function expecting `int *` generates a warning (discards const qualifier).

## Real World Application

Const-correctness is a coding standard in most C projects. Standard library functions follow this pattern: `strlen(const char *)` does not modify, `strcpy(char *, const char *)` modifies the first argument, const on the second.

===EXPLANATION===

Const‑correctness is the discipline of applying `const` to every function parameter that the function does not need to modify. It's a contract between the function and its caller: "I promise I won't change your data." If every function in a codebase follows this convention, the `const` annotations form a self‑documenting data‑flow map — you can tell at a glance which functions mutate state and which are read‑only. The concept originated in C++ (where Bjarne Stroustrup emphasized const‑correctness as a design principle) and was adopted by C programmers using `const` for parameters. The intuition is a library. When you borrow a book (pass data to a function), you either get a reference copy (the function can read it) or a working copy (the function can mark it up). The function's signature tells you which: `void read(const Book *b)` — "I'll just look at your book, I won't write in it." `void edit(Book *b)` — "I might underline and annotate." If every function is honest about this, you never get a book back covered in scribbles when you expected it unchanged. Professionally, const‑correctness catches bugs at compile time. If you accidentally write `buffer[i] = toupper(buffer[i]);` inside a function that was declared `process(const char *buffer)`, the compiler errors out immediately — you intended to modify a copy but forgot. The standard library is a model of const‑correctness: `strlen(const char *)`, `strcmp(const char *, const char *)`, `memcpy(void *, const void *, size_t)` — the destination is non‑const (writeable), the source is const (read‑only). `printf(const char *format, ...)` — the format string is const; it's never modified. In embedded drivers, `read(const struct device *dev, uint32_t reg)` guarantees the device struct is not modified during a read operation. Visually, imagine a function signature like a sign on a door: "📖 Reading Room — Books may be inspected but not marked" (`const Book *`). Next door: "✏️ Editing Room — Books may be annotated" (`Book *`). The sign tells you what happens inside. If you have a rare signed first edition (`const Book *`), you only enter the Reading Room. A function that takes `Book *` must receive a non‑const copy.

Key points:

. start by marking pointer/reference parameters as `const` — if the function compiles, you've confirmed it doesn't modify them;
. a `const T *` parameter accepts both `const` and non‑const arguments, so it's strictly more flexible — prefer `const` unless modification is needed;
. returning a `const` pointer from a function tells callers they should not modify the returned data;
. const‑correctness is viral — if you call a non‑const function on a const object, the compiler complains; you must either remove `const` (if modification is intended) or make the called function const‑correct;
. MISRA C and CERT C both recommend const‑qualified parameters.

References:
1. ISO C11 §6.7.3.
2. "Effective C" by Robert Seacord.
3. "C Interfaces and Implementations" by David R. Hanson demonstrates const‑correct design throughout.

