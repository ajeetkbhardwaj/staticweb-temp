+++
date = '2026-07-06T14:11:00+05:30'
draft = true
title = 'Designated Initializers'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 16
weight = 3
initial_code = '''#include <stdio.h>

struct widget {
    int id;
    const char *name;
    float price;
};

int main(void) {
    // Designated initializers (C99+)
    struct widget w1 = {.id = 1, .name = "Gadget", .price = 9.99f};
    struct widget w2 = {.price = 19.99f, .name = "Widget", .id = 2};

    // Array designated initializer
    int arr[10] = {[0] = 100, [5] = 200, [9] = 300};

    // Print
    printf("%d: %s ($%.2f)\n", w1.id, w1.name, w1.price);
    printf("arr[0]=%d, arr[5]=%d, arr[9]=%d\n", arr[0], arr[5], arr[9]);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Designated initializers demonstrated'
+++

## Problem Statement

Use designated initializers (C99 feature) to initialize a struct by field name (in any order) and to initialize specific elements of an array. Show that uninitialized fields/elements are zero-initialized.

## Theory and Concepts

- Designated initializers specify which member to initialize: `.field_name = value`.
- Members not mentioned are zero-initialized.
- Designated initializers can appear in any order — useful for self-documenting code.
- Array designated initializers: `[index] = value` — useful for sparse arrays and lookup tables.
- Nested designated initializers: `.nested.field = value` (C99).
- This feature is available in C99 and later (not in C++).

## Real World Application

Designated initializers make struct initialization self-documenting and order-independent — crucial for structs with many fields (configuration, hardware registers). Array designated initializers are used for interrupt vector tables, lookup tables, and initialization of memory-mapped I/O.

===EXPLANATION===

Designated initializers, introduced in C99, are one of the most impactful ergonomic improvements to the language. Before C99, struct initialization was purely positional: you had to list values in exact member order, and anyone reading the code had to count fields to understand what each value meant. `struct widget w = {1, "Gadget", 9.99f};` — what is `1`? The ID? The type code? You'd need to check the struct definition. Designated initializers let you name each field: `struct widget w = {.id = 1, .name = "Gadget", .price = 9.99f};` — the meaning is explicit. The same applies to arrays: `int arr[10] = {[0] = 100, [5] = 200, [9] = 300};` initializes sparse elements. The intuition is a post‑it note on a filing cabinet drawer. Positional initialization is like saying "put this document in the third drawer" — you must know the drawer ordering. Designated initialization is like saying "put this document in the drawer labelled 'Tax Returns'" — the label removes ambiguity. Professionally, designated initializers are invaluable for structs with many fields. Embedded hardware configuration structs often have 20+ fields for clock speed, pin muxing, interrupt priority, and DMA channels — designated initializers make the configuration self‑documenting and order‑independent. The Linux kernel's `struct file_operations` has dozens of function pointer fields; `const struct file_operations fops = { .read = my_read, .write = my_write, .open = my_open };` — any fields not mentioned (like `llseek`, `poll`) are zero‑initialized (NULL pointers). Array designated initializers are used for interrupt vector tables: `void (*vectors[256])(void) = { [0] = reset_handler, [1] = nmi_handler, [2] = hard_fault_handler };` — the index is the interrupt number. Unspecified array elements are zero‑initialized. Visually, a designated initializer is like filling out a form with labelled fields instead of a blank table. The form (the initializer list) says what goes where (`{.name = "Widget"}`), so you can fill fields in any order and skip optional ones.

Key points:

. designated initializers can appear in any order — they're resolved at compile time, not runtime;
. any member or index not explicitly initialized gets zero;
. you can mix designated and positional initializers (though it's confusing and rarely done);
. nested designated initializers: `.inner.field = value` — useful for deeply nested structs;
. the feature is not available in C++ (C++20 introduced a similar but incompatible designator syntax);
. designated initializers also work with unions: `.member = value`.

References:
1. ISO C99 §6.7.8 (the feature was new in C99).
2. "Rationale for C99" explains the motivation.
3. "C Programming: A Modern Approach" by K. N. King covers designated initializers with clear examples.

