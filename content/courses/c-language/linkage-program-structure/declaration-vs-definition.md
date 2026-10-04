+++
date = '2026-07-06T14:17:00+05:30'
draft = true
title = 'Declaration vs Definition'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 18
weight = 2
initial_code = '''#include <stdio.h>

// Declaration (extern by default for functions)
int global_counter;        // Definition (tentative)
extern int extern_var;     // Declaration only (defined elsewhere)

// Function declaration (prototype)
void update_counter(void);

// Function definition
void update_counter(void) {
    global_counter++;
}

int main(void) {
    update_counter();
    update_counter();
    printf("Counter: %d\n", global_counter);
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Counter: 2'
+++

## Problem Statement

Explain the difference between a declaration and a definition in C. Use a global variable (which is both declared and defined), and a function (declared with a prototype, then defined). Demonstrate the tentative definition rule for file-scope variables.

## Theory and Concepts

- A **declaration** introduces a name and its type to the compiler (no storage allocated).
- A **definition** allocates storage and optionally provides an initial value.
- For variables: `extern int x;` is a declaration; `int x;` or `int x = 5;` is a definition.
- For functions: a prototype (without body) is a declaration; the body is the definition.
- A variable can have multiple declarations but only one definition (across all files — the one-definition rule).
- Tentative definitions: `int x;` at file scope is a definition that can be overridden by another definition (common extension).

## Real World Application

Understanding declaration vs definition is critical for building multi-file C projects — headers contain declarations, exactly one `.c` file contains the definition. Violating this (defining in a header included by multiple files) causes linker errors.

===EXPLANATION===

The distinction between a declaration and a definition is one of the most important concepts for understanding how C programs are structured across multiple files. A declaration introduces a name and its type to the compiler: `extern int x;` tells the compiler "there is an integer named `x` somewhere, but I'm not allocating storage for it here." A definition allocates storage and optionally provides an initial value: `int x = 5;` creates the variable. The same distinction applies to functions: `int add(int, int);` is a declaration (prototype); `int add(int a, int b) { return a + b; }` is a definition. Historically, C evolved from B, which had no type system — the declaration/definition distinction emerged as C added types in the early 1970s. The intuition is a name reservation system. A declaration is like reserving a domain name — you tell the registry (compiler) that the name `myapp.handler` exists and here's its type (function signature). A definition is like actually building a website at that domain — you provide the content (the function body). You can reserve a name many times (multiple declarations), but you can only build the website once (one definition). Professionally, this rule governs all multi‑file C programs. Headers contain declarations: `extern int global_count;` or function prototypes like `void process(void);`. Exactly one `.c` file contains the corresponding definitions: `int global_count = 0;` and `void process(void) { ... }`. If two `.c` files both define `int global_count;` (without `static` or `extern`), the linker will error with "multiple definition". The tentative definition rule is a special case: a file‑scope variable without `extern` and without an initializer (`int x;`) is a "tentative definition" — it acts like a definition but can be overridden by an actual definition in another file. Many compilers treat this as a common symbol (like Fortran COMMON), which is why some linker errors seem inconsistent. Visually, think of each `.c` file as a warehouse, and the linker as a logistics coordinator. A declaration (`extern int x;`) is a note saying "part #123 exists somewhere in the network" — the coordinator notes the part number. A definition (`int x = 5;`) is an actual crate with part #123 in one specific warehouse. Multiple notes are fine; multiple crates with the same part number cause a shipping conflict.

Key points:

. a variable can be declared any number of times but defined only once (across the entire program);
. `extern int x;` at file scope is a pure declaration — no storage;
. `int x;` at file scope (no extern, no initializer) is a tentative definition — it allocates storage but may be overridden;
. `static int x;` at file scope is a definition with internal linkage — not shared with other files;
. function prototypes (no body) are declarations; the function body is the definition.

References:
1. ISO C11 §6.9 (external definitions), §6.2.2 (linkage).
2. "C: A Reference Manual" by Harbison & Steele §7.1.
3. "The C Standard" by P. J. Plauger.

