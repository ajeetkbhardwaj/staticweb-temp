+++
date = '2026-07-06T14:24:00+05:30'
draft = true
title = 'File Scope vs Block Scope'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 8
weight = 3
initial_code = '''#include <stdio.h>

int global = 1;  // File scope

static int file_static = 2;  // File scope, internal linkage

void show_scopes(void) {
    int auto_var = 3;  // Block scope

    static int static_local = 4;  // Block scope, static duration

    {
        int inner = 5;  // Innermost block scope
        printf("Inner block: %d\n", inner);
    }

    printf("Auto: %d, Static local: %d\n", auto_var, static_local);
}

int main(void) {
    printf("Global: %d, File static: %d\n", global, file_static);
    show_scopes();
    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'All scope types demonstrated'
+++

## Problem Statement

Demonstrate the four types of scope in C: file scope (global), file scope with static (internal linkage), block scope (automatic variable), and block scope with static duration (static local). Print each from the appropriate scope level.

## Theory and Concepts

- **File scope**: variables declared outside any function, visible from declaration to end of file.
- **Block scope**: variables declared inside `{}`, visible only within that block (including nested blocks).
- **Function scope**: only applies to `goto` labels — they are visible throughout the function.
- **Function prototype scope**: parameter names in a prototype are only visible within the prototype.
- Variables in inner scopes can shadow variables in outer scopes (same name, different variable).

## Real World Application

Understanding scope is essential for writing correct programs — it determines where a variable can be accessed, prevents accidental modification, and enables information hiding. Scope-related bugs (especially shadowing) are common in large codebases.

===EXPLANATION===

Scope in C is the language's way of answering: "where in the source code can I use this name?" It's a concept that goes back to ALGOL 60 (1960), which introduced block-structured scoping — the idea that `begin...end` pairs create nested regions where names can be independently declared. C inherited this directly. But C also introduced file scope (things declared outside any function) and two minor scope categories: function scope (for `goto` labels, which are visible throughout a function regardless of block nesting) and function prototype scope (parameter names in prototypes are visible only within the prototype itself). Understanding these four scope types is like knowing the floor plan of a building — it tells you which rooms connect to which.

Think of scope as different types of containers. File scope is the entire building — if you place a sign in the lobby (`int global = 1;`), everyone in the building can see it. Block scope is a single room — if you place a sticky note on a desk inside a room (`int auto_var = 3;`), only people in that room can see it. Function scope (labels) is like an announcement over the PA system — heard everywhere in the building but not outside. Function prototype scope is like a name tag on a person entering the building — visible only while they're passing through the door. A static local (`static int static_local = 4;`) is a sticky note glued to the desk — visible only in that room, but it survives even after everyone leaves for the day.

In professional C code, scope violations are a major source of bugs. A classic example: a developer declares `int i;` at file scope for a loop counter, then uses `i` in multiple functions without realizing they share the same variable. One function modifies `i`, another function's loop breaks. The fix was always to make `i` block-scoped. Another common pattern: a project has a header file with an enum, and a source file redeclares a member name in a local variable, causing the enum constant to be shadowed and leading to a wrong value. Code review processes in safety-critical industries (automotive, avionics, medical devices) explicitly check for scope mismanagement.

Visually, imagine a set of nested boxes. File scope is the outermost box. Inside it are function boxes (each function's body). Inside those are block boxes (compound statements). Variables live in the box where they're declared and are visible in that box and all boxes inside it — unless an inner box contains another variable with the same name (shadowing). Labels (`goto` targets) are an exception — they pierce through all inner boxes to be visible throughout the entire function. This nesting model is the key mental picture for understanding scope in C.

Key points: C has four scope types: file scope (entire file), block scope (inside `{}`), function scope (labels only), and function prototype scope (parameter names in prototypes). Block scope is the most common. Variables in inner scopes are visible only within that scope. Labels have function scope — they can be jumped to from anywhere in the same function, even inside nested blocks. Static locals have block scope but static storage duration — they are visible only in their block but live for the program's lifetime. Function prototype scope is the rarest: parameter names in a prototype are not accessible outside the prototype.

For deeper study: C standard §6.2.1 (scopes of identifiers), "The C Programming Language" §4.3 (scope rules), and "Computer Science: A Structured Programming Approach Using C" by Forouzan and Gilberg.
