+++
date = '2026-07-06T13:58:00+05:30'
draft = true
title = 'Nested Structures'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 13
weight = 2
initial_code = '''#include <stdio.h>

struct address {
    const char *street;
    const char *city;
    int zip;
};

struct person {
    const char *name;
    int age;
    struct address addr;
};

int main(void) {
    struct person p = {
        "Charlie",
        30,
        {"123 Main St", "Springfield", 12345}
    };

    printf("Name: %s\n", p.name);
    printf("City: %s\n", p.addr.city);
    printf("Zip: %d\n", p.addr.zip);

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Nested structure fields printed'
+++

## Problem Statement

Define two structures where one contains the other as a field (`struct address` inside `struct person`). Initialize a fully nested instance with a single brace-enclosed initializer and access the nested fields using the `.` operator twice (e.g., `p.addr.city`).

## Theory and Concepts

- Structures can contain other structures as members (nesting).
- Nested member access: `outer.inner.field`.
- Initialization uses nested braces: `{name, age, {street, city, zip}}`.
- There is no limit to nesting depth (but readability suffers beyond 2–3 levels).
- Self-referential structures (containing a pointer to their own type) are the basis for linked lists and trees.

## Real World Application

Nested structures model real-world hierarchical data — a `car` has an `engine`, an `engine` has a `pistons` array; a `customer` record contains an `address`, and that address contains a `country`. This mirrors how data is organized in databases and JSON/XML.

===EXPLANATION===

As C programs grew from small utilities to full operating systems and databases, developers needed to model hierarchical relationships. A person doesn't just have a name and age — they have an address, and an address has a street, city, and zip. Early C code flattened these into long field names like `person_street`, `person_city`, `person_zip`. Nested structures emerged as the natural solution: compose a `struct address`, then embed it inside `struct person`. The insight is that composition mirrors the real world — a car *has an* engine, an engine *has* cylinders. In object‑oriented terms, this is "has‑a" composition, and C achieves it purely with struct nesting. Professional examples abound: a JSON parser represents values as a `struct json_value` that can contain a `struct json_object` with an array of `struct json_member`; a GUI toolkit nests `struct widget` inside `struct window` inside `struct screen`; a device driver nests `struct usb_device` containing `struct usb_interface` containing `struct usb_endpoint`. Visually, a nested struct is like a Russian nesting doll: `p.addr.city` walks the memory offsets — first to the `addr` field (which itself is a struct), then to the `city` field within that substruct. The C standard guarantees inner fields are laid out in order within the outer struct, so the offset calculations are deterministic. The dot operator chains naturally: `p.addr.city` reads as "the city field of the addr field of p". Designated initializers (C99) make nested initialization self‑documenting: `.addr.city = "Springfield"` instead of positional guessing. Key points: nesting depth is unlimited in theory but rarely exceeds three levels in practice; nested structs are value types, so `p1 = p2` copies the entire tree; passing a deeply nested struct by value can be expensive — use pointers; the arrow operator `->` works through nesting too: `pp->addr->city` when you have pointers. References: K&R C §6.2 discusses structs and nesting; ISO C11 §6.7.2.1; "C Interfaces and Implementations" by David Hanson demonstrates hierarchical struct design in practice.
