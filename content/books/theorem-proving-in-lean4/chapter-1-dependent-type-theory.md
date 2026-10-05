+++
title = 'Chapter 1: Dependent Type Theory & Universes'
chapter = 1
weight = 1
date = '2026-10-04'
description = 'The Calculus of Constructions, universe hierarchies Sort u, dependent Pi-types, and Sigma-types in Lean 4.'
+++

## 1.1 The Universe Hierarchy $\text{Sort } u$

In **Lean 4**, every expression has a type, and every type is itself an inhabitant of a universe $\text{Sort } u$ for a universe level $u$:

$$\text{Prop} = \text{Sort } 0 : \text{Type } 0 = \text{Sort } 1 : \text{Type } 1 = \text{Sort } 2 : \cdots$$

Stratifying universes prevents Girard's paradox (the type-theoretic analogue of Russell's paradox $R = \{x \mid x \notin x\}$) while keeping `Prop` impredicative.

## 1.2 Dependent Function Types $\Pi(x : \alpha),\, \beta(x)$

Given a type $\alpha : \text{Type } u$ and a family of types $\beta : \alpha \to \text{Type } v$, the **dependent function type** (written `(x : α) → β x` in Lean 4) generalizes the ordinary function space $\alpha \to \beta$ by allowing the codomain type $\beta(x)$ to vary with the input value $x : \alpha$:

```lean
universe u v

-- Polymorphic identity and dependent composition in Lean 4
def depCompose {α : Type u} {β : α → Type v} {γ : (x : α) → β x → Type u}
    (g : (x : α) → (y : β x) → γ x y)
    (f : (x : α) → β x) : (x : α) → γ x (f x) :=
  fun x => g x (f x)
```

When $\beta(x)$ is a family of propositions $P : \alpha \to \text{Prop}$, the dependent function type `(x : α) → P x` is the universal quantification $\forall x \in \alpha,\, P(x)$.

## 1.3 Dependent Pair Types $\Sigma(x : \alpha),\, \beta(x)$

Dual to the $\Pi$-type is the **dependent sum** (or $\Sigma$-type) $\Sigma(x : \alpha),\, \beta(x)$, whose inhabitants are pairs $\langle a, b \rangle$ where $a : \alpha$ and $b : \beta(a)$:

$$\langle a, b \rangle : \Sigma(x : \alpha),\, \beta(x) \qquad \text{with } \pi_1\langle a, b \rangle = a,\; \pi_2\langle a, b \rangle = b : \beta(a)$$

```lean
-- Dependent pair bundling a natural number n with a proof that n is even
def EvenNat : Type := { n : Nat // ∃ k : Nat, n = 2 * k }

def zeroEven : EvenNat := ⟨0, ⟨0, rfl⟩⟩
def fourEven : EvenNat := ⟨4, ⟨2, rfl⟩⟩
```
