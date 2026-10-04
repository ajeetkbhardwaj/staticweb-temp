+++
date = '2026-07-06T13:39:00+05:30'
draft = true
title = 'Object-like Macros'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 9
weight = 1
initial_code = '''#include <stdio.h>

#define PI 3.14159
#define MAX_BUFFER 256
#define ERROR_CODE -1

int main(void) {
    printf("PI = %f\n", PI);
    printf("MAX_BUFFER = %d\n", MAX_BUFFER);
    printf("ERROR_CODE = %d\n", ERROR_CODE);
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'PI = 3.141590, MAX_BUFFER = 256, ERROR_CODE = -1'
+++

## Problem Statement

Define several object-like macros using `#define` for a constant value, a buffer size, and an error code. Use them in `printf` and confirm they expand to the defined values. Explain that the preprocessor performs text substitution before compilation.

## Theory and Concepts

- `#define NAME value` defines an object-like macro — `NAME` is replaced with `value` wherever it appears in the source.
- No semicolon at the end (unlike a statement).
- Convention: use UPPER_CASE for macro names.
- Macros can be undefined with `#undef`.
- Macros do not respect scope — they are processed before the compiler sees the code.

## Real World Application

Object-like macros are used for configuration constants, pin definitions, register addresses, and any value that must be consistent across a project. They are often placed in header files and can be overridden with compiler flags (`-D`).

===EXPLANATION===

Object-like macros are the simplest form of C preprocessor directive, but their simplicity belies their power. The `#define` directive was inherited from BCPL, which had a similar mechanism called "manifest constants." When Ritchie designed C, he kept the preprocessor as a separate phase — a text-replacement engine that runs before the compiler proper. Object-like macros were born: a name that stands for a sequence of tokens, substituted literally wherever the name appears. The name "object-like" distinguishes them from function-like macros (which take arguments) — an object-like macro behaves like a named constant object.

Think of an object-like macro as a label on a filing cabinet. The label says "PI" and the drawer contains "3.14159." Before any real work begins, a clerk (the preprocessor) walks through the entire office and replaces every instance of the label with the drawer's contents. The compiler — the actual craftsman — never sees the labels; it only sees the raw materials. This is fundamentally different from a `const` variable: a `const` variable is a real object in memory with an address; a macro is just text substitution with no address, no type checking, and no storage.

In professional C code, object-like macros are everywhere — but their use has declined in favor of `const` variables and enums, which provide type safety and debugging information. However, macros still dominate in several domains. Embedded C relies on them for hardware register addresses: `#define GPIO_PORTA_BASE 0x40020000`. The Linux kernel uses them for configuration parameters: `#define PAGE_SIZE 4096`. Build systems pass macro definitions via compiler flags: `gcc -DDEBUG -DBUILD_NUMBER=42`. In test frameworks, macros define test case expectations. In library headers, they define version numbers and feature test macros like `#define _POSIX_C_SOURCE 200809L`.

Visually, picture two conveyor belts. The first belt (preprocessor phase) carries tokens with macros still intact. A robot arm with a label-reader scans each token. When it reads "MAX_BUFFER," it lifts the token off the belt, looks up the label's content ("256"), and places "256" back on the belt. The second belt (compiler phase) never sees "MAX_BUFFER" — only "256." The tokens that emerge from the first belt are pure C source code, ready for parsing. This two-belt model is the key insight: macro expansion is a purely textual operation with no understanding of C syntax or semantics.

Key points: `#define NAME value` defines an object-like macro. Text substitution occurs before compilation — macros are not variables. By convention, macro names are UPPER_CASE to distinguish them from variables. No semicolon follows the definition (unlike C statements). Macros can be undefined with `#undef`. Macros do not respect scope — they are visible from their `#define` to the end of the file (or until `#undef`). Defining a macro that matches a C keyword or standard library function name causes silent replacement and usually breaks compilation. The `-D` compiler flag defines macros from the command line, enabling build-time configuration.

For deeper study: GCC documentation on the C preprocessor (cpp), the C standard §6.10 (preprocessing directives), and "The C Programming Language" §4.11 (the preprocessor).
