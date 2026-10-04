+++
date = '2026-07-06T14:26:00+05:30'
draft = true
title = 'Name Shadowing and Resolution'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 8
weight = 5
initial_code = '''#include <stdio.h>

int value = 100;  // Global

void outer_function(void) {
    int value = 200;  // Shadows global

    {
        int value = 300;  // Shadows outer block
        printf("Innermost: %d\n", value);
    }

    printf("Outer block: %d\n", value);
}

int main(void) {
    outer_function();
    printf("Global: %d\n", value);

    // To access the shadowed global (not possible from within the function)
    // Use a trick: create a pointer to the global before it gets shadowed
    extern int value;  // Refers to the global
    printf("Global (extern): %d\n", value);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Scope resolution demonstrated'
+++

## Problem Statement

Create a global variable and shadow it in nested blocks with the same name. Print the value at each level to show which declaration is in scope. Use `extern` to access the global from within `main` (though it is not shadowed there).

## Theory and Concepts

- Name shadowing occurs when an inner scope declares a name that already exists in an outer scope.
- The innermost declaration takes precedence — the outer declaration is hidden (shadowed).
- Shadowing can make code confusing — the same name refers to different variables in different scopes.
- Once the inner block exits, the outer declaration becomes visible again.
- There is no way in standard C to access a shadowed global from within a function that shadows it (unlike C++'s `::name`).

## Real World Application

Shadowing is a common source of bugs — modifying a local variable when you intended to modify the global. Many coding standards (e.g., MISRA C) forbid variable shadowing. Compiler warnings (`-Wshadow`) can help detect it.

===EXPLANATION===

Name resolution in the presence of shadowing is the compiler's algorithm for deciding which declaration of a name applies at any given point in the source code. The algorithm is deceptively simple: start at the innermost enclosing scope and work outward until you find a matching declaration. Use that one. Stop. This lexical scoping rule dates back to ALGOL 60 and was adopted by C via BCPL. It's the same rule used by most modern languages — what makes C's version notable is its sparseness: no overloading, no namespaces (other than struct tags), no scope resolution operator. The innermost match wins, period.

Think of name resolution like a search party with flashlights in a cave system. The party stands in the deepest chamber (innermost block) and shines their light. If they see a name tag inside that chamber, they use it. If not, they move back to the previous chamber (outer block) and search again. They continue this backtracking until they reach the cave entrance (file scope). If no name tag is found anywhere, the compiler reports an "undeclared identifier" error. The search never goes into side chambers (other functions or files) — it only travels outward through directly enclosing scopes.

In professional C code, shadowing bugs are subtle and insidious. A typical scenario: a global `int status;` tracks a system error code. A developer adds a new function with a parameter `int status`. Inside the function, all references to `status` now refer to the parameter. An assignment like `status = 0;` resets the local parameter instead of the global. The global stays at its previous (possibly error) value. The system never clears the error. This bug can escape testing because the function appears to work correctly in isolation. The only defense is naming conventions (e.g., `g_status` for globals) or compiler warnings. The CERT C Coding Standard identifies this as DCL30-C: "Declare objects with appropriate storage durations."

Visually, imagine a telescope pointed at the night sky. The sky has layers of objects at different distances — nearby clouds, distant planets, faraway stars. The telescope's view is like scope resolution: you look through the closest layer first. A nearby cloud (inner scope) will block your view of Jupiter (outer scope) even though Jupiter is still there. When the cloud drifts away (inner block ends), Jupiter reappears. The cloud didn't destroy Jupiter — it just hid it. In C, the outer variable doesn't cease to exist; it's merely hidden for the duration of the inner scope.

Key points: The innermost declaration always wins. The search goes scope by scope, outward from the current block through enclosing blocks, then to file scope. Once a matching name is found, the search stops — outer scopes with the same name are invisible (shadowed). Function parameters are in the function's block scope and can shadow file-scope names. There is no syntax in standard C to access a shadowed global (unlike C++ `::`). The `extern` declaration in `main` only works if the global is not shadowed in that scope. To mitigate shadowing bugs: use prefix conventions (`g_`, `m_`), enable `-Wshadow`, and run static analysis tools.

For further exploration: C standard §6.2.1 (scopes of identifiers), §6.2.2 (linkages), "Deep C Secrets" by Peter van der Linden (chapter on scope and linkage), and the MISRA C:2012 directive 4.1 and rule 5.3.
