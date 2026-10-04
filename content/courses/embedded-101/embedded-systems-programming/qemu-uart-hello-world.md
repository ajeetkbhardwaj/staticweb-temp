+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'QEMU UART Hello World'
difficulty = 'hard'
language = 'c'
topic_weight = -17
subtopic_weight = 4
weight = 5
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Bare-metal UART "Hello, World!" for QEMU RISC-V virt machine.
 */
void uart_putc(char c) {
    volatile uint8_t *thr = (uint8_t*)0x10000000;
    volatile uint8_t *lsr = (uint8_t*)0x10000005;
    while (!(*lsr & (1 << 5)));
    *thr = c;
}

void uart_puts(const char *s) {
    while (*s) uart_putc(*s++);
}

int main(void) {
    uart_puts("Hello, World!\\n");
    while (1);
    return 0;
}'''
+++

## Problem Statement

How do you print "Hello, World!" on a UART from scratch — writing your own boot code, linker script, and UART driver without any operating system or standard library?

## Theory and Concepts

**End-to-end embedded project structure:** A complete bare-metal RISC-V project requires four components: a startup file (start.S), the main application code (main.c), a linker script (link.ld), and a build system (Makefile).

**16550 UART programming model:** The 16550-compatible UART on QEMU virt is at 0x10000000. Key registers:
- THR (offset 0): write to transmit a character
- LSR (offset 5): bit 5 (THR empty) indicates transmitter ready

**Transmit flow:** Initialize the UART (set baud rate, frame format) → poll LSR until THR empty → write character to THR → repeat for the full string.

## Real World Application

This is the embedded systems equivalent of "Hello, World!" — your first milestone when bringing up new hardware. Every embedded engineer writes a UART driver as one of the first software components on a new board. It serves as a basic sanity check that the CPU, memory, clock, and at least one peripheral are working correctly. Getting characters to appear on a terminal confirms the entire toolchain, boot sequence, and hardware are functional.

===EXPLANATION===

## Moving Parts

Building from scratch means we control every byte that goes into the binary. A complete bare-metal RISC-V project requires four components working together: a startup file (start.S), the main application code (main.c), a linker script (link.ld), and a build system (Makefile). The startup code is the first thing the CPU executes — it initializes the stack pointer by loading the `_STACK_TOP_` symbol defined in the linker script, then jumps to `main()`.

<figure id="fig-1" class="fig-right">
  <img src="/images/embedded-101/embedded-systems-programming/compilation.jpeg" alt="Compilation">
  <figcaption><a href="#fig-1" class="fig-link">Figure 1:</a> Various stages of the build process from source to binary</figcaption>
</figure>

## Jump from Assembly to C

Without the startup code, the C environment is not initialized — sp is undefined, function calls will fail, and global variable initialization hasn't happened. A single C function executing top-to-bottom might work, but calling any function from it would leave the QEMU machine in an uncertain state because function calls require the stack. This is why the glue layer of assembly is essential.

The startup code is the minimum assembly required to set up the stack pointer and jump to `main()`:

```asm
.section .init
.globl _start
_start:
    la sp, _STACK_TOP_
    jal main
    j .
```
*Caption: start.S — sets the stack pointer and jumps to the main() function.*

## Linker Script

The linker script defines the memory layout: where code lives (starting at 0x80000000 for QEMU virt), where the stack is placed (at the end of RAM), and the total memory size. Every symbol used in start.S (`_STACK_TOP_`) must be defined here. The `PROVIDE` keyword in the linker script defines `_STACK_TOP_` only if it is referenced but not defined elsewhere.

```bash
MEMORY
{
  RAM : ORIGIN = 0x80000000, LENGTH = 4k
}

SECTIONS
{
  .text : {
    *(.init*)
    *(.text*)
  } > RAM
}

PROVIDE(_STACK_TOP_ = ORIGIN(RAM) + LENGTH(RAM) - 4);
```
*Caption: main.ld linker script — places the .init section first, then .text, and defines _STACK_TOP_ at the end of RAM.*

<figure id="fig-2" class="fig-right">
  <img src="/images/embedded-101/embedded-systems-programming/uart_csr.jpeg" alt="UART CSR">
  <figcaption><a href="#fig-2" class="fig-link">Figure 2:</a> uart0 is a uart_t pointer holding address 0x10000000 — dereferencing maps to CSR region</figcaption>
</figure>

## Code to Manipulate the UART

The complete main.c file brings together the UART struct, putc, getc, and the main loop to echo user input:

```c
typedef struct {
  /* offset 0x0 */
  union {
    volatile unsigned char thr;        // Transmit Holding Register
    volatile const unsigned char rhr;  // Receive Holding Register
  };

  /* skip offset 0x1, 0x2, 0x3, 0x4 */
  volatile unsigned char ignore0[4];

  /* offset 0x5 */
  union{
    struct {
      volatile const unsigned char data_ready:1;
      volatile const unsigned char overrun_err:1;
      volatile const unsigned char parity_err:1;
      volatile const unsigned char framing_err:1;
      volatile const unsigned char break_interrupt:1;
      volatile const unsigned char thr_empty:1;
      volatile const unsigned char tx_empty:1;
      volatile const unsigned char fifo_data_err:1;
    } __attribute__((packed));
    volatile const unsigned char b;
  } lsr;

  /* skip offset 0x6 and 0x7 */
  volatile unsigned char ignore1[2];
} __attribute__((packed)) uart_t;

#define UART0_BASE_ADDRESS (0x10000000)

void putc(uart_t *uart, char c) {
  while (!(uart->lsr.tx_empty));
  uart->thr = (unsigned char)c;
}

char getc(uart_t *uart) {
  if (uart->lsr.data_ready) return uart->rhr;
  return 0;
}

int main() {
  uart_t *uart0 = (uart_t *)UART0_BASE_ADDRESS;
  char c = 0;

  do {
    c = getc(uart0);
    if (c > 0) putc(uart0, c);
  } while(1);

  return 0;
}
```
*Caption: Complete main.c — reads from UART and echoes back to the terminal.*

### Black Magic!

The UART driver is where the black magic happens. We declare a pointer `uart_t *uart0 = (uart_t *)0x10000000;` — this effectively means uart0 points to the base address of the UART peripheral. Dereferencing the pointer's elements reads and writes to the UART CSR space. This single technique — using a struct pointer at a fixed address to access hardware — is used everywhere in embedded systems and systems software programming.

### main()

The `main()` function is where the application logic lives — it initializes the UART and enters the main loop.

### putc()

The `putc()` function sends a single character to the UART by polling the THR empty bit and then writing to the Transmit Holding Register.

### getc()

The `getc()` function reads a character from the UART by checking the data ready bit in the Line Status Register.

### Missing Curly Braces

Missing curly braces in `if`, `while`, and `for` blocks are legal when only one statement follows.

### Structure Pointer Dereferencing

The `->` operator (structure pointer dereference) is syntactic sugar for `(*struct_ptr).element`. Both forms are equivalent:

```c
...
while (!((*uart).lsr.tx_empty));
...
(*uart).thr = (unsigned char)c;
...
if ((*uart).lsr.data_ready) return (*uart).rhr;
...
```
*Caption: The -> operator is equivalent to (*struct-pointer).element — shown here with the explicit dereference form.*

Skipping the brackets is allowed for these control flow constructs. The `while (<condition>);` syntax (with a semicolon immediately after the condition) is a spin loop that does nothing until the condition becomes false — equivalent to `while (<condition>) {}`.

The Makefile uses `-nostdlib -nostartfiles -ffreestanding` to exclude the hosted C runtime. These flags tell the linker not to include the standard C runtime initialization code (crt0) and standard libraries. In bare-metal programming, we provide our own startup code, linker script, and do not depend on any operating system services.

## Building

The compilation commands are:
```bash
riscv64-unknown-elf-gcc -O0 -ggdb -nostdlib -nostartfiles \
  -ffreestanding -march=rv32i -mabi=ilp32 -Wl,-Tmain.ld \
  main.c start.S -o main.elf
riscv64-unknown-elf-objcopy -O binary main.elf main.bin
```

## Running on QEMU

Running on QEMU: `qemu-system-riscv32 -M virt -nographic -bios none -kernel main.bin`. The `-nographic` flag redirects UART output to the terminal. Typing characters at the terminal sends them over the UART's RX line; the program reads them from RHR and writes them back to THR, producing an echo. To exit QEMU, press Ctrl+A followed by x.

```bash
$ qemu-system-riscv32 -M virt -nographic -bios none -kernel main.bin
Hello, World!
```
*Caption: QEMU output — typed characters are echoed back by the UART program.*

The UART driver polls the Line Status Register's THR empty bit before writing each character. The 16550 has an internal transmit shift register — if we write while it's busy, the character may be lost. The polling loop `while (!(*lsr & (1 << 5)));` ensures we only write when the transmitter is ready. After all characters are sent, the program enters an infinite loop. On QEMU, running with `-nographic` redirects the UART output to the terminal, so "Hello, World!" appears on your console.

===CODE===

```asm {title="start.S"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Minimal startup code — sets sp and jumps to main().
 */
.section .init
.globl _start
_start:
    la sp, _STACK_TOP_
    jal main
loop:
    j loop
```

```c {title="main.c"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Bare-metal UART echo program for QEMU RISC-V virt machine.
 */
typedef unsigned char uint8_t;

#define UART_THR  ((volatile uint8_t*)0x10000000)
#define UART_LSR  ((volatile uint8_t*)0x10000005)
#define LSR_THRE  (1 << 5)

void uart_init(void) {
    volatile uint8_t *lcr = (volatile uint8_t*)0x10000003;
    volatile uint8_t *dll = (volatile uint8_t*)0x10000000;
    volatile uint8_t *dlm = (volatile uint8_t*)0x10000001;

    *lcr = (1 << 7);
    *dll = 1;
    *dlm = 0;

    *lcr = (3 << 0);
}

void uart_putc(char c) {
    while (!(*UART_LSR & LSR_THRE));
    *UART_THR = c;
}

void uart_puts(const char *s) {
    while (*s) {
        uart_putc(*s++);
    }
}

int main(void) {
    uart_init();
    uart_puts("Hello, World!\n");
    while (1);
    return 0;
}
```

```makefile {title="Makefile"}
# Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
# All Rights Reserved.
#
# Description: Build system for bare-metal UART hello world.
CC = riscv64-unknown-elf-gcc
CFLAGS = -march=rv64gc -mabi=lp64d -O2 -Wall -nostdlib -nostartfiles -ffreestanding
LDFLAGS = -T link.ld

all: program.elf

program.elf: start.o main.o
	$(CC) $(CFLAGS) $(LDFLAGS) -o $@ $^

start.o: start.S
	$(CC) $(CFLAGS) -c -o $@ $<

main.o: main.c
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
 * Description: Linker script for bare-metal UART project on QEMU virt.
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

## What does the THR empty bit (bit 5 of LSR) indicate?

- [ ] The receive buffer has data
- [x] The transmit holding register is ready to accept a new character
- [ ] The UART is powered off
- [ ] A framing error has occurred

Correct: B
Explanation: Bit 5 of the Line Status Register is set when the Transmit Holding Register (THR) is empty and ready to accept a new byte. The driver must poll this bit before each write to avoid overwriting a character that hasn't been shifted out yet.

## What is the purpose of `-nostdlib -nostartfiles` in the Makefile flags?

- [ ] To enable optimization for the target architecture
- [ ] To link against the standard C library
- [x] To exclude the standard C runtime and startup files so we provide our own
- [ ] To disable all compiler warnings

Correct: C
Explanation: These flags tell the linker not to include the standard C runtime initialization code (crt0) and standard libraries. In bare-metal programming, we provide our own startup code (start.S), linker script (link.ld), and do not depend on any operating system services.

## What are the four essential files needed for a complete bare-metal RISC-V QEMU project?
- [ ] main.c, main.h, Makefile, README.md
- [x] start.S (startup code), main.c (application code), link.ld (linker script), Makefile (build system)
- [ ] bootloader.bin, kernel.elf, initrd.img, grub.cfg
- [ ] uart.c, uart.h, gpio.c, main.c
Correct: B
Explanation: A complete bare-metal project requires: a startup file (start.S) that sets the stack pointer and jumps to main(), the main application code (main.c), a linker script (link.ld) defining the memory layout, and a build system (Makefile) to automate compilation and linking.

## What is the purpose of the `putc()` function in the UART driver, and how does it ensure reliable transmission?
- [ ] It reads a character from the UART receive register
- [x] It polls the THR empty bit (bit 5 of LSR) until the transmitter is ready, then writes the character to the Transmit Holding Register
- [ ] It initializes the UART baud rate
- [ ] It configures the UART interrupt
Correct: B
Explanation: `putc()` polls the Line Status Register's "THR empty" bit (bit 5) in a spin loop. Once the bit indicates the transmit holding register is empty (previous character has been shifted out), the function writes the new character to THR. This prevents overwriting a character that hasn't been transmitted yet.

## Why is the startup code (`start.S`) necessary before C code can run on bare metal?
- [ ] Because C code cannot be executed without an operating system
- [x] Because C functions require a valid stack pointer for function calls, local variables, and saving return addresses — the startup code sets sp before jumping to main()
- [ ] Because the CPU can only execute assembly, not C
- [ ] Because the linker script cannot work without assembly
Correct: B
Explanation: C compiled code makes heavy use of the stack pointer (sp) for function prologues/epilogues, local variable storage, and return address management. Without the startup code initializing sp to a valid memory address, the first function call would corrupt memory or crash the CPU.

## What is the `->` operator in the context of the UART struct pointer access?
- [ ] It subtracts two pointers
- [x] It dereferences a struct pointer and accesses a member — `uart->thr` is equivalent to `(*uart).thr`
- [ ] It declares a new struct
- [ ] It casts a pointer to a different type
Correct: B
Explanation: The `->` operator (structure pointer dereference) is syntactic sugar. `uart->thr` is exactly equivalent to `(*uart).thr`. It dereferences the pointer `uart` to get the struct, then accesses the `thr` member. Any occurrence of `->` indicates a struct pointer is being used.

## How does the `-nographic` flag affect QEMU's behavior when running the UART hello world program?
- [ ] It enables graphical display output
- [x] It disables graphical output and redirects the emulated UART's serial console to the terminal where QEMU is running
- [ ] It increases the emulation speed
- [ ] It loads a different machine type
Correct: B
Explanation: The `-nographic` flag tells QEMU to not create a graphical window. Instead, it connects the emulated machine's first serial port (UART) to the terminal's stdin/stdout. Characters typed at the terminal are sent to the UART's RX line, and characters written to the UART's THR appear on the terminal.
