+++
date = '2026-07-06T13:57:00+05:30'
draft = true
title = 'Basic Structures'
difficulty = 'easy'
language = 'c'
topic_weight = 0
subtopic_weight = 13
weight = 1
initial_code = '''#include <stdio.h>
#include <string.h>

struct student {
    int id;
    char name[50];
    float gpa;
};

int main(void) {
    struct student s1;
    s1.id = 1001;
    strcpy(s1.name, "Alice");
    s1.gpa = 3.8f;

    struct student s2 = {1002, "Bob", 3.5f};

    printf("Student 1: %d, %s, %.1f\n", s1.id, s1.name, s1.gpa);
    printf("Student 2: %d, %s, %.1f\n", s2.id, s2.name, s2.gpa);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Student records printed'
+++

## Problem Statement

Define a `struct student` with fields for ID (int), name (char array), and GPA (float). Create two instances — one by assigning fields individually, one with a brace-enclosed initializer. Print both records.

## Theory and Concepts

- A `struct` groups related data fields into a single composite type.
- Fields are accessed with `.` (dot) operator: `s1.id`.
- Structures can be initialized with braces: `struct student s2 = {1002, "Bob", 3.5f}`.
- Assignment of structs is allowed: `s1 = s2` copies all fields.
- Structures are passed by value to functions (the entire struct is copied).
- Use pointers to structs (`->` operator) to avoid copying large structs.

## Real World Application

Structures are used everywhere in C — representing points, rectangles, sensor readings, configuration parameters, network packets, file metadata, and database records. They are the primary mechanism for creating user-defined data types.

===EXPLANATION===

Before C introduced the struct, programmers kept related data in parallel arrays — matching indices across separate arrays like `id[i]`, `name[i]`, `gpa[i]`. A single off‑by‑one error could silently corrupt the whole dataset. The `struct` keyword, inherited from BCPL and formalized in Kernighan & Ritchie's C (1978), changed everything by binding conceptually related fields into a single composite type. Think of a struct like a physical filing folder: the folder holds the ID card, the name badge, and the GPA report as one unit you can pass around, copy, or file away without ever losing the association between them. In professional practice, structures are the primary data‑modelling tool in C. A network driver represents an Ethernet frame as `struct ethhdr` with destination MAC, source MAC, and EtherType fields. A database cursor bundles row ID, field count, and column values into a `struct row`. A physics engine groups position, velocity, and acceleration into a `struct rigid_body`. Visually, a struct occupies a contiguous block of memory where each field sits at a predetermined offset from the base address: `struct student` with `int id` (offset 0), `char name[50]` (offset 4), `float gpa` (offset 54) — totalling 58 bytes plus any alignment padding the compiler inserts. The dot operator `s1.id` tells the compiler to fetch an `int` from `base_address + 0`. Key insights: structs are value types, so assignment `s1 = s2` copies every byte — convenient but expensive for large structs; passing to a function by value triggers the same copy, so professionals pass pointers (using `->`) to avoid overhead; a struct cannot contain an instance of itself (that would create infinite recursion), but it can contain a pointer to its own type, which is the foundation of linked lists and trees. The C standard guarantees fields are laid out in declaration order, making structs reliable for binary I/O and protocol parsing. References: K&R C Chapter 6 ("Structures"); ISO C11 §6.7.2.1; "The C Programming Language" by Kernighan & Ritchie remains the definitive treatment.
