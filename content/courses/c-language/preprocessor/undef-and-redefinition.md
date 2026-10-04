+++
date = '2026-07-06T13:44:00+05:30'
draft = true
title = '#undef and Macro Redefinition'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 9
weight = 6
initial_code = '''#include <stdio.h>

#define VALUE 10
#define VALUE 20  // Some compilers warn about redefinition

int main(void) {
    printf("VALUE = %d\n", VALUE);

#undef VALUE
#define VALUE 30

    printf("After #undef: VALUE = %d\n", VALUE);
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'VALUE = 20, After #undef: VALUE = 30'
+++

## Problem Statement

Define a macro, then undefine it with `#undef`, then redefine it with a new value. Print the value before and after to demonstrate that `#undef` removes the macro definition, allowing a new definition.

## Theory and Concepts

- `#undef MACRO_NAME` removes the macro definition.
- Without `#undef`, redefining a macro causes a compiler warning (or error depending on flags).
- `#undef` is useful for temporary macros or when different parts of the code need different definitions.
- `#undef` can be used with conditional compilation to control macro definitions.
- After `#undef`, `#ifdef MACRO_NAME` evaluates to false.

## Real World Application

`#undef` is used to undefine library macros that conflict with application code, in test frameworks to redefine assert macros, and in complex configuration headers where different sections need different macro values.

===EXPLANATION===

The `#undef` directive is the preprocessor's eraser — it removes a macro definition, clearing the way for a new one. While `#define` is widely understood, `#undef` is often overlooked, but it solves a critical problem: macros, once defined, persist until the end of the translation unit. This means a macro defined in one header file can silently affect code in another header file, or even in the same file much later. Without `#undef`, you cannot change a macro's definition without triggering a compiler warning (or error). With `#undef`, you can remove the old definition and provide a new one, creating sections of code that see different values for the same macro name.

Think of `#undef` as a whiteboard eraser. You write `#define VALUE 10` — you've drawn "VALUE → 10" on the board. Later, you need to erase it and write "VALUE → 30." Without `#undef`, you'd be writing on top of the existing text — the compiler would see two conflicting definitions and warn you. The `#undef VALUE` directive wipes the board clean. Then `#define VALUE 30` writes the new value. The compiler sees only the final state of the board. In C's preprocessor, the "board" is the symbol table maintained during preprocessing; `#undef` removes the entry entirely.

In professional C code, `#undef` serves several specific purposes. Test frameworks use it intensively: a unit test file may `#undef assert` and `#define assert(cond) my_custom_assert(cond)` to redirect assertions to a test logger without modifying the system headers. Configuration headers use it for platform adaptation: `#ifdef PLATFORM_A` sets `#define CLOCK_FREQ 16000000`, then `#undef PLATFORM_A` before the next platform block. Library consumers use it to work around macro collisions: if a library defines `#define min(a,b) ...` and your code needs a function called `min`, you `#undef min` before your function definition. The X macro pattern relies on `#undef` after each expansion to allow the same macro name to be reused with different definitions.

Visually, imagine a wall of sticky notes, each labeled with a macro name. `#define` adds a sticky note. `#undef` removes it. If you try to add a sticky note with the same label as an existing one, the compiler (acting as a supervisor) may warn you. `#undef` followed by a new `#define` is like deliberately peeling off the old note and sticking a new one in its place. After preprocessing, only the notes that were on the wall at the end of each section remain. The `#ifdef` inspector checks whether a sticky note is currently present.

Key points: `#undef NAME` removes any current definition of `NAME`. If `NAME` was not defined, `#undef` is a no-op (no error). Without `#undef`, redefining a macro causes a warning (or error with `-Werror` or `-pedantic-errors`). Identical redefinitions (same token sequence) may not warn depending on the compiler. After `#undef`, `#ifdef NAME` and `#if defined(NAME)` are false. `#undef` is commonly paired with conditional compilation to compose macro values from multiple sources. The `#undef` directive cannot be used on macros defined with `-D` on the command line — it still works in the source file to undefine them.

For deeper study: the C standard §6.10.3.5 (rescanning and replacement), §6.10.3.6 (redefinition), GCC CPP documentation on `#undef`, and CERT C PRE01-C (use `#undef` judiciously).
