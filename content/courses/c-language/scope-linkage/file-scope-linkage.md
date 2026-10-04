+++
date = '2026-07-06T13:38:00+05:30'
draft = true
title = 'File Scope and External Linkage'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 8
weight = 2
initial_code = '''// file1.c demonstration (simulated in single file)
#include <stdio.h>

int file_global = 42;  // File scope, external linkage

static int file_static = 99;  // File scope, internal linkage

void demo_file_scope(void) {
    // Can access both variables
    printf("Global: %d\n", file_global);
    printf("Static: %d\n", file_static);
}

int main(void) {
    demo_file_scope();
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Global: 42\nStatic: 99'
+++

## Problem Statement

Declare a file-scope variable (external linkage) and a `static` file-scope variable (internal linkage). Access both from within a function in the same file. Explain that the `static` variable would not be accessible from another `.c` file.

## Theory and Concepts

- **File scope** (also called global scope): from declaration to end of the file.
- Variables declared outside functions have file scope.
- `static` at file scope gives **internal linkage** — the variable is local to the translation unit.
- Without `static`, file-scope variables have **external linkage** — they can be accessed from other files using `extern`.
- File-scope variables are initialized to zero by default if no explicit initializer is given.

## Real World Application

File-scope variables are used for module-level state in multi-file programs. The `static` qualifier is crucial for encapsulation — hiding implementation details within a .c file so that other modules can't accidentally access internal state.

===EXPLANATION===

File scope and linkage together form the backbone of C's module system — a system that existed long before the word "module" became fashionable in programming language design. In the 1960s and 1970s, large software projects were organized into multiple source files that were compiled separately and then linked together. C's approach was pragmatic: variables declared outside any function are visible from that point to the end of the file (file scope), and by default they are visible to other files too (external linkage). If you wanted privacy, you had to ask for it with `static`. This two-tier system — public by default, private by request — reflected the UNIX philosophy of minimalism and programmer trust.

Imagine a shared office space. The room (translation unit) has a door. By default, anything left in the middle of the room is visible to anyone who walks by and peers through the window. But if you put your documents in a locked filing cabinet (the `static` keyword), they are visible only within the room. People in other rooms (other .c files) can see the unlocked items by declaring `extern`. The locked cabinet, however, is invisible to them — they can't even declare `extern` on it because the linker won't find it. The `static` keyword is the lock, and the linker is the security guard who enforces the boundary.

In professional C code, file-scope variables with internal linkage are foundational. The SQLite source code uses dozens of `static` file-scope variables for its internal state — the database cache, the page allocator, the virtual machine registers. The Lua interpreter, written in C, stores its global state table as a static file-scope variable in `lstate.c`. Embedded firmware projects routinely use static file-scope variables to represent hardware state — the current ADC conversion value, the last button press timestamp — because they need the state to persist across function calls but should never be touched by other modules. The Linux kernel's VFS (Virtual File System) layer uses static variables for mount counters and filesystem type registrations.

Visually, picture a filing system with two kinds of documents. Public documents (external linkage) are filed in a central repository that every department can access. Private documents (internal linkage with `static`) are filed in a locked drawer within a single department. When the company's mailroom (the linker) delivers inter-department correspondence, it only handles public documents. The private drawer is never even cataloged. The C preprocessor doesn't care about linkage — it just passes tokens. The compiler creates the symbol table and records linkage information. The linker resolves cross-file references — but only for symbols with external linkage.

Key points: File scope extends from a variable's declaration to the end of the translation unit. Variables at file scope have static storage duration (program lifetime) regardless of linkage. `static` at file scope selects internal linkage; omitting it selects external linkage. File-scope variables are zero-initialized by default. An `extern` declaration refers to a variable defined in another file — it doesn't allocate storage. A `static` file-scope variable cannot be accessed from another file, even with `extern`. The distinction between scope (visibility region in source code) and linkage (visibility across translation units) is subtle but essential.

For further reading: C standard §6.2.2 (linkages) and §6.2.4 (storage durations), "Linkers and Loaders" by John R. Levine, and the CERT C coding standard recommendations for file-scope variables.
