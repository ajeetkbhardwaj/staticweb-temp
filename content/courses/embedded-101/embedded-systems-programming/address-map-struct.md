+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'Address Map and Struct Mapping for Memory-Mapped I/O'
difficulty = 'hard'
language = 'c'
topic_weight = -17
subtopic_weight = 4
weight = 4
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: UART register map struct for 16550-compatible UART on QEMU virt.
 */
typedef struct {
    volatile uint8_t thr;
    volatile uint8_t ier;
    volatile uint8_t fcr;
    volatile uint8_t lcr;
    volatile uint8_t lsr;
} uart_t;

#define UART ((uart_t*)0x10000000)'''
+++

## Problem Statement

How do you access hardware peripherals from C code? How can C struct definitions map directly onto memory-mapped device registers?

## Theory and Concepts

**Memory-mapped I/O (MMIO):** Peripherals are accessed by reading and writing specific memory addresses. Each register of a peripheral is assigned an offset from a base address. In the QEMU virt machine, the 16550 UART is at base address 0x10000000.

**The volatile keyword:** When accessing hardware registers, the compiler must not optimize away reads or writes. The `volatile` qualifier tells the compiler that a variable may change outside the normal program flow (e.g., by hardware), preventing unwanted optimizations.

**Struct overlay technique:** A C struct whose members correspond to the register layout of a peripheral can be cast to the peripheral's base address. The struct layout rules and packing must match the hardware register ordering.

**Bit manipulation:** Peripheral registers often control individual features via single bits. Bitfields and bitwise operations (AND, OR, shift) are used to set, clear, and test specific bits.

## Real World Application

Every embedded C codebase that interacts with hardware uses MMIO struct mapping. The CMSIS standard for ARM Cortex-M defines structs for every vendor's peripherals. Linux kernel drivers use similar struct overlays for device tree-mapped MMIO regions. Understanding this technique lets you write clean, readable driver code instead of scattering magic-number pointer dereferences throughout your application.

===EXPLANATION===

## Memory Mapped I/O

A CPU with a 32-bit PC can generate addresses from 0x00000000 to 0xFFFFFFFF (4 GB range). Not all of these addresses map to actual memory — the range is divided into regions, each dedicated to different blocks that the CPU may interact with. This is called the Address Space or Address Map. Every embedded system has one, and the first step when working with a new system is to consult the technical manual for its address map.

<figure id="fig-1" class="fig-right">
  <img src="/images/embedded-101/embedded-systems-programming/addr_map.png" alt="Address Map">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> Memory address map showing regions dedicated to peripherals and actual memory</figcaption>
</figure>

### Address Map/Space

The QEMU RISC-V virt board has a well-defined address map. Some regions worth noting:
- **DRAM** at 0x80000000: where we load our code and where read/write operations go to actual memory
- **UART0** at 0x10000000: a communication block for sending and receiving ASCII characters
- **RTC** at 0x00101000: a real-time clock
- **CLINT** and **PLIC**: interrupt management blocks
- **FLASH** at 0x20000000: non-volatile storage

<figure id="fig-2" class="fig-center">
  <img src="/images/embedded-101/embedded-systems-programming/io_map_peripheral.png" alt="I/O Map Peripheral">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> CPU floats the data address to the interconnect which routes transactions to different blocks</figcaption>
</figure>

## Peripheral

Peripherals are blocks of digital logic that have an effect on the external world. To light an LED, you connect it to a GPIO pin and write to the GPIO's address range. To send characters over a serial connection, you use the UART block. The CPU interacts with peripherals by reading and writing specific memory addresses — this is called Memory-Mapped I/O (MMIO).

<figure id="fig-3" class="fig-right">
  <img src="/images/embedded-101/embedded-systems-programming/uart_connection.jpeg" alt="UART Connection">
  <figcaption><a href="#fig-3" class="fig-link">Figure 3:</a> UART TX/RX connection from the SoC to an external terminal</figcaption>
</figure>

### Basics of UART

The UART has a transmit (TX) and receive (RX) line. The CPU interacts with the UART by reading and writing its registers, which are mapped to specific addresses in the memory map.

### Config and Status Registers (CSRs)

