+++
date = '2026-07-06T13:53:00+05:30'
draft = true
title = 'Arrays of Pointers'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 11
weight = 4
initial_code = '''#include <stdio.h>

int main(void) {
    const char *fruits[] = {"Apple", "Banana", "Cherry", "Date"};
    int n = sizeof(fruits) / sizeof(fruits[0]);

    for (int i = 0; i < n; i++) {
        printf("fruits[%d] = %s (address: %p)\n", i, fruits[i], (void *)fruits[i]);
    }

    // 2D array vs array of pointers to strings
    char grid[][6] = {"Apple", "Banana"};  // Fixed column width

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Array of string pointers demonstrated'
+++

## Problem Statement

Create an array of pointers to strings (an array of `const char *`). Loop through it and print each string and its address. Explain why this uses less memory than a 2D char array when strings have different lengths.

## Theory and Concepts

- `const char *fruits[]` is an array where each element is a pointer to a `char`.
- Each string literal occupies only the space it needs (plus null terminator).
- A 2D char array `char grid[][6]` wastes space for fixed-width rows.
- Arrays of pointers to strings are the basis for `argv` (command line arguments).
- The strings can be in read-only memory (string literals) or dynamically allocated.

## Real World Application

Arrays of pointers are used for command-line argument handling (`char *argv[]`), menu systems, lookup tables (days of the week, error messages), configuration keyword lists, and any collection of variable-length strings where memory efficiency matters.

===EXPLANATION===

An array of pointers is one of C's most powerful patterns: each element holds a pointer to a separately allocated object. The canonical example is `char *argv[]` in `main(int argc, char *argv[])` — each `argv[i]` points to a null-terminated command-line argument. This is fundamentally different from a 2D character array: `argv` is an array of pointers (8 bytes each on 64-bit), and each string occupies only the space it needs. A 2D array `char grid[][10]` wastes space for short strings and truncates strings longer than 9 characters.

The intuition: an array of pointers is a table where each slot holds an address rather than the data itself. The data lives elsewhere — in read-only memory for string literals, or on the heap for dynamically allocated buffers. To access a string, you fetch the pointer from the array (`fruits[i]`), then follow it to the actual characters. This indirection costs one extra memory access but provides flexibility: each string can have a different length, can be relocated independently, and can be swapped without moving data.

A professional example: the Git version control system stores remote references as an array of pointers: `struct remote **remotes;`. Each `remote *` is separately allocated and contains the URL, fetch config, and refspecs. Adding a remote pushes a new pointer; removing one removes the pointer and frees the structure — O(1) insertion at the end. In the Lua interpreter, the global variable table uses a `TValue *array` inside a `Table` structure, and the hash part uses arrays of pointers for collision resolution. The nginx web server uses `ngx_str_t *` arrays for configuration data — each string is a `{len, data}` struct, avoiding null-terminator dependency and allowing efficient substring references.

Visualize an array of pointers as a corkboard with pins. Each pin holds a string or object. The board itself is just a collection of pins — lightweight. The objects hang from pins on strings of varying lengths. To rearrange the display, you just move pins; you never touch the objects themselves.

Key points:
1. `const char *fruits[]` declares an array where each element is a pointer.
2. String literal initializers are in read-only memory — modifying them is undefined behavior.
3. `sizeof(fruits) / sizeof(fruits[0])` gives the element count at definition scope.
4. A 2D char array wastes space with fixed column width; an array of pointers is compact for variable-length data.
5. Dynamically allocated strings require matching `free()` for each element.


Kernighan & Ritchie §5.6 covers pointer arrays with `argv`. "The C Programming Language" §5.10 shows command-line processing. For dynamic usage, "Expert C Programming" discusses arrays of pointers vs. 2D arrays.
