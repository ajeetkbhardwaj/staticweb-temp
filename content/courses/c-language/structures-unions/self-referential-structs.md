+++
date = '2026-07-06T13:59:00+05:30'
draft = true
title = 'Self-referential Structures (Linked List)'
difficulty = 'hard'
language = 'c'
topic_weight = 0
subtopic_weight = 13
weight = 3
initial_code = '''#include <stdio.h>
#include <stdlib.h>

struct node {
    int data;
    struct node *next;
};

void print_list(const struct node *head) {
    while (head != NULL) {
        printf("%d -> ", head->data);
        head = head->next;
    }
    printf("NULL\n");
}

int main(void) {
    struct node *n1 = malloc(sizeof(struct node));
    struct node *n2 = malloc(sizeof(struct node));
    struct node *n3 = malloc(sizeof(struct node));

    n1->data = 10; n1->next = n2;
    n2->data = 20; n2->next = n3;
    n3->data = 30; n3->next = NULL;

    print_list(n1);

    free(n1); free(n2); free(n3);
    return 0;
}
'''

[[test_cases]]
input = ''
expected = '10 -> 20 -> 30 -> NULL'
+++

## Problem Statement

Implement a singly linked list node using a self-referential structure. Create three nodes, link them together (`n1 → n2 → n3 → NULL`), and write a function to traverse and print the list.

## Theory and Concepts

- A self-referential struct contains a pointer to its own type: `struct node { int data; struct node *next; }`.
- Each node stores data and a pointer to the next node; `NULL` marks the end.
- Traversal: start at `head`, follow `next` pointers until `NULL`.
- Insertion and deletion require careful pointer manipulation (updating the `next` of the previous node).
- Linked lists allow O(1) insertion/deletion at known positions but O(n) random access.

## Real World Application

Linked lists are used in OS kernel task queues, memory allocator free lists, hash table bucket chains, undo/redo functionality in editors, and as the foundation for stacks, queues, and adjacency lists in graph algorithms.

===EXPLANATION===

The self‑referential struct is the cornerstone of dynamic data structures in C. It seems paradoxical at first — how can a structure contain a pointer to its own type without infinite recursion? The trick is that the pointer doesn't contain the struct; it *points* to another, separate instance. This one idea unlocks linked lists, binary trees, hash tables with chaining, and adjacency lists. Historically, self‑referential structs appeared in the earliest C implementations of linked lists (circa 1972) and were formalized in K&R C. Alan Kay's PhD thesis "The Reactive Engine" (1969) used similar patterns for graph structures. The intuition is a scavenger hunt: each clue (node) tells you where to find the next clue. When you reach a clue that says "NULL", the hunt ends. In code, `struct node { int data; struct node *next; }` — every node holds its value and the address of the follower. Professional use is universal: the Linux kernel's `struct list_head` is an embedded doubly‑linked list used for process scheduling, file system caches, and device management. The glibc memory allocator maintains free‑list bins as linked lists of memory chunks. The `undo` stack in every text editor is a linked list of `struct edit_action`. Visually, imagine three boxes on a whiteboard: box A has `data=10` and an arrow to box B; box B has `data=20` and an arrow to box C; box C has `data=30` and an arrow written "NULL". The `head` pointer holds the address of box A, and traversal is just following arrows.

Key points:

. insertion and deletion at a known position are O
. — just redirect a pointer;
. random access is O(n) — you must walk the chain;
. you must manage memory manually (malloc/free);
. doubly‑linked lists add a `prev` pointer for O
. backward traversal;
. circular lists connect the tail back to the head.

References:
1. K&R C §6.5 ("Self‑referential Structures").
2. ISO C11 §6.7.2.1.
3. "Linux Kernel Development" by Robert Love covers the kernel's list implementation.