The struct overlay technique works because memory-mapped registers appear at fixed addresses. By defining a struct with members at the same offsets and sizes as the hardware registers, we can create a pointer to the struct at the peripheral's base address and access registers as struct members. For the 16550 UART, the Transmit Holding Register (THR) is at offset 0, the Interrupt Enable Register (IER) at offset 1, the FIFO Control Register (FCR) at offset 2, the Line Control Register (LCR) at offset 3, and the Line Status Register (LSR) at offset 5. A packed struct with `volatile uint8_t` members at these offsets maps perfectly.

### volatile

The `volatile` qualifier is essential. Consider `UART->thr = 'A';` — without volatile, the compiler might cache the struct in registers and never actually write to memory. With volatile, each access generates an explicit load or store instruction. This is critical for read-modify-write operations on registers like the Line Control Register (LCR), where we set the Divisor Latch Access Bit (DLAB, bit 7) before writing the baud rate divisors.

To see the effect of `volatile` on generated assembly, compile two versions of a function — one with `volatile int a = 10; a++;` and one with plain `int a = 10; a++;`. With optimization level -O1, the non-volatile version may optimize the entire operation away (just returns 0), while the volatile version generates actual `lw` and `sw` instructions to read, modify, and write back the value to memory.

### const

The `const` qualifier is used for read-only registers. Writing to a `const`-qualified variable through direct assignment causes a compile error. However, indirect modification through a pointer cast (e.g., `int *aptr = (int*)&const_var; *aptr = 20;`) is legal — C trusts the programmer to know what they are doing. This is why careful coding practices are essential in embedded C.

### volatile

The `volatile` keyword ensures that every read or write to a variable generates an actual load or store instruction. Consider the difference between code with and without `volatile`:

```c
int without_volatile() {
  int a = 10;
  a++;
  return 0;
}

int with_volatile() {
  volatile int a = 10;
  a++;
  return 0;
}
```
*Caption: Same code with and without the volatile keyword — volatile.c.*

Compile with optimization to see the difference:

```bash
$ riscv64-unknown-elf-gcc -O1 -nostdlib -nostartfiles -ffreestanding -march=rv32i -mabi=ilp32 -S volatile.c
```
*Caption: Compiling volatile.c with optimization level 1.*

The generated assembly shows that the non-volatile version optimizes away the `a++` operation:

```asm
without_volatile:
  li	a0,0
  ret

with_volatile:
  addi	sp,sp,-16
  li	a5,10
  sw	a5,12(sp)
  lw	a5,12(sp)
  addi	a5,a5,1
  sw	a5,12(sp)
  li	a0,0
  addi	sp,sp,16
  jr	ra
```
*Caption: Generated assembly — without_volatile is optimized away; with_volatile generates actual lw/sw instructions.*

### const

The `const` qualifier prevents direct modification of a variable after initialization. Writing to a const variable directly causes a compile error:

```c
int main() {
  const int a = 10;
  a = 20;

  return 0;
}
```
*Caption: const.c — direct write to a const variable after declaration is illegal.*

The compiler error for this code:

```bash
$ gcc const.c
const.c:3:5: error: cannot assign to variable 'a' with const-qualified type 'const int'
  a = 20;
  ~ ^
```
*Caption: Compiler error for attempting to modify a const variable.*

However, indirect modification through a pointer cast is allowed by the compiler:

```c
int main() {
  const int a = 10;
  int *aptr = (int *)&a;
  *aptr = 20;

  return 0;
}
```
*Caption: Updating a const variable using a pointer — compiles without error.*

```bash
$ gcc const.c
$
```
*Caption: The sneaky update compiles silently — C trusts the programmer.*

### CSRs and Struct

A complete UART struct definition uses `union` for registers that have different meanings depending on read vs write (THR for transmit, RHR for receive), `bitfield` structs for status registers where individual bits have meaning, and `volatile const` for read-only status bits:

