# Phase 1 — Run Instructions

## Prerequisites

- An AI coding assistant (editor-integrated agent or chat LLM with file access).
- No Java toolchain needed for this track. All exercises are prompt, spec,
  and review writing, typed into the editor pane in this app.

## Setup checklist

1. Install / open your AI tool of choice.
2. Confirm it can **read files** and **edit files** in a project (an agent
   with tool access, not just a chat box).
3. Create a scratch directory with one small Java file in it — you'll use it
   as a sandbox in later phases:

   ```shell
   mkdir -p ~/ai-scratch
   cat > ~/ai-scratch/Thing.java <<'EOF'
   public class Thing {
       public static void main(String[] args) {
           System.out.println("hello");
       }
   }
   EOF
   ```

## Ground rules for every exercise in this track

- **Type your answers** in the editor pane. Typing is the point — the
  reference is for comparison, not copying.
- **Be specific.** Count words if it helps: a spec that fits in a tweet is
  a guess; a spec you could hand to a junior engineer is a contract.
- **Verify before you judge.** If the exercise asks you to critique AI output,
  only critique what you can *see* in the snippet — don't assume the tool
  "meant" something else.
- **Mark solved** only when your answer has all the elements the reference
  lists, not when it reads the same.

## If you want to try it live

Use your real AI tool on the exercises in Phase 2 onward — paste your prompt
into the agent, see what it produces, and compare against the reference
prompt. The app is a gym; your real editor is the field.
