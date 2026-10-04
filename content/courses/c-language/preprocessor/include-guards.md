+++
date = '2026-07-06T13:43:00+05:30'
draft = true
title = 'Include Guard and Header Files'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 9
weight = 5
initial_code = '''// This example simulates how include guards work.
// In practice this would be in a header file.
#include <stdio.h>

#ifndef MY_HEADER_H
#define MY_HEADER_H

#define VERSION 100

int multiply(int a, int b) {
    return a * b;
}

#endif  // MY_HEADER_H

int main(void) {
    printf("Version: %d\n", VERSION);
    printf("5 * 7 = %d\n", multiply(5, 7));

    // If this header were included a second time,
    // the #ifndef guard would prevent redefinition.

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Version: 100, 5 * 7 = 35'
+++

## Problem Statement

Simulate a header file with an include guard. The guard prevents the code from being processed twice if the header is included multiple times. Define a macro and a function inside the guarded block and use them from `main`.

## Theory and Concepts

- Include guard pattern: `#ifndef FILENAME_H` / `#define FILENAME_H` / `...` / `#endif`.
- The first inclusion defines the guard macro; subsequent inclusions see it defined and skip the content.
- This prevents duplicate definitions of types, variables, and functions.
- `#pragma once` is an alternative (non-standard but widely supported) that achieves the same effect.
- Always guard your header files to avoid compilation errors in multi-file projects.

## Real World Application

Include guards are essential in every C header file. Without them, including the same header twice (directly or indirectly) would cause redefinition errors for types, structs, and function declarations. The standard library headers and all third-party libraries use this pattern.

===EXPLANATION===

Include guards are a defensive programming pattern that emerged from a simple problem: C's `#include` directive is just text insertion — it dumps the contents of the included file into the including file at the point of inclusion. If file `a.h` includes `b.h`, and `b.h` also includes `a.h` (directly or indirectly), the result is an infinite recursion that the preprocessor breaks with an error. Even without circular includes, a common scenario causes problems: `main.c` includes `utils.h` and `math.h`; if both `utils.h` and `math.h` include `types.h`, then `types.h` ends up in the translation unit twice. The second copy tries to redefine all the types, structs, and function declarations from the first copy — this is a compilation error. Include guards prevent this by making the second and subsequent inclusions a no-op.

Think of an include guard as a "do not disturb" sign on a hotel room door. The first time housekeeping comes, the sign is not on the doorknob, so they enter and clean the room (process the header). Before leaving, they hang the sign on the doorknob (`#define TYPES_H`). When housekeeping returns later, they see the sign and skip the room (the `#ifndef` fails, skipping the entire header body). The sign remains on the knob for the rest of the stay (the macro stays defined for the rest of the translation unit). The pattern is so simple and effective that it has been used in essentially every C project since the late 1980s.

In professional C code, include guards are universal. The C standard library headers all use guards: `<stdio.h>` has `#ifndef _STDIO_H`, `<stdlib.h>` has `#ifndef _STDLIB_H`. The Linux kernel headers use `#ifndef _LINUX_MM_H` with `#define _LINUX_MM_H`. Every third-party library — zlib, libpng, OpenSSL, curl — uses include guards. The naming convention typically mirrors the file path: `MY_PROJECT_UTILS_HELPERS_H` for `utils/helpers.h`. Some projects use `#pragma once` instead, a non-standard but widely supported directive that tells the compiler "include this file only once." `#pragma once` is simpler (no macro name, no `#ifndef`/`#define`/`#endif` boilerplate) but is technically not portable to all compilers.

Visually, imagine a photocopier that makes copies of documents (headers) and inserts them into a binder (translation unit). An include guard is a checkmark on a master document list. Before copying a document, the operator checks the list: if the document name is checked off, skip it. If not, copy the document and check off its name. The binder never gets duplicate pages. Without the list, the operator would copy the document every time it's requested, leading to an ever-expanding binder with redundant, conflicting pages.

Key points: Include guard pattern: `#ifndef FILENAME_H`, `#define FILENAME_H`, header body, `#endif`. The guard macro name should be unique — include the project name and path to avoid collisions with other headers. `#pragma once` is an alternative that avoids naming issues but is not required by the C standard. Include guards do not prevent the header's side effects (like macro definitions that change based on other macros) — they only prevent duplicate processing of the same header. A header without a guard will cause a compilation error if included more than once indirectly. Guard names conventionally omit leading underscores (reserved for the implementation).

For further reading: the C standard §6.10.2 (source file inclusion), "The C Preprocessor" (GCC docs), and CERT C PRE06-C (enclose header files in include guards).
