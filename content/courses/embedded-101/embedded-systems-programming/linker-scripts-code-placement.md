+++
date = '2026-07-10T10:00:00+05:30'
draft = true
title = 'Linker Scripts and Code Placement'
difficulty = 'medium'
language = 'c'
topic_weight = -17
subtopic_weight = 4
weight = 3
initial_code = '''/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Minimal linker script placing code in FLASH and data in RAM.
 */
MEMORY
{
    FLASH (rx)  : ORIGIN = 0x80000000, LENGTH = 32M
    RAM   (rwx) : ORIGIN = 0x80200000, LENGTH = 32M
}

SECTIONS
{
    . = ORIGIN(FLASH);
    .init : { *(.init) } > FLASH
    .text : { *(.text) } > FLASH
    .data : { *(.data) } > RAM AT > FLASH
}'''
+++

## Problem Statement

Why do we need a linker script? What happens if code is placed at the wrong memory address in an embedded system?

## Theory and Concepts

Linker scripts control how the linker combines object files into an executable. They define the **memory map** (which addresses correspond to which physical memories) and specify which **sections** (.init, .text, .rodata, .data, .bss) go where.

**Memory regions:** The MEMORY command defines named regions with origin, length, and permissions. For example, FLASH at 0x80000000 (read-execute only) and RAM at 0x80200000 (read-write-execute).

**Sections and placement:** The SECTIONS command describes the output sections. Input sections (from object files) are matched by name: `*(.text)` collects all .text sections from all input files. The location counter `.` tracks the current output address and can be assigned to set explicit addresses.

**Symbols and PROVIDE:** Symbols like `_STACK_TOP_`, `_sdata`, `_edata` are defined in the linker script to communicate addresses to the startup code. The PROVIDE keyword defines a symbol only if it is referenced but not defined elsewhere.

## Real World Application

Incorrect code placement is one of the most common and dangerous embedded software bugs. If a linker script places .text in a read-only memory but the startup code tries to write there, a hard fault occurs. Placing the interrupt vector table at the wrong address causes the CPU to execute invalid code on reset. Linker scripts are also critical for bootloaders — the first stage must be linked at a fixed address that the hardware boots from, while the second stage can be position-independent.

===EXPLANATION===

## Linker

The linker is the final stage of the build process. It takes the object files produced by the assembler and combines them into a single executable, resolving cross-file symbol references and assigning final memory addresses. The linker script is the instruction manual for the linker — it describes the memory layout of the target hardware and tells the linker which sections of code and data go where.

Without a linker script, the linker uses a default script designed for a hosted environment with an operating system. This default assumes code can be placed at address 0x00000000 or similar low addresses. On an embedded system with RAM starting at 0x80000000, code linked for address 0 would be placed in unmapped memory — the CPU would fetch invalid instructions and fault immediately. The linker script is therefore not optional for bare-metal embedded work; it is the essential bridge between the abstract sections (.text, .data, .bss) and the physical memory layout.

## Linker Script

The `MEMORY` command defines named memory regions with attributes:

```ld
MEMORY
{
    FLASH (rx)  : ORIGIN = 0x80000000, LENGTH = 32M
    RAM   (rwx) : ORIGIN = 0x80200000, LENGTH = 32M
}
```

Each region has an origin (start address), length, and optional permissions (r = read, w = write, x = execute). FLASH is typically read-execute (code runs from flash), while RAM is read-write-execute (data and stack).

The `SECTIONS` command describes the output sections and where they go:

```ld
SECTIONS
{
    . = ORIGIN(FLASH);
    .init : { *(.init) } > FLASH
    .text : { *(.text) } > FLASH
}
```

The location counter (`.`) tracks the current output address as sections are laid out sequentially. After placing `.init`, the counter advances by the size of `.init`, so `.text` begins immediately after. Explicit alignment with `. = ALIGN(4);` ensures proper alignment for code and data.

