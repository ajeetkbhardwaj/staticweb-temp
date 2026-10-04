+++
date = '2026-07-06T13:48:00+05:30'
draft = true
title = 'Function Pointers'
difficulty = 'hard'
language = 'c'
topic_weight = 0
subtopic_weight = 10
weight = 4
initial_code = '''#include <stdio.h>

int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }
int multiply(int a, int b) { return a * b; }

int compute(int (*op)(int, int), int x, int y) {
    return op(x, y);
}

int main(void) {
    int (*operations[])(int, int) = {add, subtract, multiply};

    for (int i = 0; i < 3; i++) {
        printf("Result %d: %d\n", i + 1, compute(operations[i], 20, 5));
    }

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Result 1: 25\nResult 2: 15\nResult 3: 100'
+++

## Problem Statement

Define several arithmetic functions with the same signature, then store their addresses in an array of function pointers. Write a `compute` function that accepts a function pointer and calls it. Call each operation through the array.

## Theory and Concepts

- A function pointer is declared as `return_type (*name)(param_types)`.
- `&function_name` or just `function_name` gives the function's address.
- Function pointers can be stored in arrays, passed as arguments, or returned from functions.
- The `typedef` can make function pointer syntax more readable.
- Calling through a function pointer: `op(x, y)` or `(*op)(x, y)` — both work.

## Real World Application

Function pointers are used for callback mechanisms (`qsort` comparator, signal handlers), plugin systems, state machines (function pointer tables), dispatch tables for command processors, and implementing polymorphism in C (virtual method tables).

===EXPLANATION===

Function pointers are C's mechanism for treating code as data — storing a function's address in a variable, passing it as an argument, or placing it in an array. This traces back to the PDP-11's `JSR` instruction and the need to parameterize behavior. The C standard defines that a function name used without parentheses evaluates to a pointer to the function, so `qsort(arr, n, size, cmp)` naturally accepts `cmp` as a function pointer. This design was influenced by ALGOL 68's procedure types and has shaped every language that supports callbacks.

The intuition: just as a variable name evaluates to its address in certain contexts, a function name evaluates to its entry point address. If `int add(int, int)` is a function, then `add` alone (without `()`) is the address of the machine code that implements it. A function pointer `int (*op)(int, int)` holds this address, and `op(3, 4)` calls the function through the pointer. The awkward syntax — the `*` and `()` parenthesization — exists because `int *op(int, int)` would be parsed as a function returning `int *`.

A professional example: the Linux kernel uses function pointers extensively in `struct file_operations`. Every file system fills this struct with pointers to its `open`, `read`, `write`, and `release` functions. When user space calls `read()`, the kernel dispatches through `file->f_op->read(...)`. This is polymorphism in pure C — ext4, btrfs, and NFS provide different implementations behind the same function pointer interface. The kernel also uses function pointers for interrupt handlers: each device registers a handler, and the interrupt controller dispatches through the pointer table. In glibc, `qsort` accepts a comparator function pointer, allowing any user-defined ordering to be plugged into the same sort routine.

Visualize a function pointer as a remote control button. Each button triggers a different behavior (channel up, volume down), but the remote just holds the mapping. Pressing the button (calling through the pointer) sends a signal. The button does not care what the TV does — it just triggers the bound action. Similarly, `qsort` does not care how you compare elements; it calls your comparison function at the right moments.

Key points:
1. Declaration syntax: `return_type (*name)(params)`.
2. `&func` and `func` are equivalent for obtaining the address.
3. Calling syntax: `(*op)(x)` or `op(x)` — both are valid.
4. `typedef` improves readability: `typedef int (*Op)(int, int)`.
5. Function pointer types must match exactly (parameters and return type) for correct behavior.


Kernighan & Ritchie §5.11 introduces function pointers with `qsort`. "C Interfaces and Implementations" (Hanson) shows function pointers in abstract data types. The Linux kernel's `include/linux/fs.h` defines `struct file_operations` as a production example.
