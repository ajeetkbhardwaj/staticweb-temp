+++
title = 'From Pen-and-Paper Proofs to Lean 4: Curry–Howard in Practice'
date = '2026-10-03'
domain = 'Lean 4 & Proofs'
author = 'Math Code Center Research'
description = 'How dependent type theory turns logical quantifiers into function types and dependent pairs in Lean 4.'
+++

When transitioning from traditional pen-and-paper mathematics to an interactive theorem prover like **Lean 4**, the most illuminating realization is that logical connectives and type constructors are identical structures.

## Logical Connectives as Type Constructors

Let $P$ and $Q$ be propositions in `Prop`, and let $\alpha : \text{Type}$ be a domain of discourse with a predicate $A : \alpha \to \text{Prop}$. The translation dictionary between classical mathematical notation and Dependent Type Theory is:

$$\begin{aligned}
P \implies Q &\quad\longleftrightarrow\quad P \to Q \\
\forall x \in \alpha,\, A(x) &\quad\longleftrightarrow\quad (x : \alpha) \to A\;x \\
P \land Q &\quad\longleftrightarrow\quad P \times Q \\
\exists x \in \alpha,\, A(x) &\quad\longleftrightarrow\quad \Sigma (x : \alpha),\, A\;x
\end{aligned}$$

In particular, a proof of an implication $P \to Q$ is literally a function that transforms any evidence $h_P : P$ into evidence $h_Q : Q$.

## Term-Mode vs. Tactic-Mode Proofs in Lean 4

Let us prove that logical implication is transitive and that conjunction distributes over disjunction:

$$(P \land (Q \lor R)) \iff (P \land Q) \lor (P \land R)$$

```lean
-- Term-mode proof of implication transitivity
theorem imp_trans {P Q R : Prop} (hpq : P → Q) (hqr : Q → R) : P → R :=
  fun hp : P => hqr (hpq hp)

-- Tactic-mode proof of distributivity of conjunction over disjunction
theorem and_or_distrib_left (P Q R : Prop) :
    P ∧ (Q ∨ R) ↔ (P ∧ Q) ∨ (P ∧ R) := by
  constructor
  · rintro ⟨hp, hq | hr⟩
    · exact Or.inl ⟨hp, hq⟩
    · exact Or.inr ⟨hp, hr⟩
  · rintro (⟨hp, hq⟩ | ⟨hp, hr⟩)
    · exact ⟨hp, Or.inl hq⟩
    · exact ⟨hp, Or.inr hr⟩
```

## Quantifiers and Algebraic Invariants

When reasoning about functions $f : \mathbb{R} \to \mathbb{R}$, recall that $f$ is **injective** if:

$$\forall x_1, x_2 \in X,\quad f(x_1) = f(x_2) \implies x_1 = x_2$$

The composition $g \circ f$ of two injective functions is itself injective. Notice how cleanly the formal proof mirrors the mathematical argument:

```lean
def Injective {α β : Type} (f : α → β) : Prop :=
  ∀ ⦃x₁ x₂ : α⦄, f x₁ = f x₂ → x₁ = x₂

theorem injective_comp {α β γ : Type} {f : α → β} {g : β → γ}
    (hf : Injective f) (hg : Injective g) :
    Injective (fun x => g (f x)) := by
  intro x₁ x₂ hgf
  apply hf
  apply hg
  exact hgf
```

By mastering `intro`, `apply`, `exact`, and `rintro`, you can translate almost any structural proof in algebra or topology directly into machine-verified Lean 4 code.