```c
typedef struct {
  /* offset 0x0 */
  union {
    volatile unsigned char thr;        // Transmit Holding Register
    volatile const unsigned char rhr;  // Receive Holding Register
  };

  /* skip offset 0x1, 0x2, 0x3, 0x4 */
  volatile unsigned char ignore0[4];   // Ignoring 4 CSRs!

  /* offset 0x5 */
  union{
    struct {
      volatile const unsigned char data_ready:1;       // bit 0
      volatile const unsigned char overrun_err:1;      // bit 1
      volatile const unsigned char parity_err:1;       // bit 2
      volatile const unsigned char framing_err:1;      // bit 3
      volatile const unsigned char break_interrupt:1;  // bit 4
      volatile const unsigned char thr_empty:1;        // bit 5
      volatile const unsigned char tx_empty:1;         // bit 6
      volatile const unsigned char fifo_data_err:1;     // bit 7
    } __attribute__((packed));
    volatile const unsigned char b;
  } lsr;                               // Line Status Register

  /* skip offset 0x6 and 0x7 */
  volatile unsigned char ignore1[2];   // Ignoring 2 bytes!
} __attribute__((packed)) uart_t;
```
*Caption: UART struct representing the CSR address space of the 16550 UART — bitfields for individual status bits, union for THR/RHR sharing, and volatile for correct memory access.*

Bit manipulation is closely related: hardware registers encode multiple flags in a single byte or word. The Line Status Register (LSR) has bit 5 (THR empty) indicating the transmitter is ready for more data. The classic UART transmit loop polls this bit: `while (!(UART->lsr & (1 << 5)));`. Combined with struct mapping, this produces highly readable driver code that directly reflects the hardware documentation.

Every embedded C codebase that interacts with hardware uses MMIO struct mapping. The CMSIS standard for ARM Cortex-M defines structs for every vendor's peripherals. Linux kernel drivers use similar struct overlays for device tree-mapped MMIO regions. Understanding this technique lets you write clean, readable driver code instead of scattering magic-number pointer dereferences throughout your application.

===CODE===

```c {title="uart.h"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: UART register map and driver header for 16550 UART on QEMU virt.
 */
#ifndef UART_H
#define UART_H

#include <stdint.h>

typedef struct {
    volatile uint8_t thr;  /* Transmit Holding Register (write, offset 0) */
    volatile uint8_t ier;  /* Interrupt Enable Register (offset 1) */
    volatile uint8_t fcr;  /* FIFO Control Register (write, offset 2) */
    volatile uint8_t lcr;  /* Line Control Register (offset 3) */
    volatile uint8_t mcr;  /* Modem Control Register (offset 4) */
    volatile uint8_t lsr;  /* Line Status Register (read, offset 5) */
    volatile uint8_t msr;  /* Modem Status Register (read, offset 6) */
} uart_t;

#define UART_BASE ((uart_t*)0x10000000)

/* Line Control Register bits */
#define LCR_DLAB  (1 << 7)
#define LCR_8N1   (3 << 0)

/* Line Status Register bits */
#define LSR_THR_EMPTY (1 << 5)

void uart_putc(char c);
void uart_init(void);

#endif
```

```c {title="uart.c"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: UART driver implementation for 16550 UART.
 */
#include "uart.h"

void uart_init(void) {
    uart_t *uart = UART_BASE;

    uart->lcr = LCR_DLAB;
    uart->thr = 1;
    uart->ier = 0;
    uart->lcr = LCR_8N1;

    uart->fcr = 0x07;
}

void uart_putc(char c) {
    uart_t *uart = UART_BASE;

    while (!(uart->lsr & LSR_THR_EMPTY));

    uart->thr = c;
}
```

```asm {title="start.S"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Minimal startup code for bare-metal RISC-V.
 */
.section .init
.globl _start
_start:
    la sp, _STACK_TOP_
    jal main
loop:
    j loop
```

```makefile {title="Makefile"}
# Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
# All Rights Reserved.
#
# Description: Build system for UART driver project.
CC = riscv64-unknown-elf-gcc
CFLAGS = -march=rv64gc -mabi=lp64d -O2 -Wall -nostdlib -nostartfiles
LDFLAGS = -T link.ld

all: program.elf

program.elf: start.o uart.o
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $^

start.o: start.S
	$(CC) $(CFLAGS) -c -o $@ $<

uart.o: uart.c uart.h
	$(CC) $(CFLAGS) -c -o $@ $<

clean:
	rm -f *.o program.elf

run: program.elf
	qemu-system-riscv64 -nographic -machine virt -kernel program.elf
```

