+++
date = '2026-07-06T13:47:00+05:30'
draft = true
title = 'Pointers to Pointers'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 10
weight = 3
initial_code = '''#include <stdio.h>
#include <stdlib.h>

void allocate_array(int **arr, int size) {
    *arr = (int *)malloc(size * sizeof(int));
    for (int i = 0; i < size; i++) {
        (*arr)[i] = i * 10;
    }
}

int main(void) {
    int *data = NULL;
    allocate_array(&data, 5);

    for (int i = 0; i < 5; i++) {
        printf("%d ", data[i]);
    }
    printf("\n");

    free(data);
    return 0;
}
'''

[[test_cases]]
input = ''
expected = '0 10 20 30 40'
+++

## Problem Statement

Write a function `allocate_array` that receives a pointer-to-pointer (`int **`) and dynamically allocates and initializes an array. The function modifies the caller's pointer (allocates memory via `malloc`). Print the array values in `main`.

## Theory and Concepts

- `int **p` is a pointer to a pointer — it stores the address of a pointer variable.
- To modify a pointer variable inside a function, pass its address (`int **`).
- `*arr = malloc(...)` assigns the allocated memory to the caller's pointer.
- `(*arr)[i]` dereferences to the array and indexes into it.
- Double pointers are also used for arrays of strings (`char **argv`), 2D arrays, and linked list head modification.

## Real World Application

Double pointers are used in allocation functions (modifying caller's pointer), command-line argument handling (`argv`), implementing data structures where the head pointer may change (linked list insert/delete), and multi-level indirection in complex systems.

===EXPLANATION===

Pointers to pointers (double pointers) emerge naturally from C's pass-by-value semantics. Since C always passes arguments by value, a function cannot modify a caller's variable directly — it receives only a copy. To modify a pointer variable, you must pass its address, requiring a pointer-to-pointer (`int **`). This pattern was established early in C's history: the `main` function signature `int main(int argc, char **argv)` passes an array of strings as a double pointer. Kernighan and Ritchie used `char **argv` in the first edition, and the convention has persisted through every C standard revision.

The intuition is a chain of references. `int x` holds an integer. `int *p` holds the address of an integer. `int **pp` holds the address of a pointer. Each `*` adds one level of indirection. To reach the original integer from `pp`, you need two dereferences: `**pp`. To modify the pointer (`p`) inside a function, you pass `&p` (an `int **`) and assign `*pp = new_value`.

A professional code example: every linked list library faces the problem of modifying the head pointer. Consider `list_insert_front(Node **head, int value)` — when the list is empty, `*head = new_node` modifies the caller's head pointer. Without double pointers, the caller would handle the empty case separately. The Git version control system uses this pattern in its object store: `int read_sha1_file(const unsigned char *sha1, enum object_type *type, unsigned long *size)` takes the type and size as pointer parameters to return multiple values. Higher callers pass `&type` and `&size`, creating implicit double-pointer chains.

Visualize double pointers as a treasure hunt. A map (first pointer) tells you which tree to look under. The tree is the second pointer. Under the tree is the chest (the actual value). If you only have a copy of the map, you can find the chest but you cannot change where the tree is. Moving the tree requires modifying the original map — which is exactly what a double pointer lets you do.

Key points:
1. `int p` means `p` holds the address of an `int *`.
2. Double pointers are required when a function must allocate or reassign a caller's pointer.
3. `argv` is a `char ` — an array of command-line strings.
4. Triple and quadruple pointers exist but often indicate overcomplicated design.
5. A 2D array is NOT the same as `int ` — they have different memory layouts.


Kernighan & Ritchie §5.6 covers pointer arrays including `argv`. "The C Programming Language" §5.10 shows command-line argument handling with `char **`. "Expert C Programming" chapter on memory access covers double-pointer allocation patterns.