The `AT>` directive is used for initialized data that must live at one address at runtime but is stored at a different address in the binary. For example, `.data` has a runtime address in RAM but a load address in FLASH. The startup code copies .data from the load address (in flash) to the runtime address (in RAM) before main() is called. The `LOADADDR()` function retrieves the load address of a section:

```ld
_la_data = LOADADDR(.data);
```

Symbols like `_sdata`, `_edata`, `_sbss`, `_ebss`, and `_STACK_TOP_` are defined in the linker script to communicate addresses to the startup code. The `_STACK_TOP_` symbol is conventionally placed at the end of RAM (stack grows downward). The startup code loads this address into sp. If `_STACK_TOP_` points to unmapped memory or overlaps with code, the system will crash when the first function call or interrupt occurs.

The `PROVIDE` keyword defines a symbol only if it is referenced but not defined elsewhere. This is useful for optional symbols that the startup code may reference but that aren't always required.

A complete linker script for a system with both flash and RAM typically looks like:

```ld
OUTPUT_ARCH(riscv)

MEMORY
{
    FLASH (rx)  : ORIGIN = 0x80000000, LENGTH = 32M
    RAM   (rwx) : ORIGIN = 0x80200000, LENGTH = 32M
}

_la_data = LOADADDR(.data);

SECTIONS
{
    . = ORIGIN(FLASH);

    .init : { *(.init) } > FLASH
    .text : { *(.text) } > FLASH
    .rodata : { *(.rodata) } > FLASH

    . = ORIGIN(RAM);

    _sdata = .;
    .data : { *(.data) } > RAM AT > FLASH
    _edata = .;

    _sbss = .;
    .bss : { *(.bss) } > RAM
    _ebss = .;

    _STACK_TOP_ = ORIGIN(RAM) + LENGTH(RAM);
}
```

The startup code uses these symbols to copy .data from flash to RAM (using `_sdata`, `_edata`, `_la_data`) and zero-initialize .bss (using `_sbss`, `_ebss`). The `_STACK_TOP_` symbol is loaded into the sp register. This dance between the linker script and the startup code is what makes C programs work correctly on bare metal.

===CODE===

```asm {title="start.S"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Startup code that copies .data, clears .bss, then jumps to main().
 */
.section .init
.globl _start
_start:
    la sp, _STACK_TOP_
    la t0, _sdata
    la t1, _edata
    la t2, _la_data
    beq t0, t1, 1f
copy_loop:
    lw t3, 0(t2)
    sw t3, 0(t0)
    addi t0, t0, 4
    addi t2, t2, 4
    blt t0, t1, copy_loop
1:
    la t0, _sbss
    la t1, _ebss
    beq t0, t1, 2f
bss_loop:
    sw zero, 0(t0)
    addi t0, t0, 4
    blt t0, t1, bss_loop
2:
    jal main
loop:
    j loop
```

```c {title="main.c"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Tests initialized and zero-initialized global variables.
 */
volatile int global_var = 42;
volatile int zero_var;

int main(void) {
    global_var = 99;
    zero_var = 1;
    while (1);
    return 0;
}
```

```makefile {title="Makefile"}
# Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
# All Rights Reserved.
#
# Description: Build system for bare-metal RISC-V project with linker script.
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

dump: program.elf
	riscv64-unknown-elf-objdump -t program.elf | sort

run: program.elf
	qemu-system-riscv64 -nographic -machine virt -kernel program.elf
```

```ld {title="link.ld"}
/*
 * Copyright © 2026 Typobrahe Education LLP (pyjamacafe.com)
 * All Rights Reserved.
 *
 * Description: Linker script with FLASH and RAM regions, .data copy support.
 */
OUTPUT_ARCH(riscv)

MEMORY
{
    FLASH (rx)  : ORIGIN = 0x80000000, LENGTH = 32M
    RAM   (rwx) : ORIGIN = 0x80200000, LENGTH = 32M
}

_la_data = LOADADDR(.data);

SECTIONS
{
    . = ORIGIN(FLASH);

    .init : {
        *(.init)
    } > FLASH

    .text : {
        *(.text)
    } > FLASH

    .rodata : {
        *(.rodata)
    } > FLASH

    . = ORIGIN(RAM);

    _sdata = .;
    .data : {
        *(.data)
    } > RAM AT > FLASH
    _edata = .;

    _sbss = .;
    .bss : {
        *(.bss)
    } > RAM
    _ebss = .;

    _STACK_TOP_ = ORIGIN(RAM) + LENGTH(RAM);
}
```