```ld {title="link.ld"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Linker script for bare-metal RISC-V QEMU virt machine.
 */
OUTPUT_ARCH(riscv)

MEMORY
{
    RAM (rwx) : ORIGIN = 0x80000000, LENGTH = 64M
}

SECTIONS
{
    . = ORIGIN(RAM);

    _STACK_TOP_ = ORIGIN(RAM) + LENGTH(RAM);

    .init : {
        *(.init)
    } > RAM

    .text : {
        *(.text)
    } > RAM

    .rodata : {
        *(.rodata)
    } > RAM

    .data : {
        *(.data)
    } > RAM

    .bss : {
        *(.bss)
    } > RAM
}
```

===QUIZ===

## Why is the `volatile` keyword necessary when accessing memory-mapped registers?

- [ ] It makes register access faster
- [x] It prevents the compiler from optimizing away repeated reads or writes that have side effects
- [ ] It automatically aligns struct members to hardware register boundaries
- [ ] It enables bitfield operations on registers

Correct: B
Explanation: Hardware register accesses have side effects (e.g., reading a status register clears bits, writing a transmit register sends data). Volatile forces the compiler to generate a load/store for every access rather than optimizing them away.

## What is the base address of the 16550 UART on the QEMU RISC-V virt machine?

- [ ] 0x80000000
- [ ] 0x80200000
- [x] 0x10000000
- [ ] 0x10001000

Correct: C
Explanation: The QEMU virt machine maps the 16550 UART at physical address 0x10000000. This is defined by the QEMU hardware model and documented in the virt machine's memory map.

## What is an address map (or address space) in an embedded system?
- [ ] A diagram showing the physical location of chips on a PCB
- [x] The division of the CPU's addressable range into regions dedicated to memory and peripherals
- [ ] A list of all instructions the CPU supports
- [ ] The layout of pins on the microcontroller package
Correct: B
Explanation: The address space divides the CPU's total addressable range (e.g., 0x00000000 to 0xFFFFFFFF for a 32-bit CPU, 4 GB) into regions. Some regions map to actual memory (RAM/Flash), while others map to peripheral registers (UART, GPIO, timers). The technical manual specifies this mapping.

## In the QEMU RISC-V virt board's memory map, what are DRAM, UART0, CLINT, and PLIC?
- [ ] They are programming languages
- [x] They are different blocks mapped to specific address ranges: main memory, serial communication, and interrupt controllers
- [ ] They are compiler flags
- [ ] They are CPU registers
Correct: B
Explanation: DRAM at 0x80000000 is main memory. UART0 at 0x10000000 is a serial communication peripheral. CLINT and PLIC are interrupt management blocks. Each block occupies a specific address range as defined in the QEMU virt board's address map.

## What does the `const` qualifier guarantee in C, and how can it be circumvented?
- [ ] It guarantees the value never changes; it can be circumvented by direct assignment
- [x] It prevents direct modification of the variable after initialization; it can be circumvented by casting away const-ness through a pointer
- [ ] It makes the variable volatile; it cannot be circumvented
- [ ] It allocates the variable in read-only memory
Correct: B
Explanation: `const` prevents direct writes to a variable (e.g., `const int a = 10; a = 20;` causes a compile error). However, modifying it indirectly through a pointer cast is allowed: `*(int *)&a = 20;` compiles without error — C trusts the programmer.

## What is the struct overlay technique for accessing hardware peripherals?
- [x] Creating a struct with members matching the register layout of a peripheral and casting a pointer at the peripheral's base address
- [ ] Overlaying one struct on top of another in memory
- [ ] Using structs to represent network packets
- [ ] Creating a struct that contains functions
Correct: A
Explanation: The struct overlay technique defines a C struct whose members correspond exactly to the registers of a hardware peripheral (same offsets, sizes, and order). A pointer to this struct is cast to the peripheral's base address (e.g., `#define UART ((uart_t*)0x10000000)`), allowing clean member-access syntax (`UART->thr`) to read/write hardware registers.

## Why are bit fields combined with struct mapping useful for the UART Line Status Register (LSR)?
- [ ] They make the code execute faster by reducing instruction count
- [x] They allow accessing individual status flags (data_ready, thr_empty, etc.) by name instead of using bitwise operations on a byte
- [ ] They increase the range of values the register can store
- [ ] They convert the register to a different data type
Correct: B
Explanation: The LSR has individual status bits (bit 0 = data_ready, bit 5 = thr_empty, etc.). A bitfield struct allows accessing each flag by name (`uart->lsr.tx_empty`) instead of using `(uart->lsr & (1 << 5))`. This makes the code more readable and directly reflects the hardware documentation.
