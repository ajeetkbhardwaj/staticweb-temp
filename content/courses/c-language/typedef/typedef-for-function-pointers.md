+++
date = '2026-07-06T14:05:00+05:30'
draft = true
title = 'typedef for Function Pointers'
difficulty = 'hard'
language = 'c'
topic_weight = 0
subtopic_weight = 14
weight = 3
initial_code = '''#include <stdio.h>
#include <math.h>

typedef double (*math_func)(double);

double compute(math_func f, double x) {
    return f(x);
}

int main(void) {
    math_func funcs[] = {sin, cos, sqrt};
    const char *names[] = {"sin", "cos", "sqrt"};

    for (int i = 0; i < 3; i++) {
        printf("%s(0.5) = %.4f\n", names[i], compute(funcs[i], 0.5));
    }

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'sin(0.5) = 0.4794, cos(0.5) = 0.8776, sqrt(0.5) = 0.7071'
+++

## Problem Statement

Use `typedef` to create a type alias for a function pointer: `typedef double (*math_func)(double)`. Use this type in a function that accepts a `math_func` argument and in an array of function pointers. Call standard math functions through this interface.

## Theory and Concepts

- Function pointer syntax is cryptic: `double (*fp)(double)`.
- `typedef double (*math_func)(double)` creates an alias `math_func` for a pointer to a function that takes `double` and returns `double`.
- This makes arrays of function pointers and function parameters much more readable.
- Function pointer typedefs are commonly placed in header files.
- They enable callback mechanisms, plugin systems, and dispatch tables.

## Real World Application

Function pointer typedefs are essential in callback-heavy APIs (`qsort`, `bsearch`, signal handlers), GUI frameworks (event callbacks), embedded drivers (interrupt handlers), and implementing virtual tables in C-based OOP.

===EXPLANATION===

Function pointer syntax in C is notoriously cryptic: `int (*fp)(double, char)` declares `fp` as a "pointer to a function that takes `double` and `char` and returns `int`". The typedef version transforms this into something readable: `typedef int (*BinaryOp)(double, char); BinaryOp fp;`. Historically, this syntax comes from C's declaration model ("declaration mirrors use"), which Dennis Ritchie adapted from type theory. The intuition is a remote control: the function pointer typedef defines the shape of the plug (what goes in, what comes out), and every function you write with that shape can be plugged in. Professionally, function pointer typedefs are essential for polymorphism and callback mechanisms. The C standard library uses them everywhere: `qsort` accepts `int (*compar)(const void *, const void *)` — a typedef would make it `Comparator cmp;`. Embedded device drivers define interrupt handler typedefs: `typedef void (*ISR)(void);` — every interrupt service routine follows the same signature. GUI toolkits like GTK use callback typedefs: `typedef void (*GCallback)(void);`. The Linux kernel uses `typedef int (*ioctl_fn)(struct file *, unsigned int, unsigned long);` for device driver ioctl dispatch tables. Visually, imagine a power strip with three‑prong outlets (the typedef defines the shape). Any appliance with a three‑prong plug (any function matching the signature) can connect to any outlet slot (function pointer variable, array element, or parameter).

Key points:

. typedef the pointer, not the function — `typedef double (*MathFunc)(double)` creates a pointer type, while `typedef double MathFunc(double)` creates a function type (incompatible with pointer assignments);
. arrays of function pointers become readable: `MathFunc operations[4] = {add, sub, mul, div};`;
. function pointer typedefs make API headers self‑documenting — the name `Comparator` immediately tells you the purpose;
. complex declarations like `void (*signal(int, void (*)(int)))(int)` are far clearer with typedef: `typedef void (*SigHandler)(int); SigHandler signal(int, SigHandler);`.

References:
1. ISO C11 §6.7.6.3 (function declarators) and §6.7.7.
2. "Expert C Programming: Deep C Secrets" by Peter van der Linden has an excellent chapter on decoding C declarations.