===QUIZ===

## What does the location counter `.` represent in a linker script?

- [ ] The number of input sections processed
- [ ] The total size of the output binary
- [x] The current output address within the SECTIONS block
- [ ] The origin of the first memory region

Correct: C
Explanation: The location counter tracks the current virtual address as sections are laid out sequentially. It can be read, assigned, and aligned to control precise placement.

## What is the purpose of the `AT>` directive in a linker script?

- [ ] To mark data as thread-local
- [ ] To align a section to a page boundary
- [x] To specify a separate load address for a section different from its runtime address
- [ ] To attach an attribute to a section

Correct: C
Explanation: `AT>` allows a section (like .data) to have one runtime address (in RAM) but a different load address (in FLASH). The startup code then copies the data from the load address to the runtime address before the application runs.

## What does the `MEMORY` command define in a linker script?
- [ ] The amount of cache available
- [x] Named memory regions with origin (start address), length, and optional permissions (r/w/x)
- [ ] The compiler optimization flags
- [ ] The names of all object files
Correct: B
Explanation: The `MEMORY` command defines named regions describing the target's physical memory. For example, `FLASH (rx) : ORIGIN = 0x80000000, LENGTH = 32M` creates a region called FLASH starting at 0x80000000 with read and execute permissions.

## What is the `SECTIONS` command used for in a linker script?
- [ ] It splits the CPU into multiple cores
- [x] It describes how input sections from object files are combined into output sections and where they are placed in memory
- [ ] It sets the clock frequency of the CPU
- [ ] It configures the UART baud rate
Correct: B
Explanation: The `SECTIONS` command describes the output sections and their placement. For example, `.text : { *(.text) } > FLASH` collects all `.text` input sections from all object files and places them in the `.text` output section mapped to the FLASH memory region.

## What is the `PROVIDE` keyword in a linker script used for?
- [x] It defines a symbol only if it is referenced but not defined elsewhere
- [ ] It forces a symbol to always be defined
- [ ] It provides a default value for uninitialized variables
- [ ] It declares a function as inline
Correct: A
Explanation: `PROVIDE(symbol = value)` defines a symbol only if it is referenced but not already defined in any input file. This is useful for optional symbols that startup code may reference but that aren't always required, like `_STACK_TOP_`.

## What do the symbols `_sdata`, `_edata`, `_sbss`, and `_ebss` represent in a linker script?
- [x] They indicate the start and end addresses of the `.data` and `.bss` sections, used by startup code for copying and zeroing
- [ ] They are CPU register names
- [ ] They represent compiler version numbers
- [ ] They are memory protection flags
Correct: A
Explanation: These symbols mark the start (`_sdata`, `_sbss`) and end (`_edata`, `_ebss`) of the `.data` and `.bss` sections. The startup code uses them to copy initialized data from flash to RAM (`_sdata` to `_edata` from `_la_data`) and to zero-initialize the BSS section (`_sbss` to `_ebss`).

## What happens if `_STACK_TOP_` points to unmapped memory or overlaps with code?
- [ ] The program runs normally
- [x] The system will likely crash when the first function call or interrupt occurs because stack operations corrupt code or access invalid memory
- [ ] The CPU automatically relocates the stack
- [ ] The linker reports an error
Correct: B
Explanation: If `_STACK_TOP_` points to invalid memory (unmapped address) or overlaps with the code/data sections, the stack will grow downward into code or off into unmapped space. When the first function call or interrupt occurs, the `sw`/`lw` instructions using `sp` will corrupt the program or cause a fault.
