+++
date = '2026-07-06T13:32:00+05:30'
draft = true
title = 'Scope and Lifetime in Functions'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 6
weight = 6
initial_code = '''#include <stdio.h>

int global = 10;  // File scope, static duration

void demo_scope(void) {
    int local = 20;        // Block scope, automatic
    static int persist = 0; // Block scope, static duration

    persist++;
    local++;
    global++;

    printf("local=%d, persist=%d, global=%d\n", local, persist, global);
}

int main(void) {
    demo_scope();
    demo_scope();
    demo_scope();

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'local=21 persist=1 global=11 ... local=21 persist=3 global=13'
+++

## Problem Statement

Write a function that demonstrates different variable scopes and lifetimes: a `static` local variable that persists across calls, an automatic (regular) local variable that is re-initialized each call, and a global variable. Call the function three times and observe how each variable behaves.

## Theory and Concepts

- **Automatic variables** (default locals): scope is the enclosing block, lifetime is the function call. Created each time the block is entered, destroyed on exit.
- **Static local variables**: scope is the enclosing block, but lifetime is the entire program. They retain their value between function calls and are initialized only once.
- **Global variables**: scope is the file (or the entire program with `extern`), lifetime is the entire program.
- Block scope can be nested — inner blocks can shadow outer variables.

## Real World Application

Static locals are used for function-local caches, call counters, random seed initialization, and singleton-like patterns. Understanding scope and lifetime is critical for avoiding use-after-return bugs and unintended variable sharing.

===EXPLANATION===

Scope and lifetime are two of the most fundamental concepts in C, yet they are frequently confused. Scope answers "where can I see this name?" Lifetime answers "when does this variable exist?" The distinction dates to the block-structured languages of the 1960s (ALGOL 60 introduced block scoping). C inherited this model and added the `static` and `extern` keywords to give fine-grained control over both dimensions.

The intuition: an automatic (local) variable — the default inside a function — is born when its block is entered and dies when the block exits. Each function call creates a fresh set of automatic variables on the stack. A `static` local variable, despite being declared inside a function, lives for the entire program — it is stored in the data segment (or BSS), not the stack. It is initialized once (at program startup) and retains its value between calls. A global variable, declared outside any function, is visible from the point of declaration to the end of the file (or beyond, with `extern`).

A professional example: a random number generator often uses a static local for its seed: `unsigned int rand_next(void) { static unsigned int seed = 12345; seed = seed * 1103515245 + 12345; return seed; }`. The `seed` persists across calls but is not visible outside the function — encapsulation without global namespace pollution. Another example: a mission-critical function in flight software might `static int call_count; call_count++;` at its entry to detect unexpected re-entrancy.

I once debugged a use-after-return bug where a function returned a pointer to its local array: `int *get_buffer() { int buf[256]; return buf; }`. The caller received a dangling pointer because `buf`'s lifetime ended when `get_buffer` returned. The stack frame was reused by the next function call, corrupting the data that `buf` pointed to. The fix was either `static int buf[256]` (extending lifetime to program duration) or dynamically allocating with `malloc`.

Visualize a theater stage. Local variables are props that appear during a scene and vanish when the scene changes. Each scene change (function call/re-entry) clears the props. `static` local variables are set pieces bolted to the stage floor — they remain between scenes but are still "local" because the audience (other functions) cannot walk onto the stage and touch them. Global variables are the theater marquee and sign — visible to everyone on the street (every function in the program).

Key points:
1. Automatic variables have block scope and automatic storage duration — they are created on the stack.
2. `static` local variables have block scope but static storage duration — they live in the data/BSS segment.
3. Global variables have file scope and static storage duration — minimize their use to avoid coupling.
4. `extern` declares a variable defined in another translation unit — it does not allocate storage.
5. Returning a pointer to an automatic local is undefined behavior — the pointer dangles after the function returns.


Kernighan & Ritchie §4.2–4.3 covers scope rules and §4.8 covers block structure. "The C Programming Language" §5.5–5.6 discusses the interaction of scope with pointers. For modern best practices, "C Interfaces and Implementations" by David R. Hanson demonstrates techniques for managing scope in large programs. CERT rule DCL30-C warns against returning pointers to automatic storage.
