+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'Structures and Unions for Hardware Access'
difficulty = 'medium'
language = 'c'
topic_weight = -18
subtopic_weight = 3
weight = 3
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Demonstrates struct and union memory layout and sizeof behavior.
 */
#include <stdio.h>
#include <stdint.h>

struct pixel {
    unsigned char red;
    unsigned char green;
    unsigned char blue;
};

union word_byte {
    uint32_t word;
    uint8_t  bytes[4];
};

int main(void) {
    printf("sizeof(struct pixel) = %zu\\n", sizeof(struct pixel));
    printf("sizeof(union word_byte) = %zu\\n", sizeof(union word_byte));

    struct pixel p = {255, 0, 0};  // red pixel
    printf("RGB(%d, %d, %d)\\n", p.red, p.green, p.blue);

    union word_byte wb;
    wb.word = 0x12345678;
    printf("Bytes: %02x %02x %02x %02x\\n",
           wb.bytes[0], wb.bytes[1], wb.bytes[2], wb.bytes[3]);

    return 0;
}
'''
+++

## Problem Statement

How can C structures be used to model hardware peripherals and their memory-mapped registers? What is the difference between struct and union in terms of memory layout, and when should each be used?

## Theory and Concepts

- **Struct**: Groups multiple variables (possibly of different types) into a single compound type. Members are laid out sequentially in memory, with possible padding between members for alignment.
- **Struct padding**: The compiler may insert padding bytes between struct members to satisfy alignment requirements. On RISC-V, a `uint32_t` member must be 4-byte aligned. If a `uint8_t` is followed by a `uint32_t`, 3 padding bytes are inserted. The `__attribute__((packed))` or `__packed` qualifier suppresses padding, but unaligned access may be slower or fault on some architectures.
- **Bit fields**: Allow specifying the exact number of bits for a struct member. Useful for hardware registers where control bits are packed into a single word. Syntax: `type name : width;`. Bit fields may reduce portability due to implementation-defined layout.
- **Union**: Stores all members at the same starting address. The size of a union is the size of its largest member. Used for type punning (interpreting the same bytes as different types) and for saving space when only one variant is used at a time.
- **Struct overlay for registers**: A struct with members matching the register layout of a peripheral can be cast to the peripheral's base address, giving clean member-access syntax for hardware registers.

## Real World Application

The struct overlay technique is the standard way to access hardware peripherals in embedded C. Every CMSIS header file for ARM Cortex-M microcontrollers uses structs to define peripheral register maps. The Linux kernel uses the same pattern for device tree-mapped MMIO regions. Without this technique, accessing a UART's baud rate divisor would require error-prone manual offset calculations scattered throughout the code.

===EXPLANATION===

## Generating 24x24 Red Square BMP Image

Structures provide a way to group data of different types into a single compound type, just as words, sentences, and paragraphs group letters to express complex ideas. The `struct` keyword defines a blueprint where each member is laid out sequentially in memory. The `union` keyword is similar but all members share the same starting address — its size is that of the largest member.

<figure id="fig-1" class="fig-center">
  <img src="/images/embedded-101/c-language/struct-pixel.jpeg" alt="Struct Layout">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> Struct memory layout showing pixel data structure with three unsigned char members</figcaption>
</figure>

A struct's memory layout is determined by its member declarations in order. Consider `struct pixel { unsigned char red; unsigned char green; unsigned char blue; };` — each member is 1 byte, no alignment issues, total size = 3 bytes. But if we add a `uint32_t alpha;` after the three bytes, the compiler aligns `alpha` to a 4-byte boundary, inserting 1 byte of padding after `blue` (sizeof = 8 bytes total). The `__attribute__((packed))` directive suppresses this padding to create exact bit-level layouts, at the cost of potentially slower unaligned access.

The `typedef` keyword allows us to rename a struct so we don't have to write `struct pixel` every time. For example: `typedef struct { unsigned char red; unsigned char green; unsigned char blue; } pixel_t;` allows declaring variables as `pixel_t p;` without the `struct` keyword.

A practical example of structs is reading the BMP image file format. The first two bytes of a BMP file are the signature 'BM' or 'BA'. The next 4 bytes store the file size, then 4 reserved bytes, then a 4-byte data offset. This pattern continues through the DIB header, color palette, and pixel data. We can model the entire BMP header as a struct with exact field widths:

```c
typedef struct {
    char         signature[2];
    unsigned int file_size;
    unsigned int reserved;
    unsigned int data_offset;
} __attribute__((packed)) bmp_file_header;
```

The pixel data in a 24-bit BMP is stored as rows of RGB values, where each row is padded to a multiple of 4 bytes. A 24x24 red square BMP image can be generated programmatically by:
1. Defining the header struct with `__attribute__((packed))` to match the file format exactly
2. Creating a 2D array of pixel structs for the image data
3. Setting all pixels to RGB(255, 0, 0) — maximum red, zero green and blue
4. Writing the entire struct to a file using `fwrite()`

The full BMP header can be modeled as a nested structure that captures both the file header and the DIB (Device Independent Bitmap) header:

```c
typedef struct {
  struct {
      char           signature[2];
      unsigned int   file_size;
      unsigned int   reserved;
      unsigned int   data_offset;
  } __attribute__((packed)) header;
  struct {
      unsigned int   dib_size;
      signed   int   width;
      signed   int   height;
      unsigned short num_of_planes;
      unsigned short bits_per_pixel;
      unsigned int   compression;
      unsigned int   image_size;
      signed   int   x_resolution;
      signed   int   y_resolution;
      unsigned int   num_of_colors;
      unsigned int   important_colors;
  } __attribute__((packed)) dib_header;
} __attribute__((packed)) bmp_header;
```
*Caption: BMP file header expressed as a structure — the __attribute__((packed)) ensures exact bit-level alignment.*

For the color palette (empty in 24-bit mode) and each pixel:

```c
typedef struct {
  /* Nothing */
} __attribute__((packed)) color_palette;

typedef struct {
  unsigned char blue;
  unsigned char green;
  unsigned char red;
} __attribute__((packed)) pixel;
```
*Caption: Structures to represent the color palette and pixel data. pixel uses 3 bytes (one per color channel).*

The complete header file combining all type definitions:

```c
#include <stdio.h>
#include <string.h>

#define SQUARE_SIZE 24

typedef struct {
    struct {
        char         signature[2];
        unsigned int file_size;
        unsigned int reserved;
        unsigned int data_offset;
    } __attribute__((packed)) header;
    struct {
        unsigned int dib_size;
        signed   int width;
        signed   int height;
        unsigned short num_planes;
        unsigned short bpp;
        unsigned int compression;
        unsigned int image_size;
        signed   int x_ppm;
        signed   int y_ppm;
        unsigned int num_colors;
        unsigned int important_colors;
    } __attribute__((packed)) dib_header;
} __attribute__((packed)) bmp_header;

typedef struct {
    /* Nothing */
} __attribute__((packed)) color_palette;

typedef struct {
    unsigned char blue;
    unsigned char green;
    unsigned char red;
} __attribute__((packed)) pixel;

typedef struct {
    bmp_header file_header;
    color_palette palette;
    pixel pixel_data[SQUARE_SIZE][SQUARE_SIZE];
} __attribute__((packed)) image;
```
*Caption: bmp.h file containing all of the datatype declarations — headers, palette, pixel, and the complete image structure.*

The `main.c` file uses these types to generate a 24x24 red square BMP:

```c
#include "bmp.h"

int main() {
  image o_file;

  // initialize the BMP header and DIB header
  o_file.file_header.header.signature[0]         = 'B';
  o_file.file_header.header.signature[1]         = 'M';
  o_file.file_header.header.file_size            = sizeof(o_file);
  o_file.file_header.header.reserved             = 0;
  o_file.file_header.header.data_offset          = sizeof(o_file.file_header);
  o_file.file_header.dib_header.dib_size         = sizeof(o_file.file_header.dib_header);
  o_file.file_header.dib_header.width            = SQUARE_SIZE;
  o_file.file_header.dib_header.height           = SQUARE_SIZE;
  o_file.file_header.dib_header.num_planes       = 1;
  o_file.file_header.dib_header.bpp              = sizeof(pixel) * 8;
  o_file.file_header.dib_header.compression      = 0;
  o_file.file_header.dib_header.image_size       = sizeof(o_file.pixel_data);
  o_file.file_header.dib_header.x_ppm            = 0;
  o_file.file_header.dib_header.y_ppm            = 0;
  o_file.file_header.dib_header.num_colors       = 0;
  o_file.file_header.dib_header.important_colors = 0;

  // generate the pixel data
  for (int x = 0; x < SQUARE_SIZE; x++) {
    for (int y = 0; y < SQUARE_SIZE; y++) {
      o_file.pixel_data[x][y].blue  = 0;
      o_file.pixel_data[x][y].green = 0;
      o_file.pixel_data[x][y].red = 255;
    }
  }

  // write the BMP file
  FILE *file = fopen("red-square.bmp", "wb");
  if (file == NULL) {
    printf("Error: could not create file.\n");
    return 1;
  }

  fwrite(&o_file, sizeof(o_file), 1, file);
  fclose(file);
  return 0;
}
```
*Caption: main.c file with C program to generate a 24x24 red square as a BMP file.*

<figure id="fig-2" class="fig-right">
  <img src="/images/embedded-101/c-language/dir.png" alt="Directory Listing">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> Directory listing after compiling and running the BMP generator program</figcaption>
</figure>

<figure id="fig-3" class="fig-right">
  <img src="/images/embedded-101/c-language/file-info.png" alt="File Info">
  <figcaption><a href="#fig-3" class="fig-link">Figure 3:</a> File info for the generated red-square.bmp — type is Windows BMP Image</figcaption>
</figure>

<figure id="fig-4" class="fig-right">
  <img src="/images/embedded-101/c-language/preview-color.png" alt="Preview Color">
  <figcaption><a href="#fig-4" class="fig-link">Figure 4:</a> Color properties of the BMP — 24 bits per pixel (8 per channel), 24x24 resolution</figcaption>
</figure>

<figure id="fig-5" class="fig-center">
  <img src="/images/embedded-101/c-language/preview.png" alt="Preview">
  <figcaption><a href="#fig-5" class="fig-link">Figure 5:</a> The generated red-square.bmp opened in an image viewer</figcaption>
</figure>

## Compiling, Running and Viewing the Output

Compile and run the BMP generator:

```bash
$ ls
bmp.h  main.c
$ gcc main.c
$ ls
a.out  bmp.h  main.c
$ ./a.out
$ ls
a.out  bmp.h  main.c  red-square.bmp
```
*Caption: Listing, compiling, and executing the program — the red-square.bmp file is generated.*

For memory-mapped register access, we must ensure the struct layout exactly matches the hardware register layout. The 16550 UART has registers at offsets 0, 1, 2, 3, 4, 5, 6, 7 — all 1 byte wide with no gaps. A packed struct with `volatile uint8_t` members maps perfectly:

```c {title="16550-uart-struct.c"}
#include <stdint.h>

typedef volatile uint8_t reg8_t;

typedef struct {
    reg8_t thr;   /* 0: Transmit Holding Register (write) */
    reg8_t ier;   /* 1: Interrupt Enable Register */
    reg8_t fcr;   /* 2: FIFO Control Register (write) */
    reg8_t lcr;   /* 3: Line Control Register */
    reg8_t mcr;   /* 4: Modem Control Register */
    reg8_t lsr;   /* 5: Line Status Register */
    reg8_t msr;   /* 6: Modem Status Register */
    reg8_t scr;   /* 7: Scratch Register */
} uart_t;

#define UART ((uart_t*)0x10000000)

void uart_init(void) {
    UART->lcr = 0x83;     /* 8N1 + DLAB = 1 */
    UART->thr = 1;        /* divisor low byte */
    UART->ier = 0;        /* divisor high byte */
    UART->lcr = 0x03;     /* 8N1, DLAB = 0 */
    UART->fcr = 0x07;     /* enable FIFO, clear */
}
```

Bit fields are used when a hardware register packs multiple flags into a single word. For example, the RISC-V `mstatus` register has fields like `MIE` (bit 3), `MPIE` (bit 7), and `MPP` (bits 12:11). A bit field struct can model this:

```c
struct mstatus {
    unsigned long mie  : 1;   /* bit 3 */
    unsigned long      : 3;   /* padding */
    unsigned long mpie : 1;   /* bit 7 */
    unsigned long      : 4;   /* padding */
    unsigned long mpp  : 2;   /* bits 12:11 */
};
```

Unions are invaluable for type punning in embedded systems. For example, interpreting a 32-bit register as four 8-bit values:

```c
union reg32 {
    uint32_t word;
    uint8_t  bytes[4];
    struct {
        uint8_t b0, b1, b2, b3;
    };
};
```

References: K&R Ch. 6 (Structures); ISO C99 Standard §6.7.2.1 (Structure and union specifiers). For struct overlay in embedded: "Embedded C" by Michael Barr, Ch. 4 (Using Structures to Map Peripherals). ARM CMSIS-Core documentation for peripheral struct definitions.

===QUIZ===

## Why must a struct used for memory-mapped register access typically be declared `__packed`?
- [ ] To make the code execute faster
- [x] To prevent the compiler from inserting padding bytes between members that would shift register offsets
- [ ] To align the struct to a 4-byte boundary
- [ ] To enable bit field operations
Correct: B
Explanation: The compiler may insert padding bytes between struct members to satisfy alignment requirements (e.g., 3 bytes between a uint8_t and a uint32_t). For hardware register overlays, the struct layout must exactly match the register offsets — any padding would misalign all subsequent register accesses. Packed structs suppress this padding.

## What is the size of `union { uint32_t w; uint8_t b[4]; uint16_t h[2]; }`?
- [ ] 10
- [ ] 7
- [x] 4
- [ ] 8
Correct: C
Explanation: The size of a union is the size of its largest member. Here, `uint32_t` is 4 bytes, `uint8_t[4]` is 4 bytes, and `uint16_t[2]` is 4 bytes. All members are the same size (4 bytes), so the union occupies 4 bytes total.

## What is struct padding and why does it occur?
- [ ] It is extra space added by the programmer for safety
- [x] The compiler inserts padding bytes between struct members to satisfy alignment requirements (e.g., a `uint32_t` must be 4-byte aligned)
- [ ] It is used to encrypt the struct data
- [ ] Padding only occurs in unions, not structs
Correct: B
Explanation: The compiler may insert unused bytes (padding) between struct members to ensure each member is aligned to its natural boundary. For example, if a `uint8_t` (1 byte) is followed by a `uint32_t` (4 bytes), 3 padding bytes are inserted so the `uint32_t` starts at a 4-byte-aligned address.

## How does `typedef` work with structs in C, and what is its benefit?
- [x] `typedef` creates a new data type; it allows declaring variables without the `struct` keyword
- [ ] `typedef` allocates memory for a struct
- [ ] `typedef` is used only with primitive types
- [ ] `typedef` initializes a struct to zero
Correct: A
Explanation: `typedef` creates an alias for an existing type. When used with a struct, e.g., `typedef struct { ... } pixel_t;`, it allows declaring variables as `pixel_t p;` instead of `struct pixel p;`, making the code cleaner and more readable.

## What are bit fields in C used for?
- [x] They allow specifying the exact number of bits for a struct member, ideal for packing hardware register flags
- [ ] They create bitmaps in memory
- [ ] They are used for bitwise operations on integers
- [ ] They improve the speed of arithmetic operations
Correct: A
Explanation: Bit fields allow specifying the exact bit width of struct members using the `: N` syntax (e.g., `unsigned char flag : 1;`). This is essential for modeling hardware registers where control/status bits are packed into a single word, as in the LSR register of a UART.

## What is the `->` operator in C?
- [ ] It is the subtraction operator
- [x] It is the structure pointer dereference operator — equivalent to `(*struct_ptr).member`
- [ ] It is a bitwise NOT operator
- [ ] It is used for array indexing
Correct: B
Explanation: The `->` operator provides shorthand access to members of a struct through a pointer. `uart->thr` is equivalent to `(*uart).thr`. The `->` operator makes it clear that the left operand is a pointer to a struct rather than a struct value.

## How does the BMP file format example demonstrate the struct overlay technique?
- [ ] By using pointers to write to hardware registers
- [x] By modeling the BMP file header as a C struct with `__attribute__((packed))` to match the exact binary format of the file
- [ ] By using assembly code to read the file
- [ ] By creating a dynamic array of bytes
Correct: B
Explanation: The BMP example models the file header as a packed C struct with fields matching the file format specification exactly (signature, file_size, width, height, etc.). The entire image, including pixel data, is stored in a struct and written to disk with a single `fwrite()`, demonstrating how structs can represent complex binary data layouts.
