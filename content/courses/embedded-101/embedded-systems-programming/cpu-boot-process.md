+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'CPU Boot Process'
difficulty = 'medium'
language = 'c'
topic_weight = -17
subtopic_weight = 4
weight = 2
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Minimal RISC-V startup code — sets stack pointer and jumps to main().
 */
.section .init
.globl _start
_start:
    la sp, _STACK_TOP_
    jal main
loop:
    j loop'''
+++

## Problem Statement

What happens inside a CPU from the moment power is applied until the first instruction of your C program executes? How does the CPU know where to find the first instruction?

## Theory and Concepts

When power is applied to a CPU, it begins execution from a predefined memory address called the **reset vector**. For RISC-V, the reset vector address is implementation-defined and typically set by the hardware platform. In the QEMU virt machine, the CPU starts executing at 0x80000000 by default, which is where we place our code.

**Reset sequence:**
1. Power-on reset (POR) initializes all registers to known values. The program counter (PC) is loaded with the reset vector address.
2. The CPU fetches the first instruction from the reset vector address.
3. The first few instructions typically set up the stack pointer (sp), initialize .bss, copy .data from flash to RAM, and call main().

**RISC-V vs ARM-M boot:** On ARM Cortex-M, the reset vector contains the initial stack pointer value and the reset handler address. RISC-V uses a simpler model — execution starts directly at the reset vector address, and initial sp must be set in software.

**Bootloaders:** Larger systems often use a two-stage boot process: a small first-stage bootloader initializes DRAM and loads a second-stage bootloader or the main firmware from non-volatile storage.

## Real World Application

When you press the reset button on an embedded device, the CPU must transition from an undefined state to running your application correctly. Every embedded engineer encounters boot issues: the device doesn't start, crashes immediately, or behaves erratically. Understanding the boot sequence helps debug these issues by knowing exactly where to set breakpoints (reset vector, start of main()) and what state to expect.

===EXPLANATION===

## Why Care About CPU Boot Process?

Understanding how a CPU boots is critical for every embedded engineer. It gives you the confidence to design low-memory-footprint applications and debug them without depending on frameworks like Arduino IDE or FreeRTOS to "just make it work". The CPU boot process is the bridge between hardware and software — knowing what happens between power-on and the first line of your C code separates a firmware engineer from a framework user.

## Single Core Boot

### Revisiting CPU Model

The CPU can be modeled as a state machine with its state held in registers. The most important register is the Program Counter (PC), which holds the address from which the next instruction will be fetched. After power-on reset (POR), all CPU registers are initialized to known values. The PC register is loaded with the reset vector address — a value decided by the CPU/SoC architects. For the QEMU virt machine, execution begins at address 0x80000000 (after an initial boot ROM at 0x1000 jumps there).

### Boot Flow

The boot flow requires two preconditions: power must be supplied to the CPU, and the CPU clock must be enabled. Power management circuits on the board or within the SoC handle these. Once the clock is available, the CPU floats the PC value on the instruction bus and starts fetching content from that address, treating whatever it finds as instructions.

### RISC-V CPU Boot Flow

For RISC-V CPUs specifically, as soon as the clock is available (assuming power is stable), the PC value is floated on the bus. The reset address is machine-dependent and documented in the technical manual. ### ARM-M CPU Boot Flow

On ARM Cortex-M processors, the boot flow is slightly different: the hardware reads the first two words from the start of code memory — the first word is loaded into the Stack Pointer (SP) and the second into the PC. This is why ARM-M vector tables have the initial SP value as the first entry and the reset handler address as the second.

## Minimum Boot Setup

The absolute minimum boot setup for a single-core RISC-V system requires two things:
1. Set the stack pointer (sp) register to a valid memory address
2. Place the initial code at the memory address where the PC points after reset

Consider a C function that calls another function:

```c
int add(int a, int b) {
  return a + b;
}

void main() {
  int c;
  c = add(1, 2);
}
```
*Caption: main.c demonstrating function call — used to generate assembly and explore sp register usage.*

Generate the assembly:

```asm
riscv64-unknown-elf-gcc -O0 -nostdlib -nostartfiles -ffreestanding -march=rv32i -mabi=ilp32 -S main.c
```
*Caption: Generating the assembly file from main.c.*

The generated assembly shows how heavily the `sp` register is used:

```asm
  .file "main.c"
  .option nopic
  .attribute arch, "rv32i2p0"
  .attribute unaligned_access, 0
  .attribute stack_align, 16
  .text
  .align 2
  .globl add
  .type add, @function
add:
  addi sp,sp,-32
  sw s0,28(sp)
  addi s0,sp,32
  sw a0,-20(s0)
  sw a1,-24(s0)
  lw a4,-20(s0)
  lw a5,-24(s0)
  add a5,a4,a5
  mv a0,a5
  lw s0,28(sp)
  addi sp,sp,32
  jr ra
  .size add, .-add
  .align 2
  .globl main
  .type main, @function
main:
  addi sp,sp,-32
  sw ra,28(sp)
  sw s0,24(sp)
  addi s0,sp,32
  li a1,2
  li a0,1
  call add
  sw a0,-20(s0)
  nop
  lw ra,28(sp)
  lw s0,24(sp)
  addi sp,sp,32
  jr ra
  .size main, .-main
  .ident "GCC: () 10.2.0"
```
*Caption: Generated assembly — note the addi sp/sp/sw sp/lw sp instructions in the prologue and epilogue.*

### Branch to main()

The startup code in `start.S` performs these tasks. The `la sp, _STACK_TOP_` pseudo-instruction loads the address of the stack top symbol (defined in the linker script) into sp. The stack grows downward, so `_STACK_TOP_` points to the highest address of the stack region. After setting sp, `jal main` jumps to the C entry point, and an infinite loop after main() catches the return.

```asm
.section .init
.globl _start
_start:
    la sp, _STACK_TOP_  # Load the SP with end of RAM
    jal main            # Jump to main()
    j .                 # Spin forever
```
*Caption: Three-line startup code — sets the stack pointer, jumps to main(), and loops forever on return.*

### The Ignored Piece

There are a few more housekeeping items that well-formed startup code handles: initializing the .bss section (zero-initializing global variables) and copying the .data section from its load address (in flash) to its runtime address (in RAM). These steps are required for C code that uses initialized or uninitialized global variables. In our QEMU examples running directly from RAM, these steps are minimal, but real embedded systems with separate flash and RAM must handle them.

===CODE===

```asm {title="start.S"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Minimal RISC-V startup code — sets sp and jumps to main().
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
 * Description: Blinks a GPIO LED with a busy-wait delay.
 */
#define GPIO_BASE 0x10000000
#define GPIO_OUT  *(volatile int*)(GPIO_BASE + 0x00)

int main(void) {
    while (1) {
        GPIO_OUT = 0x01;
        for (volatile int i = 0; i < 1000000; i++);
        GPIO_OUT = 0x00;
        for (volatile int i = 0; i < 1000000; i++);
    }
    return 0;
}
```

```makefile {title="Makefile"}
# Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
# All Rights Reserved.
#
# Description: Build system for bare-metal RISC-V project.
CC = riscv64-unknown-elf-gcc
CFLAGS = -march=rv64gc -mabi=lp64d -O2 -Wall -nostdlib -nostartfiles
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

## What does the CPU do immediately after a power-on reset on a RISC-V system?

- [ ] It initializes the stack pointer from a predefined location
- [ ] It calls main()
- [x] It loads the program counter with the reset vector address and fetches the first instruction
- [ ] It copies .data from flash to RAM

Correct: C
Explanation: The CPU hardware loads the PC with the reset vector address and begins fetching instructions. Stack initialization and .data copying are done by software in the startup code, not by hardware.

## In the startup code (start.S), why must the stack pointer be initialized before calling main()?

- [ ] main() stores all its local variables in registers
- [x] C functions require a valid stack for function calls, local variables, and saving return addresses
- [ ] The CPU will fault if sp is not set within the first 10 instructions
- [ ] The linker script requires it

Correct: B
Explanation: C relies on the stack for function call frames, local variable storage, and saving return addresses (ra). Without a valid sp, the first function call from start.S to main would corrupt memory or crash.

## What are the absolute minimum requirements to boot a single-core RISC-V system?
- [ ] A bootloader, an operating system, and a file system
- [x] Set the stack pointer (sp) to a valid address and place the initial code at the reset vector address
- [ ] Initialize the UART, configure GPIOs, and enable interrupts
- [ ] Copy .data from flash to RAM and zero-initialize .bss
Correct: B
Explanation: The minimum boot setup is: (1) set the sp register to a valid memory address so C functions can use the stack, and (2) place the initial code at the memory address where the PC points after reset (the reset vector).

## How does the ARM Cortex-M boot process differ from RISC-V's boot process?
- [ ] ARM-M requires an external bootloader; RISC-V does not
- [x] ARM-M reads the first two words from the start of code memory — the first goes into SP, the second into PC; RISC-V starts execution directly at the reset vector address
- [ ] ARM-M boots from an SD card; RISC-V boots from a hard drive
- [ ] Both are identical
Correct: B
Explanation: ARM Cortex-M processors read the first two words from the beginning of the code memory: the first word is loaded into the Stack Pointer (SP) and the second into the Program Counter (PC). In contrast, RISC-V simply starts execution from the reset vector address, and the SP must be set in software by the startup code.

## What is a bootloader and when is it used in the boot flow?
- [ ] A bootloader is a diagnostic tool for debugging
- [x] A bootloader is a small program that initializes hardware (like DRAM) and loads the main firmware from non-volatile storage
- [ ] A bootloader replaces the linker script
- [ ] A bootloader is only used on x86 systems
Correct: B
Explanation: Larger systems often use a two-stage boot process. A small first-stage bootloader (running from on-chip ROM) initializes critical hardware such as DRAM controllers, then loads a second-stage bootloader or the main firmware from Flash or other non-volatile storage into RAM before jumping to it.

## In the QEMU virt machine, why does the CPU execute code at 0x1000 (boot ROM) before reaching 0x80000000?
- [ ] 0x1000 is where the linker places code
- [x] The vendor adds boot ROM at the default reset address that does basic setup and then jumps to 0x80000000 where the user application is loaded
- [ ] 0x1000 is the UART address
- [ ] The CPU has two PC registers
Correct: B
Explanation: The QEMU virt machine maps a small boot ROM at 0x1000 (the initial reset vector address). This ROM performs minimal initialization and then jumps to 0x80000000 (the start of DRAM), where the user's program (loaded as -kernel) is placed.

## What additional housekeeping should well-formed startup code handle beyond setting sp and jumping to main()?
- [ ] Starting a web server and enabling WiFi
- [x] Initializing the .bss section (zero-initialize globals) and copying the .data section from load address to runtime address
- [ ] Formatting the file system and mounting drives
- [ ] Compiling the application source code
Correct: B
Explanation: Proper startup code should zero-initialize the `.bss` section (where uninitialized global variables live) and copy the `.data` section from its load address (in Flash) to its runtime address (in RAM). These steps ensure initialized and uninitialized global variables have correct values before `main()` runs.
