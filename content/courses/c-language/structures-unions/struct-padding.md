+++
date = '2026-07-06T14:02:00+05:30'
draft = true
title = 'sizeof and Structure Padding'
difficulty = 'medium'
language = 'c'
topic_weight = 0
subtopic_weight = 13
weight = 6
initial_code = '''#include <stdio.h>
#include <stddef.h>

struct packed_struct {
    char a;  // 1 byte
    int b;   // 4 bytes
    char c;  // 1 byte
};

struct ordered_struct {
    int b;   // 4 bytes
    char a;  // 1 byte
    char c;  // 1 byte
};

int main(void) {
    printf("Packed struct size: %zu\n", sizeof(struct packed_struct));
    printf("Ordered struct size: %zu\n", sizeof(struct ordered_struct));
    printf("Offsets: a=%zu, b=%zu, c=%zu\n",
           offsetof(struct packed_struct, a),
           offsetof(struct packed_struct, b),
           offsetof(struct packed_struct, c));

    return 0;
}
'''

[[test_cases]]
input = ''
expected = 'Struct padding demonstrated'
+++

## Problem Statement

Define two structs with the same members but in different order. Use `sizeof` and `offsetof` to show how member ordering affects the total struct size due to alignment padding. Explain why reordering members can reduce waste.

## Theory and Concepts

- The compiler may add padding between members to satisfy alignment requirements.
- Alignment: an `int` (4 bytes) must be at an address divisible by 4.
- `offsetof(type, member)` returns the byte offset of a member within the struct.
- Reordering members from largest to smallest minimizes padding (the "large-to-small" rule).
- The struct's total size is padded to be a multiple of the largest member's alignment.
- `#pragma pack` can force packed layout (at the cost of alignment-optimized access).

## Real World Application

Structure padding matters in memory-constrained systems (embedded devices with KB of RAM), network protocols (packed structs for wire format), file format parsing, and when sharing binary data between different compilers or architectures.

===EXPLANATION===

Structure padding is one of C's most surprising behaviours: two structs with identical members can have different sizes depending on the order of those members. This happens because CPUs don't read memory byte‑by‑byte — they fetch aligned words (4 or 8 bytes at a time). An `int` at an odd address requires two bus cycles to read instead of one. The C standard allows compilers to insert unused bytes (padding) between members to ensure each field is naturally aligned to its size boundary. Historically, this aligned‑access requirement comes from early RISC architectures (MIPS, SPARC) that simply crashed on misaligned access. x86 tolerates misaligned loads but pays a performance penalty. The intuition is a parking garage: compact cars (char) can park in any spot, but SUVs (int) need two consecutive spots starting at an even row number. If you park a compact car at spot 1 and an SUV at spot 2, the SUV spans rows 2–3 (fine). But if you park the compact at spot 3 and the SUV at spot 4, the SUV starts at an odd spot and the parking attendant (CPU) has to shuffle (two reads). The attendant works faster when SUVs always start at even spots — so the struct layout inserts an empty spot after the compact car at spot 3 to move the SUV to spot 4. In `struct packed_struct { char a; int b; char c; }`, the compiler pads after `a` (3 bytes) and after `c` (3 bytes to make total a multiple of 4), yielding 12 bytes. Reorder to `struct ordered_struct { int b; char a; char c; }` — no padding needed between the chars (they pack in 2 bytes), then 2 bytes of padding at the end to reach 8 bytes total. The rule: order members from largest to smallest alignment requirement. `offsetof(type, member)` reveals the compiler's decisions. In practice, embedded firmware developers use `__attribute__((packed))` or `#pragma pack(1)` to force byte‑packed layouts matching hardware register maps and protocol wire formats — at the cost of misaligned access penalties. Key points: padding is implementation‑defined (compiler decides), not standard‑mandated; the struct's total size is padded to be a multiple of its strictest alignment; large structs in arrays amplify waste (each copy gains padding); never assume two compilers will lay out the same struct identically. References: ISO C11 §6.7.2.1 (structure layout); "The Lost Art of Structure Packing" by Eric S. Raymond (an excellent deep dive); "Computer Organization and Design" by Patterson & Hennessy for alignment fundamentals.
