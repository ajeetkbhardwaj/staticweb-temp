+++
date = '2026-07-06T13:28:00+05:30'
draft = true
title = 'Function Prototypes and Scope'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 6
weight = 2
initial_code = '''#include <stdio.h>

// Function prototype (declaration)
float celsius_to_fahrenheit(float celsius);

int main(void) {
    float temp = celsius_to_fahrenheit(100.0f);
    printf("100 C = %.1f F\n", temp);
    return 0;
}

// Function definition
float celsius_to_fahrenheit(float celsius) {
    return celsius * 9.0f / 5.0f + 32.0f;
}
'''

[[test_cases]]
input = ''
expected = '100 C = 212.0 F'
+++

## Problem Statement

Write a program that places a function prototype before `main` and the function definition after `main`. The function converts Celsius to Fahrenheit. Demonstrate that the prototype allows the compiler to know the function's signature before its definition.

## Theory and Concepts

- A function prototype declares the function's return type, name, and parameter types without providing the body.
- Prototypes enable the compiler to check argument types and return types when the function is called.
- If a function is used before its definition (or without a prototype), the compiler assumes it returns `int` and accepts any arguments (implicit declaration — banned in C99).
- Parameters in a prototype can omit names: `float convert(float, float)`.

## Real World Application

Prototypes are placed in header files to share function declarations across multiple source files. This enables separate compilation where each `.c` file includes headers declaring the functions it calls from other modules.

===EXPLANATION===

Function prototypes were one of the most important changes in the ANSI C standard (C89/C90). Before ANSI C, K&R C allowed implicit function declarations — if you called `foo(3, "hello")` without declaring it, the compiler assumed `foo` returned `int` and accepted any arguments. This caused catastrophic runtime errors that the compiler could not catch. Prototypes fixed this by requiring explicit type information before a function is called.

The intuition is that a prototype tells the compiler "a function with this signature exists somewhere — trust me and check my usage." It is a contract between the caller and the callee. The prototype `float celsius_to_fahrenheit(float);` promises that the function takes one `float` and returns a `float`. If the caller passes an `int` by mistake, the compiler can warn. If the definition later disagrees with the prototype, the linker may catch the mismatch (or worse, cause undefined behavior if it does not).

A professional example: in a large C project with 100+ source files, each `#include <math.h>` makes the prototypes of `sin`, `cos`, `sqrt`, etc., available. Without prototypes, calling `sin(0)` would compile (assumes `int sin()`), but the return would be interpreted as an `int` and then implicitly converted to `double` on assignment — the result would be garbage. This exact bug affected early versions of popular numerical libraries. Modern code review processes mandate that every function in a `.c` file that is not `static` must have a prototype in a corresponding `.h` file.

I once inherited a 50,000-line embedded control system where implicit declarations had been suppressed by compiler flags. A function `set_baud_rate(int port, int rate)` was accidentally called with arguments swapped — `set_baud_rate(9600, 1)` instead of `set_baud_rate(1, 9600)`. The compiler accepted it silently. Adding prototypes and enabling `-Wimplicit-function-declaration` immediately flagged dozens of such mismatches, preventing a potential firmware brick.

Visualize a prototype as a nameplate and doorbell on an office door. The nameplate says "Dr. Smith, Cardiology — expects patient ID (int), returns diagnosis (struct Diagnosis)". Without the nameplate, you barge in and shout "3.14!" — Dr. Smith has no idea what you want, and the interaction fails unpredictably.

Key points:
1. Prototypes are mandatory in C99 and later — implicit declarations are invalid.
2. A prototype without parameter names is legal: `float convert(float, float)`.
3. Prototypes with `...` (ellipsis) suppress argument type checking for variadic arguments.
4. Always include the prototype header in the `.c` file that defines the function — the compiler cross-checks them.
5. Use `static` for functions that should not be visible outside their translation unit.


C11 §6.2.5 and §6.7.6.3 specify function declarators. "The C Standard" by Derek M. Jones §6.5.2.2 covers function call semantics. CERT rule DCL07-C warns about omitting prototypes for functions defined with external linkage.
