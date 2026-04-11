declare module "prompt-sync" {
  export interface PromptOptions {
    sigint?: boolean;
    echo?: string;
  }

  export interface Prompt {
    (question: string, options?: PromptOptions): string | undefined;
  }

  function promptSync(options?: PromptOptions): Prompt;

  export default promptSync;
}
