+++
date = '2026-10-04'
title = 'Propositions as Types & Curry–Howard'
difficulty = 'easy'
language = 'lean'
topic_weight = 1
subtopic_weight = 1
weight = 1
description = 'Formalizing the Curry–Howard correspondence, constructive implication, and proof irrelevance in Lean 4.'
+++

## Problem Statement

Formalize the **Currying isomorphism** in propositional logic: prove that for any propositions $P, Q, R : \text{Prop}$, the implication $(P \land Q \to R)$ is logically equivalent to $(P \to Q \to R)$:

$$(P \land Q \to R) \iff (P \to Q \to R)$$

Construct both directions of the equivalence in Lean 4 using either term-mode lambda abstractions or tactic-mode proofs.

```lean
theorem curry_equiv (P Q R : Prop) : (P ∧ Q → R) ↔ (P → Q → R) := by
  constructor
  · intro h hp hq
    exact h ⟨hp, hq⟩
  · intro h hpq
    exact h hpq.left hpq.right
```

===EXPLANATION===

## The Curry–Howard Isomorphism

In Martin-Löf Dependent Type Theory and the Calculus of Constructions (the foundation of **Lean 4**), every proposition $P : \text{Prop}$ is a type whose elements $p : P$ are proofs (or witnesses) of $P$.

| Logical Connective | Type-Theoretic Constructor | Introduction Form | Elimination Form |
| :--- | :--- | :--- | :--- |
| Implication $P \implies Q$ | Function type $P \to Q$ | `fun hp => ...` / `intro hp` | Application `f hp` / `apply f` |
| Conjunction $P \land Q$ | Product type `And P Q` | `And.intro hp hq` / `⟨hp, hq⟩` | Projections `.left`, `.right` |
| Disjunction $P \lor Q$ | Sum type `Or P Q` | `Or.inl hp`, `Or.inr hq` | Pattern match `rcases` / `cases` |
| Universal $\forall x : \alpha, P(x)$ | Dependent $\Pi$-type `(x : α) → P x` | `fun x => ...` / `intro x` | Specialization `h a` |

### Proof Irrelevance in `Prop`

Unlike computational data types in `Type`, any two proofs $h_1, h_2 : P$ of a proposition $P : \text{Prop}$ are definitionally equal ($h_1 \equiv h_2$). This principle is known as **proof irrelevance** and allows Lean to erase proof terms during code extraction.

===READING===

## Comparative Implementation: Logic in Lean 4 & Python Type Checkers

Below we compare the formal proof in Lean 4 with a higher-order functional representation in Python:

```lean
-- Complete formal verification of Currying and Modus Ponens in Lean 4
theorem modus_ponens {P Q : Prop} (hp : P) (hpq : P → Q) : Q :=
  hpq hp

theorem contrapositive {P Q : Prop} (hpq : P → Q) : ¬Q → ¬P := by
  intro hnq hp
  exact hnq (hpq hp)
```

```python
from typing import Callable, Tuple, TypeVar

P = TypeVar("P")
Q = TypeVar("Q")
R = TypeVar("R")

def curry(f: Callable[[Tuple[P, Q]], R]) -> Callable[[P], Callable[[Q], R]]:
    return lambda p: lambda q: f((p, q))

def uncurry(g: Callable[[P], Callable[[Q], R]]) -> Callable[[Tuple[P, Q]], R]:
    return lambda pq: g(pq[0])(pq[1])
```

===CODE===

```lean
theorem curry_equiv (P Q R : Prop) : (P ∧ Q → R) ↔ (P → Q → R) := by
  constructor
  · intro h hp hq
    exact h ⟨hp, hq⟩
  · intro h ⟨hp, hq⟩
    exact h hp hq
```

===QUIZ===

## In Lean 4, what type corresponds to the universal quantification $\forall x \in \alpha,\, P(x)$?
- [ ] The dependent pair type $\Sigma (x : \alpha), P(x)$
- [x] The dependent function type $(x : \alpha) \to P\;x$
- [ ] The quotient type $\alpha / P$
- [ ] The Cartesian product $\alpha \times P$
Correct: B
Explanation: Universal quantification $\forall x : \alpha, P(x)$ is represented as a dependent function type $(x : \alpha) \to P\;x$ that maps each element $x : \alpha$ to a proof of $P(x)$.

## Which principle guarantees that any two proofs $h_1, h_2 : P$ of a proposition $P : \text{Prop}$ are equal in Lean 4?
- [x] Proof irrelevance
- [ ] Excluded middle
- [ ] Function extensionality
- [ ] Univalence axiom
Correct: A
Explanation: Lean's `Prop` universe satisfies definitional proof irrelevance: all inhabitants of a proposition $P : \text{Prop}$ are definitionally equal.
